<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import type { Asset, Entry, PageAppSDK } from "@contentful/app-sdk";

defineOptions({ name: "ContentfulAdmin" });

const props = defineProps<{ sdk: PageAppSDK }>();
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const categories = ["Architecture", "Nature", "Portrait"];

interface FormState {
  location: string;
  date: string;
  category: string;
  alt: string;
}

interface ManagedPhoto {
  id: string;
  entry: Entry;
  assetId: string;
  imageUrl: string;
  location: string;
  date: string;
  category: string;
  alt: string;
}

interface EntryCollection {
  items: Entry[];
  includes?: { Asset?: Asset[] };
}

const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const fileError = ref("");
const error = ref("");
const success = ref("");
const uploading = ref(false);
const progress = ref(0);
const phase = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const mode = ref<"upload" | "manage">("upload");
const managedPhotos = ref<ManagedPhoto[]>([]);
const manageSearch = ref("");
const manageLoading = ref(false);
const selectedPhoto = ref<ManagedPhoto | null>(null);
const originalForm = ref<FormState | null>(null);
const form = reactive<FormState>({ location: "", date: "", category: "", alt: "" });

const filteredPhotos = computed(() => {
  const query = manageSearch.value.trim().toLowerCase();
  if (!query) return managedPhotos.value;
  return managedPhotos.value.filter((photo) =>
    [photo.location, photo.category, photo.alt].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
});

const hasUnsavedChanges = computed(() => {
  if (selectedFile.value) return true;
  if (selectedPhoto.value && originalForm.value) return !sameForm(form, originalForm.value);
  return Object.values(form).some(Boolean);
});

function emptyForm(): FormState {
  return { location: "", date: "", category: "", alt: "" };
}

function sameForm(left: FormState, right: FormState): boolean {
  return left.location === right.location
    && left.date === right.date
    && left.category === right.category
    && left.alt === right.alt;
}

function setForm(values: FormState): void {
  form.location = values.location;
  form.date = values.date;
  form.category = values.category;
  form.alt = values.alt;
}

function resetForm(): void {
  setForm(emptyForm());
}

function getLocalizedValue(entry: Entry, fieldName: string, locale: string): unknown {
  const fields = entry.fields as Record<string, unknown>;
  const field = fields[fieldName];
  if (!field || typeof field !== "object" || Array.isArray(field)) return field;
  const localized = field as Record<string, unknown>;
  return localized[locale] ?? Object.values(localized)[0];
}

function getStringField(entry: Entry, fieldName: string, locale: string): string {
  const value = getLocalizedValue(entry, fieldName, locale);
  return typeof value === "string" ? value : "";
}

function richTextToText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const node = value as Record<string, unknown>;
  if (typeof node.value === "string") return node.value;
  const content = node.content;
  if (!Array.isArray(content)) return "";
  return content.map((child) => richTextToText(child)).join(" ").trim();
}

function getAltField(entry: Entry, locale: string): string {
  return richTextToText(getLocalizedValue(entry, "alt", locale));
}

function getSourceAssetId(entry: Entry, locale: string): string {
  const source = getLocalizedValue(entry, "src", locale);
  if (!source || typeof source !== "object") return "";
  const sys = (source as Record<string, unknown>).sys;
  if (!sys || typeof sys !== "object") return "";
  const id = (sys as Record<string, unknown>).id;
  return typeof id === "string" ? id : "";
}

function getAssetUrl(asset: Asset | undefined, locale: string): string {
  const url = asset?.fields.file[locale]?.url;
  return url ? `https:${url}` : "";
}

function getPhotoType(asset: Asset, locale: string): "portrait" | "landscape" | "square" {
  const details = asset.fields.file[locale]?.details as
    | { image?: { width?: number; height?: number } }
    | undefined;
  const width = details?.image?.width ?? 0;
  const height = details?.image?.height ?? 0;
  return height > width ? "portrait" : width > height ? "landscape" : "square";
}

function altDocument(value: string): object {
  return {
    nodeType: "document",
    data: {},
    content: [{
      nodeType: "paragraph",
      data: {},
      content: [{ nodeType: "text", value, marks: [], data: {} }],
    }],
  };
}

