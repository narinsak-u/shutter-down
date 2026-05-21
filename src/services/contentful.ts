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

export async function fetchPhotos(): Promise<Photo[]> {
  const response = await client.withoutUnresolvableLinks.getEntries({
    content_type: "gallery",
  });

  return response.items.map((entry) => {
    const fields = entry.fields as Record<string, unknown>;
    const image = fields.image as
      | { fields?: { file?: { url?: string } } }
      | undefined;
    const imageUrl = image?.fields?.file?.url ?? "";
    return {
      id: entry.sys.id,
      src: imageUrl ? `https:${imageUrl}` : "",
      alt: fields.alt as string,
      location: fields.location as string,
      date: fields.date as string,
      type: validateType(fields.type as string),
      category: fields.category as string,
    };
  });
}
