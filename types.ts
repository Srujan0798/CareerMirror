
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// ==========================================
// CORE DATA STRUCTURES (Generation Output)
// ==========================================
export interface ProfessionalResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: {
    company: string;
    position: string;
    duration: string;
    achievements: string[];
    skills: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
    achievements?: string[];
  }[];
  skills: {
    technical: string[];
    soft: string[];
  };
  projects: {
    title: string;
    description: string;
    technologies: string[];
    impact: string;
  }[];
  certifications?: string[];
  languages?: string[];
}

export interface CareerInsights {
  personalityProfile: {
    workStyle: string;
    strengths: string[];
    preferences: string[];
  };
  idealRoles: {
    title: string;
    reasoning: string;
    matchScore: number;
  }[];
  environments: {
    preferred: string[];
    toAvoid: string[];
  };
  careerPath: {
    shortTerm: string[];
    longTerm: string[];
  };
  redFlags: string[];
  recommendations: string[];
}

export interface FinalOutput {
  professionalResume: ProfessionalResume;
  careerInsights: CareerInsights;
}

// ==========================================
// DATABASE MODELS (Matches Prisma Schema)
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  
  // Subscription
  plan: string; // "free", "pro", "enterprise"
  planExpiresAt?: string | null;
  
  // UserProfile Fields (Flattened for frontend ease, or separated if strict)
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  preferences?: any | null;

  createdAt: string;
  updatedAt: string;
}

// Internal use for Mock Backend password storage
export interface UserWithAuth extends User {
  passwordHash: string;
}

export interface Resume {
  id: string;
  userId: string;
  
  title: string;
  version: number;
  
  // JSON Data Columns
  professionalResumeData: ProfessionalResume;
  careerInsightsData: CareerInsights;
  conversationHistory: Message[];
  
  template: string;
  isActive: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  userId: string | null;
  event: string;
  metadata: any;
  createdAt: string;
}

// ==========================================
// APP STATE
// ==========================================

export type AppView = 'landing' | 'auth' | 'dashboard' | 'chat' | 'generating' | 'results';

export interface AppState {
  view: AppView;
  user: User | null;
  activeResumeId: string | null;
}
