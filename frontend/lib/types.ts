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
  id: string;
  user_id: string;
  mood_score: number;
  energy_level?: number;
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
  current_risk_level: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'declining';
  last_assessment_date?: string;
  active_alerts: number;
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
