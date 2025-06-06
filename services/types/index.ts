// API base URL from DuckyCart API
export const API_BASE_URL = "https://api.duckycart.me";

// User related types
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Checklist related types
export interface ChecklistItemCreate {
  text: string;
  checked: boolean;
}

export interface ChecklistItemUpdate {
  text?: string;
  checked?: boolean;
}

export interface ChecklistItem {
  id: number;
  text: string;
  checked: boolean;
  checklist_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistCreate {
  name: string;
  items?: ChecklistItemCreate[];
}

export interface ChecklistUpdate {
  name: string;
}

export interface Checklist {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  items: ChecklistItem[];
}