function setLocalizedField(
  fields: Record<string, unknown>,
  fieldName: string,
  locale: string,
  value: unknown,
): void {
  const existing = fields[fieldName];
  const localized = existing && typeof existing === "object" && !Array.isArray(existing)
    ? existing as Record<string, unknown>
    : {};
  fields[fieldName] = { ...localized, [locale]: value };
}

function getErrorMessage(caught: unknown, fallback: string): string {
  if (caught && typeof caught === "object" && "status" in caught) {
    const status = (caught as { status?: unknown }).status;
    if (status === 409) return "This photo changed elsewhere. Refresh and try again.";
  }
  return caught instanceof Error ? caught.message : fallback;
}

function replacePreview(file: File): void {
  if (!acceptedTypes.has(file.type)) {
    fileError.value = "Choose a JPEG, PNG, or WebP image.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    fileError.value = "Image must be 20 MB or smaller.";
    return;
  }
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  fileError.value = "";
  error.value = "";
  success.value = "";
}

function chooseFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) replacePreview(file);
  input.value = "";
}

function dropFile(event: DragEvent): void {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (file) replacePreview(file);
}

function removeFile(): void {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  selectedFile.value = null;
  previewUrl.value = "";
  fileError.value = "";
}

async function cleanupAsset(assetId: string): Promise<void> {
  try {
    const current = await props.sdk.cma.asset.get({ assetId });
    if (current.sys.publishedVersion !== undefined) await props.sdk.cma.asset.unpublish({ assetId }, current);
    await props.sdk.cma.asset.delete({ assetId });
  } catch {
    // Best-effort cleanup; Contentful owns the asset if cleanup is unavailable.
  }
}

async function createPublishedAsset(file: File, locale: string): Promise<Asset> {
  let uploadId: string | undefined;
  let asset: Asset | undefined;
  try {
    phase.value = "Uploading image...";
    const upload = await props.sdk.cma.upload.create({}, { file: await file.arrayBuffer() });
    uploadId = upload.sys.id;
    progress.value = 30;
    asset = await props.sdk.cma.asset.create({}, {
      fields: {
        title: { [locale]: file.name },
        file: {
          [locale]: {
            contentType: file.type,
            fileName: file.name,
            uploadFrom: { sys: { type: "Link", linkType: "Upload", id: uploadId } },
          },
        },
      },
    });
    progress.value = 50;
    phase.value = "Processing image...";
    const processed = await props.sdk.cma.asset.processForLocale(
      {},
      asset,
      locale,
      { processingCheckWait: 500, processingCheckRetries: 10 },
    );
    progress.value = 70;
    phase.value = "Publishing image...";
    return await props.sdk.cma.asset.publish({ assetId: processed.sys.id }, processed);
  } catch (caught) {
    if (asset) await cleanupAsset(asset.sys.id);
    else if (uploadId) {
      try {
        await props.sdk.cma.upload.delete({ uploadId });
      } catch {
        // Best-effort cleanup for an upload without an asset.
      }
    }
    throw caught;
  }
}

async function confirmDiscardChanges(): Promise<boolean> {
  if (!hasUnsavedChanges.value) return true;
  return props.sdk.dialogs.openConfirm({
    title: "Discard unsaved changes?",
    message: "Your current changes will be lost.",
    confirmLabel: "Discard",
    cancelLabel: "Keep editing",
    intent: "negative",
  });
}

function clearEditor(): void {
  selectedPhoto.value = null;
  originalForm.value = null;
  resetForm();
  removeFile();
}

