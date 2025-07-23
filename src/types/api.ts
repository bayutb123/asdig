// API Error Types
export interface ApiError {
  error: string;
  details?: {
    studentsCount?: number;
    attendanceRecordsCount?: number;
  };
}

export interface ApiErrorResponse {
  response?: {
    status: number;
    data: ApiError;
  };
  message?: string;
}

// Form Error Types
export interface FormErrors {
  [key: string]: string;
}

// API Response Types
export interface CreateClassResponse {
  success: boolean;
  class: {
    id: string;
    name: string;
    grade: number;
    section: string;
    teacherId: string;
    teacherName: string;
    studentCount: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface DeleteClassResponse {
  success: boolean;
  message: string;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

// Error handling utility type
export type ErrorHandler = (error: ApiErrorResponse) => void;

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}
