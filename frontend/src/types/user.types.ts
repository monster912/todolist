export type Theme = 'light' | 'dark';
export type Locale = 'ko' | 'en';

export interface User {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  theme: Theme;
  locale: Locale;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface UpdateMeInput {
  name?: string;
  current_password?: string;
  new_password?: string;
}

export interface DeleteMeInput {
  password: string;
}

export interface UpdateSettingsInput {
  theme?: Theme;
  locale?: Locale;
}
