<script setup lang="ts">
import { reactive, ref, onUnmounted } from "vue";
import type { Asset, PageAppSDK } from "@contentful/app-sdk";

defineOptions({ name: "ContentfulAdmin" });

const props = defineProps<{ sdk: PageAppSDK }>();
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const categories = ["Architecture", "Nature", "Portrait"];
const selectedFile = ref<File | null>(null);
const previewUrl = ref("");
const fileError = ref("");
const error = ref("");
const success = ref("");
const uploading = ref(false);
const progress = ref(0);
const phase = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const form = reactive({ location: "", date: "", category: "", alt: "" });

function getPhotoType(asset: Asset, locale: string): "portrait" | "landscape" | "square" {
  const details = asset.fields.file[locale]?.details as
    | { image?: { width?: number; height?: number } }
    | undefined;
  const width = details?.image?.width ?? 0;
  const height = details?.image?.height ?? 0;
  return height > width ? "portrait" : width > height ? "landscape" : "square";
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

async function submit(): Promise<void> {
  if (!selectedFile.value) return;
  uploading.value = true;
  progress.value = 5;
  phase.value = "Uploading image...";
  error.value = "";
  success.value = "";
  const locale = props.sdk.locales.default;
  let uploadId: string | undefined;
  let asset: Asset | undefined;

  try {
    const upload = await props.sdk.cma.upload.create({}, { file: await selectedFile.value.arrayBuffer() });
    uploadId = upload.sys.id;
    progress.value = 30;
    asset = await props.sdk.cma.asset.create({}, {
      fields: {
        title: { [locale]: selectedFile.value.name },
        file: {
          [locale]: {
            contentType: selectedFile.value.type,
            fileName: selectedFile.value.name,
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
    phase.value = "Publishing photo...";
    const publishedAsset = await props.sdk.cma.asset.publish({ assetId: processed.sys.id }, processed);
    const entry = await props.sdk.cma.entry.create({ contentTypeId: "gallery" }, {
      fields: {
        location: { [locale]: form.location },
        date: { [locale]: form.date },
        type: { [locale]: getPhotoType(processed, locale) },
        category: { [locale]: form.category },
        alt: { [locale]: altDocument(form.alt) },
        src: { [locale]: { sys: { type: "Link", linkType: "Asset", id: publishedAsset.sys.id } } },
      },
    });
    await props.sdk.cma.entry.publish({ entryId: entry.sys.id }, entry);
    progress.value = 100;
    form.location = "";
    form.date = "";
    form.category = "";
    form.alt = "";
    removeFile();
    success.value = "Photo published successfully.";
    props.sdk.notifier.success("Photo published");
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Upload failed";
    if (asset) {
      try {
        if (asset.sys.publishedVersion !== undefined) {
          await props.sdk.cma.asset.unpublish({ assetId: asset.sys.id }, asset);
        }
        await props.sdk.cma.asset.delete({ assetId: asset.sys.id });
      } catch {
        // Best-effort cleanup; Contentful owns the failed asset from here.
      }
    } else if (uploadId) {
      try {
        await props.sdk.cma.upload.delete({ uploadId });
      } catch {
        // Best-effort cleanup for an upload that was not associated with an asset.
      }
    }
  } finally {
    uploading.value = false;
    phase.value = "";
  }
}

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <main class="min-h-screen bg-surface px-6 py-10 text-on-surface md:px-12">
    <div class="mx-auto max-w-3xl">
      <p class="text-label-sm font-label-sm text-secondary uppercase">Shutter Down</p>
      <h1 class="mt-2 text-headline-lg font-headline-lg text-primary">Add a photo</h1>
      <p class="mt-2 text-body-md font-body-md text-secondary">Publish one photo directly to the gallery.</p>

      <form class="mt-10 grid gap-7" @submit.prevent="submit">
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
          <input ref="fileInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" @change="chooseFile" />
          <p v-if="fileError" class="mt-2 text-label-md font-label-md text-error" role="alert">{{ fileError }}</p>
        </div>

        <div v-if="uploading" aria-live="polite">
          <div class="mb-2 flex justify-between text-label-sm font-label-sm text-secondary">
            <span>{{ phase }}</span><span>{{ progress }}%</span>
          </div>
          <progress class="h-2 w-full accent-primary" :value="progress" max="100" />
        </div>
        <p v-if="error" class="text-label-md font-label-md text-error" role="alert">{{ error }}</p>
        <p v-if="success" class="text-label-md font-label-md text-green-700" role="status">{{ success }}</p>
        <button type="submit" class="w-full rounded-md bg-primary px-5 py-4 text-label-md font-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-50" :disabled="uploading || !selectedFile || !form.location || !form.date || !form.category || !form.alt">
          {{ uploading ? "Publishing..." : "Upload to Contentful" }}
        </button>
      </form>
    </div>
  </main>
</template>
