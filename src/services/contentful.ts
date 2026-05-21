import * as contentful from "contentful";
import type { Photo } from "@/types/gallery";

const client = contentful.createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE as string,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN as string,
});

const VALID_TYPES = new Set(["portrait", "landscape", "square"]);

function validateType(value: string): Photo["type"] {
  if (VALID_TYPES.has(value)) return value as Photo["type"];
  return "square";
}

function extractTextFromRichText(doc: unknown): string {
  if (!doc || typeof doc !== "object") return "";

  const node = doc as Record<string, unknown>;
  const content = node.content as Array<Record<string, unknown>> | undefined;

  if (!content) {
    const value = node.value;
    return typeof value === "string" ? value : "";
  }

  return content
    .map((child) => extractTextFromRichText(child))
    .join(" ")
    .trim();
}

function getAltText(alt: unknown): string {
  if (!alt) return "";
  if (typeof alt === "string") return alt;
  return extractTextFromRichText(alt);
}

function formatDate(raw: string): string {
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${month}, ${date.getFullYear()}`;
}

export async function fetchPhotos(): Promise<Photo[]> {
  const response = await client.getEntries({
    content_type: "gallery",
  });

  return response.items.map((entry) => {
    const fields = entry.fields as Record<string, unknown>;
    const srcField = fields.src as
      | { fields?: { file?: { url?: string } } }
      | undefined;
    const imageUrl = srcField?.fields?.file?.url ?? "";

    return {
      id: entry.sys.id,
      src: imageUrl ? `https:${imageUrl}` : "",
      alt: getAltText(fields.alt),
      location: fields.location as string,
      date: formatDate(fields.date as string),
      type: validateType(fields.type as string),
      category: fields.category as string,
    };
  });
}