async function loadManagedPhotos(): Promise<void> {
  manageLoading.value = true;
  error.value = "";
  try {
    const response = await props.sdk.cma.entry.getPublished({
      query: { content_type: "gallery", include: 1, limit: 100, order: "-fields.date" },
    });
    const collection = response as unknown as EntryCollection;
    const assets = new Map(
      (collection.includes?.Asset ?? []).map((asset) => [asset.sys.id, asset]),
    );
    const locale = props.sdk.locales.default;
    managedPhotos.value = collection.items.flatMap((entry) => {
      const id = entry.sys.id;
      if (!id) return [];
      const assetId = getSourceAssetId(entry, locale);
      return [{
        id,
        entry,
        assetId,
        imageUrl: getAssetUrl(assets.get(assetId), locale),
        location: getStringField(entry, "location", locale),
        date: getStringField(entry, "date", locale),
        category: getStringField(entry, "category", locale),
        alt: getAltField(entry, locale),
      }];
    });
  } catch (caught) {
    error.value = getErrorMessage(caught, "Could not load photos.");
  } finally {
    manageLoading.value = false;
  }
}

async function switchMode(nextMode: "upload" | "manage"): Promise<void> {
  if (mode.value === nextMode || !(await confirmDiscardChanges())) return;
  clearEditor();
  mode.value = nextMode;
  success.value = "";
  error.value = "";
  if (nextMode === "manage") await loadManagedPhotos();
}

async function selectPhoto(photo: ManagedPhoto): Promise<void> {
  if (selectedPhoto.value?.id === photo.id || !(await confirmDiscardChanges())) return;
  mode.value = "manage";
  selectedPhoto.value = photo;
  setForm({
    location: photo.location,
    date: photo.date,
    category: photo.category,
    alt: photo.alt,
  });
  originalForm.value = { ...form };
  removeFile();
  error.value = "";
  success.value = "";
}

async function cancelEdit(): Promise<void> {
  if (!(await confirmDiscardChanges())) return;
  clearEditor();
  success.value = "";
  error.value = "";
}

async function submitUpload(): Promise<void> {
  if (!selectedFile.value) return;
  uploading.value = true;
  progress.value = 5;
  error.value = "";
  success.value = "";
  const locale = props.sdk.locales.default;
  let newAsset: Asset | undefined;
  try {
    newAsset = await createPublishedAsset(selectedFile.value, locale);
    phase.value = "Publishing photo...";
    const entry = await props.sdk.cma.entry.create({ contentTypeId: "gallery" }, {
      fields: {
        location: { [locale]: form.location },
        date: { [locale]: form.date },
        type: { [locale]: getPhotoType(newAsset, locale) },
        category: { [locale]: form.category },
        alt: { [locale]: altDocument(form.alt) },
        src: { [locale]: { sys: { type: "Link", linkType: "Asset", id: newAsset.sys.id } } },
      },
    });
    await props.sdk.cma.entry.publish({ entryId: entry.sys.id }, entry);
    progress.value = 100;
    resetForm();
    removeFile();
    success.value = "Photo published successfully.";
    props.sdk.notifier.success("Photo published");
  } catch (caught) {
    error.value = getErrorMessage(caught, "Upload failed");
    if (newAsset) await cleanupAsset(newAsset.sys.id);
  } finally {
    uploading.value = false;
    phase.value = "";
  }
}

