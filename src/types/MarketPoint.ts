export type MarketPoint = {
  id: number;
  lat: number;
  lng: number;
  label: string;
  category: string;
  description: string;
  fixedPrice: number;
  fixedWeight: number;
  weightUnit: string;
  currency: string;
  images: { id: number; url: string }[];
};