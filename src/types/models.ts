export enum Segment {
  PF = 'PF',
  PJ = 'PJ',
}

export enum Channel {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

export interface Screenshot {
  id: number;
  type?: string;
  name?: string;
  description?: string;
  url: string;
  position: number;
  journeyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Journey {
  id: number;
  name: string;
  segment: Segment;
  channel: Channel;
  productVariantId: number;
  institutionId: number;
  screenshots: Screenshot[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  productId: number;
  journeys: Journey[];
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: number;
  name: string;
  logo: string;
  sector: string;
  journeys: Journey[];
  createdAt: string;
  updatedAt: string;
}
