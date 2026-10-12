export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          date: string;
          title: string;
          category: string;
          amount: number;
          type: string;
          payment_method: string;
          created_at: string;
        };
        Insert: {
          id: string;
          date: string;
          title: string;
          category: string;
          amount: number;
          type: string;
          payment_method: string;
          created_at: string;
        };
        Update: Partial<{
          date: string;
          title: string;
          category: string;
          amount: number;
          type: string;
          payment_method: string;
        }>;
      };
      budgets: {
        Row: {
          id: string;
          category: string;
          limit_amount: number;
        };
        Insert: {
          id?: string;
          category: string;
          limit_amount: number;
        };
        Update: Partial<{
          category: string;
          limit_amount: number;
        }>;
      };
      recurring_rules: {
        Row: {
          id: string;
          title: string;
          amount: number;
          category: string;
          type: string;
          payment_method: string;
          frequency: string;
          next_date: string;
          end_date: string | null;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          amount: number;
          category: string;
          type: string;
          payment_method: string;
          frequency: string;
          next_date: string;
          end_date?: string | null;
          enabled: boolean;
          created_at: string;
        };
        Update: Partial<{
          title: string;
          amount: number;
          category: string;
          type: string;
          payment_method: string;
          frequency: string;
          next_date: string;
          end_date: string | null;
          enabled: boolean;
        }>;
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: string;
        };
        Update: Partial<{
          key: string;
          value: string;
        }>;
      };
    };
  };
}
