// Mock API implementation - replace with real API calls
const API_BASE_URL = {
  orders: "http://localhost:8000/api/v1",
  auth: "http://localhost:8001/api/v1",
  products: "http://localhost:8002/api/v1",
  payment: "http://localhost:8003/api/v1",
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))


interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
  };
}

// Auth token key constant
export const AUTH_TOKEN_KEY = 'auth_token';

// Token expiration time in milliseconds (30 minutes)
const TOKEN_EXPIRATION_TIME = 30 * 60 * 1000;

// Helper function to check if token is expired
const isTokenExpired = (tokenTimestamp: number | null): boolean => {
  if (!tokenTimestamp) return true;
  return Date.now() >= tokenTimestamp;
};

// Helper function to get auth headers with token expiration check
const getAuthHeaders = async (tokenTimestamp: number | null, requireAuth: boolean = true): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = authApi.getStoredToken();
  
  if (requireAuth) {
    if (!token) {
      authApi.clearToken();
      throw new Error('Session expired. Please login again.');
    }

    // Check if token is expired
    if (!tokenTimestamp || Date.now() >= tokenTimestamp) {
      try {
        // Try to verify token before clearing it
        await authApi.verifyToken(token);
        // If verification succeeds, update timestamp
        authApi.setTokenTimestamp();
      } catch (error) {
        authApi.clearToken();
        throw new Error('Session expired. Please login again.');
      }
    }

    headers['Authorization'] = `Bearer ${token}`;
  } else if (token && !isTokenExpired(tokenTimestamp)) {
    // For public endpoints, include token if available but don't require it
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL.auth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Invalid credentials');
    }

    const data: LoginResponse = await response.json();
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
    this.setTokenTimestamp();
    return data;
  },

  async verifyToken(token: string): Promise<LoginResponse['user']> {
    try {
      // First try the /verify endpoint
      const response = await fetch(`${API_BASE_URL.auth}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }

      // If /verify fails, try /verify-token as fallback
      const fallbackResponse = await fetch(`${API_BASE_URL.auth}/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!fallbackResponse.ok) {
        throw new Error('Token verification failed');
      }

      const fallbackData = await fallbackResponse.json();
      return fallbackData.user;
    } catch (error) {
      // Clear token on any verification error
      this.clearToken();
      throw new Error('Session expired. Please login again.');
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(`${AUTH_TOKEN_KEY}_timestamp`);
  },

  getTokenTimestamp(): number | null {
    const timestamp = localStorage.getItem(`${AUTH_TOKEN_KEY}_timestamp`);
    return timestamp ? parseInt(timestamp, 10) : null;
  },

  setTokenTimestamp(): void {
    const expirationTime = Date.now() + TOKEN_EXPIRATION_TIME;
    localStorage.setItem(`${AUTH_TOKEN_KEY}_timestamp`, expirationTime.toString());
  },
};

// Define the product type based on the API response
interface Category {
  id: number;
  name: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  category: Category;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export const productsApi = {
  async getProducts(params?: { 
    search?: string; 
    category?: number;
    page?: number; 
    limit?: number 
  }): Promise<ProductsResponse> {
    // Set default values and validate
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(1000, Math.max(1, params?.limit || 10));

    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category_id', params.category.toString());
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    try {
      // Product listing is public, so requireAuth is false
      const headers = await getAuthHeaders(authApi.getTokenTimestamp(), false);
      const response = await fetch(`${API_BASE_URL.products}/products?${queryParams.toString()}`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          authApi.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch products');
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Failed to fetch products');
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      // Product details are public
      const headers = await getAuthHeaders(authApi.getTokenTimestamp(), false);
      const response = await fetch(`${API_BASE_URL.products}/products/${id}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          authApi.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Product not found');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Failed to fetch product');
    }
  },

  // Admin operations require authentication
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>) {
    try {
      const headers = await getAuthHeaders(authApi.getTokenTimestamp(), true);
      const response = await fetch(`${API_BASE_URL.products}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        if (response.status === 401) {
          authApi.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error('Failed to create product');
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Failed to create product');
    }
  },

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'category'>>) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.products}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  },

  async deleteProduct(id: string) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.products}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return { success: true };
  },
};

// Order types based on backend schema
export enum OrderStatus {
  pending = "pending",
  completed = "completed",
  cancelled = "cancelled"
}

export interface Order {
  id: number;
  product_id: string;
  quantity: number;
  status: OrderStatus;
  user_id: number;
}

export interface CreateOrderRequest {
  product_id: string;
  quantity: number;
  user_id: number;
}

export const ordersApi = {
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const headers = await getAuthHeaders(authApi.getTokenTimestamp());
    const response = await fetch(`${API_BASE_URL.orders}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      if (response.status === 401) {
        authApi.clearToken();
        throw new Error('Session expired. Please login again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create order');
    }

    return response.json();
  },

  async getOrders(userId?: number): Promise<Order[]> {
    try {
      const headers = await getAuthHeaders(authApi.getTokenTimestamp());
      const url = userId 
        ? `${API_BASE_URL.orders}/orders/user/${userId}`
        : `${API_BASE_URL.orders}/orders`;

      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          authApi.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch orders');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Failed to fetch orders. Please try again.');
    }
  },

  async getOrder(orderId: number): Promise<Order> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.orders}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch order');
    }

    return response.json();
  },

  async updateOrder(orderId: number, order: CreateOrderRequest): Promise<Order> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.orders}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update order');
    }

    return response.json();
  },

  async deleteOrder(orderId: number): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.orders}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete order');
    }
  }
};

// Payment types based on backend schema
export enum PaymentStatus {
  successful = "successful",
  failed = "failed"
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  status: PaymentStatus;
  created_at: string;
  updated_at?: string;
}

export interface CreatePaymentRequest {
  order_id: number;
  amount: number;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  cvv: string;
}

export const paymentsApi = {
  async createPayment(payment: CreatePaymentRequest): Promise<Payment> {
    try {
      const headers = await getAuthHeaders(authApi.getTokenTimestamp(), true);
      const response = await fetch(`${API_BASE_URL.payment}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payment),
      });

      if (!response.ok) {
        if (response.status === 401) {
          authApi.clearToken();
          throw new Error('Session expired. Please login again.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to process payment');
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Session expired')) {
        throw error;
      }
      throw new Error('Failed to process payment');
    }
  },

  async getPayment(paymentId: number): Promise<Payment> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.payment}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch payment');
    }

    return response.json();
  },

  async getPaymentsByOrder(orderId: number): Promise<Payment[]> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL.payment}/payments/order/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch payments');
    }

    return response.json();
  }
};

