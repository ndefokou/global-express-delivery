export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            livreurs: {
                Row: {
                    id: string
                    name: string
                    phone: string
                    active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    phone: string
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    phone?: string
                    active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    role: 'admin' | 'livreur'
                    name: string
                    livreur_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role: 'admin' | 'livreur'
                    name: string
                    livreur_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'livreur'
                    name?: string
                    livreur_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            courses: {
                Row: {
                    id: string
                    type: 'livraison' | 'expedition'
                    livreur_id: string
                    date: string
                    completed: boolean
                    livraison_contact_name: string | null
                    livraison_contact_phone: string | null
                    livraison_quartier: string | null
                    livraison_articles: Json | null
                    livraison_delivery_fee: number | null
                    expedition_destination_city: string | null
                    expedition_contact_name: string | null
                    expedition_contact_phone: string | null
                    expedition_fee: number | null
                    expedition_validated: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    type: 'livraison' | 'expedition'
                    livreur_id: string
                    date?: string
                    completed?: boolean
                    livraison_contact_name?: string | null
                    livraison_contact_phone?: string | null
                    livraison_quartier?: string | null
                    livraison_articles?: Json | null
                    livraison_delivery_fee?: number | null
                    expedition_destination_city?: string | null
                    expedition_contact_name?: string | null
                    expedition_contact_phone?: string | null
                    expedition_fee?: number | null
                    expedition_validated?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    type?: 'livraison' | 'expedition'
                    livreur_id?: string
                    date?: string
                    completed?: boolean
                    livraison_contact_name?: string | null
                    livraison_contact_phone?: string | null
                    livraison_quartier?: string | null
                    livraison_articles?: Json | null
                    livraison_delivery_fee?: number | null
                    expedition_destination_city?: string | null
                    expedition_contact_name?: string | null
                    expedition_contact_phone?: string | null
                    expedition_fee?: number | null
                    expedition_validated?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            expenses: {
                Row: {
                    id: string
                    livreur_id: string
                    amount: number
                    description: string
                    date: string
                    validated: boolean
                    rejected_reason: string | null
                    rejected_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    livreur_id: string
                    amount: number
                    description: string
                    date?: string
                    validated?: boolean
                    rejected_reason?: string | null
                    rejected_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    livreur_id?: string
                    amount?: number
                    description?: string
                    date?: string
                    validated?: boolean
                    rejected_reason?: string | null
                    rejected_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            daily_payments: {
                Row: {
                    id: string
                    livreur_id: string
                    date: string
                    amount: number
                    expected_amount: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    livreur_id: string
                    date?: string
                    amount: number
                    expected_amount: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    livreur_id?: string
                    date?: string
                    amount?: number
                    expected_amount?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            manquants: {
                Row: {
                    id: string
                    livreur_id: string
                    type: 'undelivered_not_returned' | 'payment_shortage' | 'unvalidated_expense'
                    amount: number
                    description: string
                    date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    livreur_id: string
                    type: 'undelivered_not_returned' | 'payment_shortage' | 'unvalidated_expense'
                    amount: number
                    description: string
                    date?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    livreur_id?: string
                    type?: 'undelivered_not_returned' | 'payment_shortage' | 'unvalidated_expense'
                    amount?: number
                    description?: string
                    date?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            get_user_livreur_id: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
