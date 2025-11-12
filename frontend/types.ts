// ============ CLIENT TYPES ============
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;

  // Membership
  membership_start_date?: string;
  membership_end_date?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Computed
  full_name?: string;
}

export interface ClientCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: 'M' | 'F' | 'O';
  notes?: string;
}

// ============ GOAL TYPES ============
export type GoalType =
  | 'weight_loss'
  | 'muscle_gain'
  | 'strength'
  | 'endurance'
  | 'flexibility'
  | 'general_fitness'
  | 'rehabilitation';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: string;
  client: string; // Client ID
  goal_type: GoalType;
  title: string;
  description: string;
  target_value?: string;
  current_value?: string;
  target_date?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface GoalCreatePayload {
  goal_type: GoalType;
  title: string;
  description: string;
  target_value?: string;
  current_value?: string;
  target_date?: string;
}

// ============ PROGRESS TRACKING TYPES ============
export interface ClientProgress {
  id: string;
  client: string; // Client ID
  recorded_date: string;

  // Body measurements
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;

  // Measurements (in cm)
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;

  // Notes and photos
  notes?: string;
  photos?: string;

  created_at: string;
  updated_at: string;
}

export interface ProgressCreatePayload {
  recorded_date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

// ============ WORKOUT TYPES ============
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutRoutine {
  id: string;
  client: string; // Client ID
  trainer: string; // Trainer ID
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  days_per_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';

export interface Exercise {
  id: string;
  workout_routine: string; // WorkoutRoutine ID
  name: string;
  exercise_type: ExerciseType;
  description?: string;
  sets?: number;
  reps?: string;
  weight?: string;
  duration_seconds?: number;
  rest_seconds: number;
  order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============ PAYMENT TYPES ============
export type PaymentMethod =
  | 'cash'
  | 'mpesa'
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card'
  | 'other';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  client: string; // Client ID
  trainer: string; // Trainer ID
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  invoice_number?: string;
  mpesa_receipt_number?: string;
  transaction_id?: string;
  phone_number?: string;
  payment_date?: string;
  due_date?: string;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // For backward compatibility (will be deprecated)
  currency?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export interface PaymentCreatePayload {
  client: string;
  amount: number;
  payment_method: PaymentMethod;
  phone_number?: string;
  due_date?: string;
  description?: string;
  notes?: string;
}

export interface PaymentMarkPaidPayload {
  payment_method?: PaymentMethod;
  transaction_id?: string;
  notes?: string;
}

export interface PaymentMpesaPayload {
  phone_number: string;
}

export interface PaymentReceipt {
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  trainer_name: string;
  amount: number;
  payment_method_display: string;
  mpesa_receipt_number?: string;
  description: string;
  payment_date: string;
}

export interface PaymentStatistics {
  total_received: number;
  pending_amount: number;
  overdue_amount: number;
  total_transactions: number;
  this_month_revenue: number;
  last_month_revenue: number;
}

// ============ LOG TYPES ============
export interface Log {
  id: string;
  client: string; // Client ID
  date: string;
  notes: string;
  performance_rating?: number; // 1 to 5
  created_at: string;
  updated_at: string;
}

export interface LogCreatePayload {
  date: string;
  notes: string;
  performance_rating?: number;
}

// ============ AUTH TYPES ============
export interface User {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  user_type: 'trainer' | 'client' | 'admin';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ============ API RESPONSE TYPES ============
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}