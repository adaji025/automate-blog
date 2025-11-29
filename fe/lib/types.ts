// Blog Types
export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  slug: string;
  duration?: string;
  status: 'published' | 'pending';
  assets?: Array<{
    url: string;
    imgId: string;
  }>;
  canonicalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Contact Types
export interface Contact {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContactData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
  captcha?: string;
}

// Clutch Types
export interface Clutch {
  _id: string;
  fullName: string;
  email: string;
  service: string;
  profileLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClutchData {
  fullName: string;
  email: string;
  service: string;
  profileLink?: string;
}

// Admin Auth Types
export interface Admin {
  _id: string;
  email: string;
  fullName: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface PasswordResetData {
  email: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  admin: Admin;
}

