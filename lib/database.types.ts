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
            profiles: {
                Row: {
                    id: string
                    email: string
                    name: string
                    role: 'owner' | 'tenant'
                    avatar_url: string | null
                    phone: string | null
                    cpf: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    role: 'owner' | 'tenant'
                    avatar_url?: string | null
                    phone?: string | null
                    cpf?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    role?: 'owner' | 'tenant'
                    avatar_url?: string | null
                    phone?: string | null
                    cpf?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            properties: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    address: string
                    status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO'
                    price: number
                    area: number
                    image_url: string | null
                    description: string | null
                    bedrooms: number | null
                    bathrooms: number | null
                    parking_spaces: number | null
                    latitude: number | null
                    longitude: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    name: string
                    address: string
                    status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO'
                    price: number
                    area: number
                    image_url?: string | null
                    description?: string | null
                    bedrooms?: number | null
                    bathrooms?: number | null
                    parking_spaces?: number | null
                    latitude?: number | null
                    longitude?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    name?: string
                    address?: string
                    status?: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO'
                    price?: number
                    area?: number
                    image_url?: string | null
                    description?: string | null
                    bedrooms?: number | null
                    bathrooms?: number | null
                    parking_spaces?: number | null
                    latitude?: number | null
                    longitude?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            contracts: {
                Row: {
                    id: string
                    property_id: string
                    tenant_id: string
                    start_date: string
                    end_date: string
                    monthly_value: number
                    status: 'active' | 'draft' | 'ended'
                    pdf_url: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    tenant_id: string
                    start_date: string
                    end_date: string
                    monthly_value: number
                    status: 'active' | 'draft' | 'ended'
                    pdf_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string
                    tenant_id?: string
                    start_date?: string
                    end_date?: string
                    monthly_value?: number
                    status?: 'active' | 'draft' | 'ended'
                    pdf_url?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    contract_id: string
                    due_date: string
                    paid_date: string | null
                    amount: number
                    status: 'pending' | 'paid' | 'late' | 'cancelled'
                    payment_method: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    contract_id: string
                    due_date: string
                    paid_date?: string | null
                    amount: number
                    status: 'pending' | 'paid' | 'late' | 'cancelled'
                    payment_method?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    contract_id?: string
                    due_date?: string
                    paid_date?: string | null
                    amount?: number
                    status?: 'pending' | 'paid' | 'late' | 'cancelled'
                    payment_method?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            maintenance_requests: {
                Row: {
                    id: string
                    property_id: string
                    tenant_id: string
                    title: string
                    description: string
                    category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'other'
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    images: string[] | null
                    scheduled_date: string | null
                    completed_date: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    property_id: string
                    tenant_id: string
                    title: string
                    description: string
                    category: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'other'
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    images?: string[] | null
                    scheduled_date?: string | null
                    completed_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string
                    tenant_id?: string
                    title?: string
                    description?: string
                    category?: 'plumbing' | 'electrical' | 'structural' | 'appliance' | 'other'
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    images?: string[] | null
                    scheduled_date?: string | null
                    completed_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    sender_id: string
                    recipient_id: string
                    subject: string
                    content: string
                    is_read: boolean
                    parent_message_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    sender_id: string
                    recipient_id: string
                    subject: string
                    content: string
                    is_read?: boolean
                    parent_message_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    sender_id?: string
                    recipient_id?: string
                    subject?: string
                    content?: string
                    is_read?: boolean
                    parent_message_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    message: string
                    type: 'payment' | 'maintenance' | 'contract' | 'message' | 'system'
                    is_read: boolean
                    link: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    message: string
                    type: 'payment' | 'maintenance' | 'contract' | 'message' | 'system'
                    is_read?: boolean
                    link?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    message?: string
                    type?: 'payment' | 'maintenance' | 'contract' | 'message' | 'system'
                    is_read?: boolean
                    link?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            properties_with_tenant: {
                Row: {
                    id: string
                    owner_id: string
                    name: string
                    address: string
                    status: 'DISPONÍVEL' | 'ALUGADO' | 'MANUTENÇÃO'
                    price: number
                    area: number
                    image_url: string | null
                    description: string | null
                    bedrooms: number | null
                    bathrooms: number | null
                    parking_spaces: number | null
                    latitude: number | null
                    longitude: number | null
                    created_at: string
                    updated_at: string
                    contract_id: string | null
                    tenant_id: string | null
                    tenant_name: string | null
                    tenant_email: string | null
                    tenant_phone: string | null
                    start_date: string | null
                    end_date: string | null
                    monthly_value: number | null
                }
            }
            pending_payments: {
                Row: {
                    id: string
                    contract_id: string
                    due_date: string
                    paid_date: string | null
                    amount: number
                    status: 'pending' | 'paid' | 'late' | 'cancelled'
                    payment_method: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                    property_id: string
                    tenant_id: string
                    tenant_name: string
                    property_name: string
                    owner_id: string
                }
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}