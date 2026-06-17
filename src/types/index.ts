// ─────────────────────────── ENUMS ───────────────────────────

export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Severity = 'MILD' | 'MODERATE' | 'SEVERE';
export type Frequency = 'ONCE_DAILY' | 'TWICE_DAILY' | 'THRICE_DAILY' | 'FOUR_TIMES_DAILY' | 'AS_NEEDED' | 'WEEKLY' | 'MONTHLY';
export type MedicineRoute = 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICAL' | 'INHALATION' | 'SUBLINGUAL' | 'RECTAL' | 'NASAL';
export type FoodRelation = 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD' | 'NOT_APPLICABLE';
export type Priority = 'ROUTINE' | 'URGENT' | 'STAT';

// ─────────────────────────── API RESPONSE ───────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─────────────────────────── ENTITIES ───────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  mobile: string;
  medicalHistory?: string | null;
  allergies?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization?: string | null;
  registrationNo?: string | null;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  doctor: Doctor;
  prescription?: { id: string; isLocked: boolean } | null;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  isLocked: boolean;
  advice?: string | null;
  createdAt: string;
  updatedAt: string;
  appointment: Appointment;
  vitals: PrescriptionVital[];
  symptoms: PrescriptionSymptom[];
  diagnoses: PrescriptionDiagnosis[];
  medicines: PrescriptionMedicine[];
  injections: PrescriptionInjection[];
  labTests: PrescriptionLabTest[];
}

export interface PrescriptionVital {
  id: string;
  prescriptionId: string;
  vitalTypeId?: string | null;
  vitalName: string;
  value: string;
  unit?: string | null;
  notes?: string | null;
  recordedAt: string;
}

export interface PrescriptionSymptom {
  id: string;
  prescriptionId: string;
  symptomId?: string | null;
  symptomName: string;
  duration?: string | null;
  severity?: Severity | null;
  notes?: string | null;
}

export interface PrescriptionDiagnosis {
  id: string;
  prescriptionId: string;
  diagnosisId?: string | null;
  diagnosisName: string;
  notes?: string | null;
}

export interface PrescriptionMedicine {
  id: string;
  prescriptionId: string;
  medicineId?: string | null;
  medicineName: string;
  dosage: string;
  frequency: Frequency;
  duration: string;
  route: MedicineRoute;
  foodRelation: FoodRelation;
  notes?: string | null;
  sortOrder: number;
}

export interface PrescriptionInjection {
  id: string;
  prescriptionId: string;
  injectionId?: string | null;
  injectionName: string;
  dose: string;
  route: MedicineRoute;
  frequency: Frequency;
  notes?: string | null;
  sortOrder: number;
}

export interface PrescriptionLabTest {
  id: string;
  prescriptionId: string;
  labTestId?: string | null;
  testName: string;
  priority: Priority;
  notes?: string | null;
  sortOrder: number;
}

// ─────────────────────────── MASTER DATA ───────────────────────────

export interface VitalType {
  id: string;
  name: string;
  defaultUnit?: string | null;
  normalRangeMin?: number | null;
  normalRangeMax?: number | null;
}

export interface SymptomMaster {
  id: string;
  name: string;
  category?: string | null;
}

export interface DiagnosisMaster {
  id: string;
  name: string;
  icd10Code?: string | null;
  category?: string | null;
}

export interface MedicineMaster {
  id: string;
  name: string;
  genericName?: string | null;
  defaultUnit?: string | null;
  defaultRoute?: MedicineRoute | null;
}

export interface InjectionMaster {
  id: string;
  name: string;
  defaultRoute?: MedicineRoute | null;
  defaultUnit?: string | null;
}

export interface LabTestMaster {
  id: string;
  name: string;
  category?: string | null;
  sampleType?: string | null;
}

// ─────────────────────────── CONSULTATION STATE ───────────────────────────

export interface ConsultationState {
  appointment: Appointment;
  prescription: Prescription;
}

// ─────────────────────────── FORM TYPES ───────────────────────────

export interface VitalFormItem {
  id?: string;
  vitalTypeId?: string | null;
  vitalName: string;
  value: string;
  unit?: string;
  notes?: string;
}

export interface SymptomFormItem {
  id?: string;
  symptomId?: string | null;
  symptomName: string;
  duration?: string;
  severity?: Severity | '';
  notes?: string;
}

export interface DiagnosisFormItem {
  id?: string;
  diagnosisId?: string | null;
  diagnosisName: string;
  notes?: string;
}

export interface MedicineFormItem {
  id?: string;
  medicineId?: string | null;
  medicineName: string;
  dosage: string;
  frequency: Frequency | '';
  duration: string;
  route: MedicineRoute | '';
  foodRelation: FoodRelation | '';
  notes?: string;
  sortOrder: number;
}

export interface InjectionFormItem {
  id?: string;
  injectionId?: string | null;
  injectionName: string;
  dose: string;
  route: MedicineRoute | '';
  frequency: Frequency | '';
  notes?: string;
  sortOrder: number;
}

export interface LabTestFormItem {
  id?: string;
  labTestId?: string | null;
  testName: string;
  priority: Priority | '';
  notes?: string;
  sortOrder: number;
}
