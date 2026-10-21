/**
 * Core data types for Desert Gold marketplace
 */

export interface Farm {
  id: string;
  name: string;
  region: string;
  country: string;
  established: number;
  certification: string[];
  image: string;
  description: string;
}

export interface DateVariety {
  id: string;
  name: string;
  scientificName: string;
  origin: string;
  description: string;
  flavor: string[];
  texture: string;
}

export interface Batch {
  id: string;
  varietyId: string;
  farmId: string;
  harvestDate: string;
  batchSize: number;
  gradeA: number;
  gradeB: number;
  inspection: InspectionData;
  certification: string;
}

export interface InspectionData {
  sugarContent: number; // Brix %
  moisture: number; // %
  size: 'small' | 'medium' | 'large';
  labTestDate: string;
  testResults: Record<string, string | number>;
  inspector: string;
}

export interface Product {
  id: string;
  batchId: string;
  name: string;
  variety: DateVariety;
  farm: Farm;
  weight: number; // grams
  price: number; // USD
  currency: 'USD';
  image: string;
  description: string;
  traceability: Batch;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  totalPrice: number;
}

export interface Producer {
  id: string;
  farmId: string;
  email: string;
  phone: string;
  batches: Batch[];
}
