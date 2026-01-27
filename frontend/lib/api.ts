const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
const TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'mentalink_token';

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private setCookie(name: string, value: string, days = 7) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  private deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  constructor() {
    this.baseURL = `${API_URL}${API_PREFIX}`;
    this.token =
      typeof window !== 'undefined'
        ? localStorage.getItem(TOKEN_KEY) || this.getCookie(TOKEN_KEY)
        : null;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    this.setCookie(TOKEN_KEY, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    this.deleteCookie(TOKEN_KEY);
  }

  private headers(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Define public request for flexibility if needed, but keeping it mainly internal
  async request(method: string, endpoint: string, body?: unknown, isFormData = false) {
    const url = `${this.baseURL}${endpoint}`;

    let requestBody: BodyInit | undefined;
    if (body) {
      if (isFormData) {
        const params = new URLSearchParams();
        Object.entries(body as Record<string, string>).forEach(([key, value]) => {
          params.append(key, value);
        });
        requestBody = params;
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers: this.headers(isFormData),
        body: requestBody,
      });

      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle 204 No Content - Return null without parsing JSON
      if (response.status === 204) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        let errorMessage = `Error de API: ${response.status}`;

        if (error.detail) {
          if (typeof error.detail === 'string') {
            errorMessage = error.detail;
          } else if (Array.isArray(error.detail)) {
            // Handle FastAPI validation errors
            errorMessage = error.detail
              .map((err: any) => err.msg || JSON.stringify(err))
              .join(', ');
          } else {
            errorMessage = JSON.stringify(error.detail);
          }
        }

        throw new Error(errorMessage);
      }

      // Check if there is content before parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }
      return null;

    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          'No se pudo conectar con el servidor. Por favor verifica tu conexión o intenta más tarde.'
        );
      }
      console.error(`[API] ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request('POST', '/auth/login', { username: email, password }, true);
    this.setToken(response.access_token);
    return response;
  }

  async register(userData: Record<string, any>) {
    return this.request('POST', '/users/', userData);
  }

  async createUserByAdmin(userData: Record<string, any>) {
    return this.request('POST', '/users/internal', userData);
  }


  async getMe() {
    return this.request('GET', '/users/me');
  }

  // Assessment endpoints
  async getAssessments() {
    return this.request('GET', '/assessments/');
  }

  async getAssessment(assessmentKey: string) {
    return this.request('GET', `/assessments/${assessmentKey}`);
  }

  async submitAssessmentResponse(assessmentId: number, answers: Record<string, number>) {
    return this.request('POST', '/assessments/responses', { assessment_id: assessmentId, answers });
  }

  async getMyAssessmentResponses() {
    return this.request('GET', '/assessments/responses/me');
  }

  // Check-in endpoints
  async createCheckin(data: { mood_score: number; note?: string }) {
    return this.request('POST', '/checkins', data);
  }

  async getMyCheckins() {
    return this.request('GET', '/checkins/me');
  }

  // Risk endpoints
  async getRiskSummary() {
    return this.request('GET', '/risk/me/summary');
  }

  async getMyAlerts() {
    return this.request('GET', '/alerts/me');
  }

  // Admin/Psychologist endpoints
  async getAllAlerts(filters?: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    return this.request('GET', `/alerts/?${params.toString()}`);
  }

  async getStudents() {
    return this.request('GET', '/students/');
  }

  async getUsers() {
    return this.request('GET', '/users/');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request('PATCH', `/users/${userId}/role?role=${role}`);
  }

  async toggleUserStatus(userId: string) {
    return this.request('PATCH', `/users/${userId}/status`);
  }

  async getStudentDetails(studentId: string) {
    return this.request('GET', `/students/${studentId}`);
  }

  async getAggregatedReports() {
    return this.request('GET', '/reports/aggregated');
  }

  // Clinical Notes
  async createClinicalNote(studentId: string, content: string) {
    return this.request('POST', '/clinical-notes/', { student_id: parseInt(studentId), content });
  }

  async getClinicalNotes(studentId: string) {
    return this.request('GET', `/clinical-notes/?student_id=${studentId}`);
  }

  async deleteUser(userId: string) {
    return this.request('DELETE', `/users/${userId}`);
  }

  async acceptConsent() {
    return this.request('POST', '/consents/', { has_accepted: true });
  }

  // Auth Extras
  async verifyEmail(token: string) {
    return this.request('POST', `/auth/verify-email?token=${token}`);
  }

  async recoverPassword(email: string) {
    return this.request('POST', '/auth/recover-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('POST', '/auth/reset-password', { token, new_password: newPassword });
  }

  async changeRequiredPassword(newPassword: string) {
    return this.request('POST', '/auth/change-required-password', { new_password: newPassword });
  }
}

export const apiClient = new APIClient();
