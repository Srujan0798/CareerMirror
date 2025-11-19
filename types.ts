
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// Phase 3 JSON Structure Types
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

export enum AppState {
  Welcome,
  Chat,
  Generating,
  Results
}
