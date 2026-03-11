export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'psychologist' | 'admin';
  career?: string;
  semester?: number;
  consent_accepted: boolean;
  must_change_password?: boolean;
}

export interface Assessment {
  id: number;
  type: string;
  title: string;
  description: string;
  items: AssessmentItem[];
}

export interface AssessmentItem {
  id: string;
  question: string;
  scale_min: number;
  scale_max: number;
  scale_min_label: string;
  scale_max_label: string;
  is_critical?: boolean;
}

export interface AssessmentResponse {
  id: string;
  assessment_id: number;
  user_id: string;
  answers: Record<string, number>;
  total_score: number;
  risk_level: string;
  created_at: string;
}

export interface Checkin {
  id: number;
  user_id: number;
  mood_score: number;
  energy_level?: number;
  academic_pressure?: number;
  sleep_hours?: number;
  note?: string;
  created_at: string;
}

export interface RiskAlert {
  id: string;
  user_id: string;
  severity: 'Low' | 'Medium' | 'High';
  message: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface RiskSummary {
  current_risk_level: string;
  prediction_confidence: number;
  dropout_probability: number;
  dropout_risk: string;
  trend?: 'improving' | 'stable' | 'declining';
  last_assessment_date?: string;
  active_alerts?: number;
  recommendations?: string[];
}

export interface StudentSummary {
  id: string;
  email: string;
  full_name: string;
  career?: string;
  semester?: number;
  risk_level: 'low' | 'medium' | 'high';
  active_alerts: number;
  last_assessment_date?: string;
}

export interface AcademicProfile {
  id: number;
  user_id: string;
  course?: string;
  scholarship_holder: boolean;
  tuition_fees_up_to_date: boolean;
  current_semester: number;
  units_approved: number;
  current_gpa: number;
  
  // Hitos fields
  hito2_procesual: number;
  hito2_nota: number;
  hito3_procesual: number;
  hito3_nota: number;
  hito4_procesual: number;
  hito4_nota: number;
  hito5_procesual: number;
  hito5_nota: number;

  age_at_enrollment?: number;
  gender?: number;
}

export interface DiaryEntry {
  id: number;
  user_id: number;
  date: string;
  experience?: string;
  activities?: string;
  emotion: string;
  emotion_color: string;
  wellbeing_level: number;
  created_at: string;
  
  // AI Analysis fields
  emotion_ai?: string;
  emotion_scores?: Record<string, number>;
  analysis_created_at?: string;
}
