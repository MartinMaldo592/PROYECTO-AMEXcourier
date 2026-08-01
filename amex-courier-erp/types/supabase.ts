export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          department: string | null
          destination_agency: string | null
          district: string | null
          dni_back_url: string | null
          dni_front_url: string | null
          email: string | null
          id: string
          locker_code: string
          name: string
          phone: string | null
          preferred_carrier: string | null
          province: string | null
          tax_id: string
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          department?: string | null
          destination_agency?: string | null
          district?: string | null
          dni_back_url?: string | null
          dni_front_url?: string | null
          email?: string | null
          id?: string
          locker_code: string
          name: string
          phone?: string | null
          preferred_carrier?: string | null
          province?: string | null
          tax_id: string
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          department?: string | null
          destination_agency?: string | null
          district?: string | null
          dni_back_url?: string | null
          dni_front_url?: string | null
          email?: string | null
          id?: string
          locker_code?: string
          name?: string
          phone?: string | null
          preferred_carrier?: string | null
          province?: string | null
          tax_id?: string
        }
        Relationships: []
      }
      import_orders: {
        Row: {
          admin_fee_usd: number | null
          created_at: string | null
          customer_name: string
          freight_amount_usd: number | null
          id: string
          is_paid: boolean | null
          locker_code: string
          package_id: string | null
          paid_amount: number | null
          paid_at: string | null
          payment_currency: string | null
          payment_method: string | null
          payment_proof_url: string | null
          payment_reference: string | null
          total_amount_usd: number | null
        }
        Insert: {
          admin_fee_usd?: number | null
          created_at?: string | null
          customer_name: string
          freight_amount_usd?: number | null
          id?: string
          is_paid?: boolean | null
          locker_code: string
          package_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_reference?: string | null
          total_amount_usd?: number | null
        }
        Update: {
          admin_fee_usd?: number | null
          created_at?: string | null
          customer_name?: string
          freight_amount_usd?: number | null
          id?: string
          is_paid?: boolean | null
          locker_code?: string
          package_id?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          payment_currency?: string | null
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_reference?: string | null
          total_amount_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "import_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      package_tracking_logs: {
        Row: {
          event_description: string
          id: string
          location: string
          operator_username: string | null
          package_id: string | null
          timestamp: string | null
        }
        Insert: {
          event_description: string
          id?: string
          location: string
          operator_username?: string | null
          package_id?: string | null
          timestamp?: string | null
        }
        Update: {
          event_description?: string
          id?: string
          location?: string
          operator_username?: string | null
          package_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_tracking_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          current_location: string | null
          customer_id: string | null
          customs_consignee_name: string | null
          customs_dni: string | null
          declared_value_usd: number | null
          delivery_method: string | null
          delivery_status: string | null
          description: string | null
          id: string
          invoice_number: string | null
          invoice_pdf_url: string | null
          locker_code: string
          package_type: string | null
          shipment_id: string | null
          tracking_usa: string
          warehouse_receipt_number: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          customer_id?: string | null
          customs_consignee_name?: string | null
          customs_dni?: string | null
          declared_value_usd?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          locker_code: string
          package_type?: string | null
          shipment_id?: string | null
          tracking_usa: string
          warehouse_receipt_number: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          customer_id?: string | null
          customs_consignee_name?: string | null
          customs_dni?: string | null
          declared_value_usd?: number | null
          delivery_method?: string | null
          delivery_status?: string | null
          description?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          locker_code?: string
          package_type?: string | null
          shipment_id?: string | null
          tracking_usa?: string
          warehouse_receipt_number?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string | null
          destination_warehouse: string | null
          dispatched_from_miami_at: string | null
          id: string
          master_guide_code: string
          notes: string | null
          origin_warehouse: string | null
          partner_ref_number: string | null
          received_in_peru_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          destination_warehouse?: string | null
          dispatched_from_miami_at?: string | null
          id?: string
          master_guide_code: string
          notes?: string | null
          origin_warehouse?: string | null
          partner_ref_number?: string | null
          received_in_peru_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          destination_warehouse?: string | null
          dispatched_from_miami_at?: string | null
          id?: string
          master_guide_code?: string
          notes?: string | null
          origin_warehouse?: string | null
          partner_ref_number?: string | null
          received_in_peru_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          custom_permissions: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          password_hash: string
          role_name: string
          username: string
        }
        Insert: {
          created_at?: string | null
          custom_permissions?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          password_hash: string
          role_name: string
          username: string
        }
        Update: {
          created_at?: string | null
          custom_permissions?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          password_hash?: string
          role_name?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