async function submitEdit(): Promise<void> {
  const photo = selectedPhoto.value;
  if (!photo) return;
  if (selectedFile.value) {
    const confirmed = await props.sdk.dialogs.openConfirm({
      title: "Replace this image?",
      message: "The current image will be replaced after the new image is published.",
      confirmLabel: "Replace image",
      cancelLabel: "Cancel",
      intent: "negative",
    });
    if (!confirmed) return;
  }

  uploading.value = true;
  progress.value = 10;
  phase.value = "Saving changes...";
  error.value = "";
  success.value = "";
  const locale = props.sdk.locales.default;
  let newAsset: Asset | undefined;
  try {
    const currentEntry = await props.sdk.cma.entry.get({ entryId: photo.id }) as unknown as Entry;
    const oldAssetId = getSourceAssetId(currentEntry, locale);
    const fields = { ...(currentEntry.fields as Record<string, unknown>) };
    setLocalizedField(fields, "location", locale, form.location);
    setLocalizedField(fields, "date", locale, form.date);
    setLocalizedField(fields, "category", locale, form.category);
    setLocalizedField(fields, "alt", locale, altDocument(form.alt));

    if (selectedFile.value) {
      newAsset = await createPublishedAsset(selectedFile.value, locale);
      setLocalizedField(fields, "type", locale, getPhotoType(newAsset, locale));
      setLocalizedField(fields, "src", locale, {
        sys: { type: "Link", linkType: "Asset", id: newAsset.sys.id },
      });
    }

    progress.value = 80;
    phase.value = "Publishing changes...";
    const updatedEntry = await props.sdk.cma.entry.update(
      { entryId: photo.id },
      { ...currentEntry, fields },
    );
    const publishedEntry = await props.sdk.cma.entry.publish(
      { entryId: photo.id },
      updatedEntry,
    );
    if (newAsset && oldAssetId && oldAssetId !== newAsset.sys.id) {
      await cleanupAsset(oldAssetId);
    }
    progress.value = 100;
    const updatedPhoto: ManagedPhoto = {
      ...photo,
      entry: publishedEntry as unknown as Entry,
      assetId: newAsset?.sys.id ?? photo.assetId,
      imageUrl: newAsset ? getAssetUrl(newAsset, locale) : photo.imageUrl,
      location: form.location,
      date: form.date,
      category: form.category,
      alt: form.alt,
    };
    const index = managedPhotos.value.findIndex((item) => item.id === photo.id);
    if (index >= 0) managedPhotos.value[index] = updatedPhoto;
    managedPhotos.value.sort((left, right) => right.date.localeCompare(left.date));
    selectedPhoto.value = updatedPhoto;
    originalForm.value = { ...form };
    removeFile();
    success.value = "Photo saved successfully.";
    props.sdk.notifier.success("Photo saved");
  } catch (caught) {
    error.value = getErrorMessage(caught, "Could not save photo.");
    if (newAsset) await cleanupAsset(newAsset.sys.id);
  } finally {
    uploading.value = false;
    phase.value = "";
  }
}

async function submit(): Promise<void> {
  if (mode.value === "manage") await submitEdit();
  else await submitUpload();
}

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  if (!hasUnsavedChanges.value) return;
  event.preventDefault();
  event.returnValue = "";
}

