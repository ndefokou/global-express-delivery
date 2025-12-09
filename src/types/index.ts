export type UserRole = "admin" | "livreur";

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Livreur {
  id: string;
  name: string;
  phone: string;
  password?: string;
  active: boolean;
  createdAt: string;
}

export interface Article {
  id: string;
  name: string;
  price: number;
  quantity: number;
  status: "delivered" | "not_delivered";
  reason?: string;
  returnedToAdmin?: boolean;
  returnValidatedBy?: string;
  returnValidatedAt?: string;
}

export interface Livraison {
  contactName: string;
  contactPhone?: string;
  quartier: string;
  articles: Article[];
  deliveryFee: number;
}

export interface Expedition {
  destinationCity: string;
  contactName?: string;
  contactPhone?: string;
  expeditionFee: number;
  validated: boolean;
}

export interface Course {
  id: string;
  type: "livraison" | "expedition";
  livreurId: string;
  date: string;
  livraison?: Livraison;
  expedition?: Expedition;
  completed: boolean;
}

export interface Expense {
  id: string;
  livreurId: string;
  amount: number;
  description: string;
  date: string;
  validated: boolean;
  rejectedReason?: string;
  rejectedAt?: string;
}

export interface DailyPayment {
  id: string;
  livreurId: string;
  date: string;
  amount: number;
  expectedAmount: number;
}

export interface Manquant {
  id: string;
  livreurId: string;
  type: "undelivered_not_returned" | "payment_shortage" | "unvalidated_expense";
  amount: number;
  description: string;
  date: string;
}
