const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data,
      };
    }

    return {
      success: true,
      message: data.message || 'Success',
      data: data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error',
      error,
    };
  }
}

export async function apiPost<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

export async function apiPut<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  });
}

// FormData upload for file uploads
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data,
      };
    }

    return {
      success: true,
      message: data.message || 'Success',
      data: data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error',
      error,
    };
  }
}

// FormData upload for PUT requests (e.g., updating with files)
export async function apiPutFormData<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data,
      };
    }

    return {
      success: true,
      message: data.message || 'Success',
      data: data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error',
      error,
    };
  }
}

