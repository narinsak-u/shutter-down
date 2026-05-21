export interface Photo {
  id: string;
  src: string;
  alt: string;
  location: string;
  date: string;
  type: "portrait" | "landscape" | "square";
  category: string;
}
