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
  starting_value?: string;
  target_date?: string;
  status: GoalStatus;
  achieved?: boolean;
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
  starting_value?: string;
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
  sessions_per_week?: number;
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
  sessions_per_week?: number;
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
  total_pages: number;
  current_page: number;
  page_size: number;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// ============ BOOKING TYPES ============
export type BookingStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type SessionType = 'personal_training' | 'group_class' | 'consultation' | 'assessment' | 'virtual';

export interface Booking {
  id: string;
  trainer: string;
  trainer_name?: string;
  client: string;
  client_name?: string;
  client_details?: Client;
  session_type: SessionType;
  session_type_display?: string;
  title: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  status: BookingStatus;
  status_display?: string;
  trainer_notes?: string;
  client_notes?: string;
  session_summary?: string;
  client_rating?: number;
  client_feedback?: string;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  is_upcoming: boolean;
  is_past: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface BookingCreatePayload {
  client: string;
  session_type: SessionType;
  title: string;
  description?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location?: string;
  trainer_notes?: string;
}

export interface BookingUpdatePayload {
  session_type?: SessionType;
  title?: string;
  description?: string;
  session_date?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  status?: BookingStatus;
  trainer_notes?: string;
  client_notes?: string;
  session_summary?: string;
  client_rating?: number;
  client_feedback?: string;
  cancellation_reason?: string;
}

export interface Schedule {
  id: string;
  trainer: string;
  weekday: number;
  weekday_name?: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringBooking {
  id: string;
  trainer: string;
  client: string;
  client_name?: string;
  session_type: SessionType;
  session_type_display?: string;
  title: string;
  description?: string;
  weekday: number;
  weekday_name?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  frequency_display?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingStatistics {
  total_bookings: number;
  upcoming_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  todays_bookings: number;
  this_week_bookings: number;
  this_week_completed: number;
  this_month_bookings: number;
  this_month_completed: number;
}

// ============ ANALYTICS TYPES ============
export interface DashboardAnalytics {
  period: 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  clients: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    new_clients_this_period: number;
  };
  revenue: {
    total_revenue: number;
    completed_payments: number;
    pending_payments: number;
    pending_amount: number;
    overdue_payments: number;
    overdue_amount: number;
  };
  bookings: {
    total_sessions: number;
    completed_sessions: number;
    upcoming_sessions: number;
    cancelled_sessions: number;
    average_rating: number;
  };
  goals: {
    total_goals: number;
    active_goals: number;
    completed_goals: number;
    completion_rate: number;
  };
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  count: number;
}

export interface ClientRetentionData {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  retention_rate: number;
  client_lifetime: Array<{
    client_name: string;
    days_active: number;
    total_revenue: number;
    status: string;
  }>;
}

export interface PerformanceMetrics {
  this_month: {
    revenue: number;
    new_clients: number;
  };
  last_month: {
    revenue: number;
    new_clients: number;
  };
  growth: {
    revenue_growth_percentage: number;
    client_growth_percentage: number;
  };
}