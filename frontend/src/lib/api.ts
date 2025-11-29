import { API_BASE_URL } from './constants';

// API client with error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized errors specifically, as suggested
      if (response.status === 401) {
        console.error('Authentication required. Consider redirecting to login.');
        // Optional: Redirect to login page or dispatch a logout action
        // window.location.href = '/login'; 
        throw new Error('401: Authentication credentials were not provided.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Test endpoint
export const testApi = {
  test: () => apiClient.get<any>('/healthcare/test/'),
};

// Healthcare API endpoints
export const healthcareApi = {
  // Patients
  patients: {
    list: () => apiClient.get<any[]>('/healthcare/patients/'),
    create: (data: any) => apiClient.post<any>('/healthcare/patients/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/patients/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/patients/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/patients/${id}/`),
  },

  // Visits (Queue Management)
  visits: {
    list: () => apiClient.get<any[]>('/healthcare/visits/'),
    create: (data: any) => apiClient.post<any>('/healthcare/visits/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/visits/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/visits/${id}/`, data),
    moveToStage: (id: string, data: any) => apiClient.post<any>(`/healthcare/visits/${id}/move_to_stage/`, data),
    getQueue: () => apiClient.get<any[]>('/healthcare/visits/queue/'),
    getAllPatients: () => apiClient.get<any[]>('/healthcare/visits/all_patients/'),
    getDashboardStats: () => apiClient.get<any>('/healthcare/visits/dashboard_stats/'),
  },

  // Lab Tests
  labTests: {
    list: () => apiClient.get<any[]>('/healthcare/lab-tests/'),
    create: (data: any) => apiClient.post<any>('/healthcare/lab-tests/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/lab-tests/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/lab-tests/${id}/`, data),
    complete: (id: string, data: any) => apiClient.post<any>(`/healthcare/lab-tests/${id}/complete_test/`, data),
  },

  // Prescriptions
  prescriptions: {
    list: () => apiClient.get<any[]>('/healthcare/prescriptions/'),
    create: (data: any) => apiClient.post<any>('/healthcare/prescriptions/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/prescriptions/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/prescriptions/${id}/`, data),
    dispense: (id: string, data: any) => apiClient.post<any>(`/healthcare/prescriptions/${id}/dispense/`, data),
  },

  // Medications
  medications: {
    list: () => apiClient.get<any[]>('/healthcare/medications/'),
    create: (data: any) => apiClient.post<any>('/healthcare/medications/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/medications/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/medications/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/medications/${id}/`),
  },

  // Appointments
  appointments: {
    list: () => apiClient.get<any[]>('/healthcare/appointments/'),
    create: (data: any) => apiClient.post<any>('/healthcare/appointments/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/appointments/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/appointments/${id}/`, data),
    confirm: (id: string) => apiClient.post<any>(`/healthcare/appointments/${id}/confirm/`),
    cancel: (id: string) => apiClient.post<any>(`/healthcare/appointments/${id}/cancel/`),
  },

  // Medical Records
  medicalRecords: {
    list: () => apiClient.get<any[]>('/healthcare/medical-records/'),
    create: (data: any) => apiClient.post<any>('/healthcare/medical-records/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/medical-records/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/medical-records/${id}/`, data),
  },

  // EHR - Medical History
  medicalHistory: {
    list: () => apiClient.get<any[]>('/healthcare/medical-history/'),
    create: (data: any) => apiClient.post<any>('/healthcare/medical-history/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/medical-history/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/medical-history/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/medical-history/${id}/`),
  },

  // EHR - Allergies
  allergies: {
    list: () => apiClient.get<any[]>('/healthcare/allergies/'),
    create: (data: any) => apiClient.post<any>('/healthcare/allergies/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/allergies/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/allergies/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/allergies/${id}/`),
  },

  // EHR - Patient Medications
  patientMedications: {
    list: () => apiClient.get<any[]>('/healthcare/patient-medications/'),
    create: (data: any) => apiClient.post<any>('/healthcare/patient-medications/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/patient-medications/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/patient-medications/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/patient-medications/${id}/`),
  },

  // Staff Management
  staff: {
    list: () => apiClient.get<any[]>('/healthcare/staff/'),
    create: (data: any) => apiClient.post<any>('/healthcare/staff/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/staff/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/staff/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/staff/${id}/`),
  },

  // Shifts
  shifts: {
    list: () => apiClient.get<any[]>('/healthcare/shifts/'),
    create: (data: any) => apiClient.post<any>('/healthcare/shifts/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/shifts/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/shifts/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/shifts/${id}/`),
    getCalendarView: () => apiClient.get<any[]>('/healthcare/shifts/calendar_view/'),
  },

  // Payroll
  payroll: {
    list: () => apiClient.get<any[]>('/healthcare/payroll/'),
    create: (data: any) => apiClient.post<any>('/healthcare/payroll/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/payroll/${id}/`),
    generatePayroll: (data: any) => apiClient.post<any[]>('/healthcare/payroll/generate_payroll/', data),
  },

  // Performance Reviews
  performanceReviews: {
    list: () => apiClient.get<any[]>('/healthcare/performance-reviews/'),
    create: (data: any) => apiClient.post<any>('/healthcare/performance-reviews/', data),
    get: (id: string) => apiClient.get<any>(`/healthcare/performance-reviews/${id}/`),
    update: (id: string, data: any) => apiClient.patch<any>(`/healthcare/performance-reviews/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/healthcare/performance-reviews/${id}/`),
  },
};

// Authentication API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post<{ access: string; refresh: string }>('/auth/login/', credentials),
  
  register: (userData: any) =>
    apiClient.post<any>('/auth/register/', userData),
  
  refreshToken: (refresh: string) =>
    apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh }),
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export default apiClient;