onMounted(() => window.addEventListener("beforeunload", handleBeforeUnload));

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <main class="min-h-screen bg-surface px-6 py-10 text-on-surface md:px-12">
    <div class="mx-auto max-w-4xl">
      <p class="text-label-sm font-label-sm text-secondary uppercase">Shutter Down</p>
      <h1 class="mt-2 text-headline-lg font-headline-lg text-primary">Photo management</h1>
      <p class="mt-2 text-body-md font-body-md text-secondary">Publish new photos or update the gallery.</p>

      <nav class="mt-8 flex gap-6 border-b border-outline-variant" aria-label="Photo management">
        <button
          type="button"
          class="border-b-2 px-1 pb-3 text-label-md font-label-md"
          :class="mode === 'upload' ? 'border-primary text-primary' : 'border-transparent text-secondary'"
          :aria-selected="mode === 'upload'"
          @click="switchMode('upload')"
        >
          Upload
        </button>
        <button
          type="button"
          class="border-b-2 px-1 pb-3 text-label-md font-label-md"
          :class="mode === 'manage' ? 'border-primary text-primary' : 'border-transparent text-secondary'"
          :aria-selected="mode === 'manage'"
          @click="switchMode('manage')"
        >
          Manage
        </button>
      </nav>

      <input
        ref="fileInput"
        class="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        @change="chooseFile"
      />

      <form v-if="mode === 'upload'" class="mt-10 grid gap-7" @submit.prevent="submit">
        <div class="grid gap-7 md:grid-cols-2">
          <div>
            <label for="contentful-photo-location" class="text-label-sm font-label-sm text-primary">Location</label>
            <input id="contentful-photo-location" v-model="form.location" required class="mt-2 w-full rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" />
          </div>
          <div>
            <label for="contentful-photo-date" class="text-label-sm font-label-sm text-primary">Date</label>
            <input id="contentful-photo-date" v-model="form.date" required type="date" class="mt-2 w-full rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" />
          </div>
        </div>
        <div class="grid gap-7 md:grid-cols-2">
          <div>
            <label for="contentful-photo-category" class="text-label-sm font-label-sm text-primary">Category</label>
            <select id="contentful-photo-category" v-model="form.category" required class="mt-2 w-full rounded-md border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary">
              <option value="" disabled>Select a category</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <div>
            <label for="contentful-photo-alt" class="text-label-sm font-label-sm text-primary">Alt text</label>
            <textarea id="contentful-photo-alt" v-model="form.alt" required rows="1" class="mt-2 w-full resize-y rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" placeholder="Describe the image"></textarea>
          </div>
        </div>
        <div>
          <p class="text-label-sm font-label-sm text-primary">Image</p>
          <button v-if="!selectedFile" type="button" class="mt-2 flex min-h-64 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright px-6 text-center hover:border-primary" @click="fileInput?.click()" @dragover.prevent @drop="dropFile">
            <span class="material-symbols-outlined text-4xl">upload</span>
            <span class="mt-3 text-body-md font-body-md text-primary">Drag and drop one image here</span>
            <span class="mt-1 text-label-sm font-label-sm text-secondary">or choose a JPEG, PNG, or WebP up to 20 MB</span>
          </button>
          <div v-else class="mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-bright">
            <img :src="previewUrl" alt="Selected upload preview" class="max-h-[32rem] w-full object-contain" />
            <div class="flex items-center justify-between gap-4 p-4">
              <p class="min-w-0 truncate text-label-md font-label-md text-primary">{{ selectedFile.name }}</p>
              <button type="button" class="shrink-0 text-label-sm font-label-sm text-secondary underline" @click="removeFile">Remove</button>
            </div>
          </div>
          <p v-if="fileError" class="mt-2 text-label-md font-label-md text-error" role="alert">{{ fileError }}</p>
        </div>
        <div v-if="uploading" aria-live="polite">
          <div class="mb-2 flex justify-between text-label-sm font-label-sm text-secondary"><span>{{ phase }}</span><span>{{ progress }}%</span></div>
          <progress class="h-2 w-full accent-primary" :value="progress" max="100" />
        </div>
        <p v-if="error" class="text-label-md font-label-md text-error" role="alert">{{ error }}</p>
        <p v-if="success" class="text-label-md font-label-md text-green-700" role="status">{{ success }}</p>
        <button type="submit" class="w-full rounded-md bg-primary px-5 py-4 text-label-md font-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-50" :disabled="uploading || !selectedFile || !form.location || !form.date || !form.category || !form.alt">
          {{ uploading ? "Publishing..." : "Upload to Contentful" }}
        </button>
      </form>

      <section v-else class="mt-8 grid gap-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="min-w-0 flex-1">
            <label for="contentful-photo-search" class="text-label-sm font-label-sm text-primary">Search photos</label>
            <input id="contentful-photo-search" v-model="manageSearch" type="search" placeholder="Location, category, or alt text" class="mt-2 w-full rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" />
          </div>
          <button type="button" class="rounded-md border border-outline px-5 py-3 text-label-md font-label-md text-primary" :disabled="manageLoading" @click="loadManagedPhotos">Refresh</button>
        </div>

        <p v-if="manageLoading" class="py-8 text-center text-body-md font-body-md text-secondary">Loading photos...</p>
        <div v-else class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="photo in filteredPhotos"
            :key="photo.id"
            type="button"
            class="flex items-center gap-4 rounded-xl border p-3 text-left transition hover:border-primary"
            :class="selectedPhoto?.id === photo.id ? 'border-primary' : 'border-outline-variant'"
            @click="selectPhoto(photo)"
          >
            <img v-if="photo.imageUrl" :src="photo.imageUrl" :alt="photo.alt" class="h-20 w-20 rounded-md object-cover" />
            <span v-else class="flex h-20 w-20 items-center justify-center rounded-md bg-surface-container text-secondary">No image</span>
            <span class="min-w-0">
              <span class="block truncate text-label-md font-label-md text-primary">{{ photo.location }}</span>
              <span class="mt-1 block text-label-sm font-label-sm text-secondary">{{ photo.category }} · {{ photo.date }}</span>
            </span>
          </button>
        </div>
        <p v-if="!manageLoading && filteredPhotos.length === 0" class="py-8 text-center text-body-md font-body-md text-secondary">No published photos found.</p>

        <form v-if="selectedPhoto" class="grid gap-7 border-t border-outline-variant pt-8" @submit.prevent="submit">
          <div>
            <h2 class="text-headline-lg font-headline-lg text-primary">Edit photo</h2>
            <p class="mt-1 text-body-md font-body-md text-secondary">Changes publish immediately.</p>
          </div>
          <div class="grid gap-7 md:grid-cols-2">
            <div>
              <label for="edit-photo-location" class="text-label-sm font-label-sm text-primary">Location</label>
              <input id="edit-photo-location" v-model="form.location" required class="mt-2 w-full rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" />
            </div>
            <div>
              <label for="edit-photo-date" class="text-label-sm font-label-sm text-primary">Date</label>
              <input id="edit-photo-date" v-model="form.date" required type="date" class="mt-2 w-full rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary" />
            </div>
          </div>
          <div class="grid gap-7 md:grid-cols-2">
            <div>
              <label for="edit-photo-category" class="text-label-sm font-label-sm text-primary">Category</label>
              <select id="edit-photo-category" v-model="form.category" required class="mt-2 w-full rounded-md border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary">
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
            </div>
            <div>
              <label for="edit-photo-alt" class="text-label-sm font-label-sm text-primary">Alt text</label>
              <textarea id="edit-photo-alt" v-model="form.alt" required rows="1" class="mt-2 w-full resize-y rounded-md border border-outline-variant px-4 py-3 outline-none focus:border-primary"></textarea>
            </div>
          </div>
          <div>
            <p class="text-label-sm font-label-sm text-primary">Image</p>
            <div v-if="selectedFile" class="mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-bright">
              <img :src="previewUrl" alt="Replacement image preview" class="max-h-[32rem] w-full object-contain" />
              <div class="flex items-center justify-between gap-4 p-4">
                <p class="min-w-0 truncate text-label-md font-label-md text-primary">{{ selectedFile.name }}</p>
                <button type="button" class="shrink-0 text-label-sm font-label-sm text-secondary underline" @click="removeFile">Remove</button>
              </div>
            </div>
            <button v-else type="button" class="mt-2 flex min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant bg-surface-bright px-6 text-center hover:border-primary" @click="fileInput?.click()" @dragover.prevent @drop="dropFile">
              <img v-if="selectedPhoto.imageUrl" :src="selectedPhoto.imageUrl" :alt="selectedPhoto.alt" class="max-h-48 max-w-full rounded-md object-contain" />
              <span class="text-label-sm font-label-sm text-secondary">Drop a replacement image here or choose one</span>
            </button>
            <p v-if="fileError" class="mt-2 text-label-md font-label-md text-error" role="alert">{{ fileError }}</p>
          </div>
          <div v-if="uploading" aria-live="polite">
            <div class="mb-2 flex justify-between text-label-sm font-label-sm text-secondary"><span>{{ phase }}</span><span>{{ progress }}%</span></div>
            <progress class="h-2 w-full accent-primary" :value="progress" max="100" />
          </div>
          <p v-if="error" class="text-label-md font-label-md text-error" role="alert">{{ error }}</p>
          <p v-if="success" class="text-label-md font-label-md text-green-700" role="status">{{ success }}</p>
          <div class="flex flex-col gap-3 sm:flex-row-reverse">
            <button type="submit" class="flex-1 rounded-md bg-primary px-5 py-4 text-label-md font-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-50" :disabled="uploading || !form.location || !form.date || !form.category || !form.alt">
              {{ uploading ? "Saving..." : "Save changes" }}
            </button>
            <button type="button" class="flex-1 rounded-md border border-outline px-5 py-4 text-label-md font-label-md text-primary disabled:opacity-50" :disabled="uploading" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>
