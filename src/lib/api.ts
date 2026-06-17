import axios, { AxiosError } from 'axios';
import type {
  Appointment,
  Prescription,
  VitalType,
  SymptomMaster,
  DiagnosisMaster,
  MedicineMaster,
  InjectionMaster,
  LabTestMaster,
  ApiResponse,
  PaginationMeta,
  VitalFormItem,
  SymptomFormItem,
  DiagnosisFormItem,
  MedicineFormItem,
  InjectionFormItem,
  LabTestFormItem,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Response interceptor — unwrap data or throw descriptive error
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred';
    const err = new Error(message) as Error & { statusCode?: number; code?: string };
    err.statusCode = error.response?.status;
    err.code = (error.response?.data as { code?: string })?.code;
    return Promise.reject(err);
  }
);

async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return res.data.data as T;
}

async function getWithMeta<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<{ data: T; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiResponse<T>>(url, { params });
  return { data: res.data.data as T, meta: res.data.meta as PaginationMeta };
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body);
  return res.data.data as T;
}

// ─────────────────────────── APPOINTMENTS ───────────────────────────

export const appointmentsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    date?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => getWithMeta<Appointment[]>('/appointments', params),

  getById: (id: string) => get<Appointment>(`/appointments/${id}`),
};

// ─────────────────────────── CONSULTATIONS ───────────────────────────

export const consultationsApi = {
  open: (appointmentId: string) =>
    post<Appointment>(`/consultations/${appointmentId}/open`),

  complete: (appointmentId: string) =>
    post<Appointment>(`/consultations/${appointmentId}/complete`),
};

// ─────────────────────────── PRESCRIPTIONS ───────────────────────────

export const prescriptionsApi = {
  getByAppointment: (appointmentId: string) =>
    get<Prescription>(`/prescriptions/by-appointment/${appointmentId}`),

  getById: (prescriptionId: string) =>
    get<Prescription>(`/prescriptions/${prescriptionId}`),

  saveVitals: (prescriptionId: string, vitals: VitalFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/vitals`, { vitals }),

  saveSymptoms: (prescriptionId: string, symptoms: SymptomFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/symptoms`, { symptoms }),

  saveDiagnoses: (prescriptionId: string, diagnoses: DiagnosisFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/diagnoses`, { diagnoses }),

  saveMedicines: (prescriptionId: string, medicines: MedicineFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/medicines`, { medicines }),

  saveInjections: (prescriptionId: string, injections: InjectionFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/injections`, { injections }),

  saveLabTests: (prescriptionId: string, labTests: LabTestFormItem[]) =>
    put(`/prescriptions/${prescriptionId}/lab-tests`, { labTests }),

  saveAdvice: (prescriptionId: string, advice: string) =>
    put(`/prescriptions/${prescriptionId}/advice`, { advice }),
};

// ─────────────────────────── MASTER DATA ───────────────────────────

export const mastersApi = {
  searchVitalTypes: (q: string) =>
    get<VitalType[]>('/masters/vital-types/search', { q }),

  searchSymptoms: (q: string) =>
    get<SymptomMaster[]>('/masters/symptoms/search', { q }),

  searchDiagnoses: (q: string) =>
    get<DiagnosisMaster[]>('/masters/diagnoses/search', { q }),

  searchMedicines: (q: string) =>
    get<MedicineMaster[]>('/masters/medicines/search', { q }),

  searchInjections: (q: string) =>
    get<InjectionMaster[]>('/masters/injections/search', { q }),

  searchLabTests: (q: string) =>
    get<LabTestMaster[]>('/masters/lab-tests/search', { q }),
};

// ─────────────────────────── PDF ───────────────────────────

export const pdfApi = {
  downloadUrl: (prescriptionId: string) =>
    `${BASE_URL}/pdf/${prescriptionId}/download`,
  htmlUrl: (prescriptionId: string) =>
    `${BASE_URL}/pdf/${prescriptionId}/html`,
};
