/** A gallery photo entry, mapped from Contentful `gallery` entries. */
export interface Photo {
  id: string;
  thumbSrc: string;
  src: string;
  /** Original Contentful asset dimensions used to reserve the thumbnail's aspect ratio. */
  imageWidth?: number;
  imageHeight?: number;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
  category: string;
}
