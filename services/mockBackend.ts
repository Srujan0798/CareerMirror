
import { User, UserWithAuth, Resume, Session, FinalOutput, Message } from '../types';
import { supabaseService } from './supabaseService';
import { isSupabaseConfigured } from '../config';

/**
 * HYBRID BACKEND FACADE
 * 
 * This service acts as a router.
 * 1. Checks if Supabase is configured (URL + Key present).
 * 2. If YES: Delegates all calls to `supabaseService` (Live Prod Mode).
 * 3. If NO: Uses `localStorage` implementation (Mock Dev Mode).
 */

const DB_KEYS = {
  USERS: 'cm_prod_users',    
  RESUMES: 'cm_prod_resumes', 
  SESSIONS: 'cm_prod_sessions',
  ANALYTICS: 'cm_prod_analytics'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const mockHash = (pwd: string) => `hashed_${btoa(pwd)}`;
const mockCompare = (pwd: string, hash: string) => hash === `hashed_${btoa(pwd)}`;

class MockBackendService {
  
  // ==========================================
  // API SERVER ROUTES (Step 1.4)
  // ==========================================

  // GET /health
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    if (isSupabaseConfigured()) {
      return supabaseService.healthCheck();
    }
    // Mock health
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  // ==========================================
  // AUTH MIDDLEWARE / GUARD
  // ==========================================
  /**
   * Simulates backend middleware like `authMiddleware`.
   * Verifies token existence, validity, and ownership.
   * Throws 401/403 equivalent errors if checks fail.
   */
  private async authGuard(targetUserId?: string): Promise<string> {
    // 1. Supabase Mode: Middleware is handled by Postgres RLS Policies
    if (isSupabaseConfigured()) return targetUserId || ''; 

    // 2. Mock Mode: Simulate Latency & Verification
    await delay(200); 
    
    const token = localStorage.getItem('cm_auth_token');
    if (!token) throw new Error("Authentication required (401)");

    const sessions = this.getTable<Session>(DB_KEYS.SESSIONS);
    const session = sessions.find(s => s.token === token);
    
    if (!session) {
      localStorage.removeItem('cm_auth_token'); // Cleanup stale token
      throw new Error("Invalid session token (401)");
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.logout(); 
      throw new Error("Session expired. Please login again (401)");
    }

    // 3. Ownership Check (Authorization)
    if (targetUserId && session.userId !== targetUserId) {
      throw new Error("Access denied: You do not own this resource (403)");
    }

    return session.userId;
  }

  // ==========================================
  // ANALYTICS
  // ==========================================
  async logEvent(event: string, userId: string | null, metadata?: any): Promise<void> {
    if (isSupabaseConfigured()) {
      return supabaseService.logEvent(event, userId, metadata);
    }
    const logs = this.getTable<any>(DB_KEYS.ANALYTICS);
    logs.push({
      id: `evt_${Date.now()}`,
      userId,
      event,
      metadata,
      createdAt: new Date().toISOString()
    });
    this.saveTable(DB_KEYS.ANALYTICS, logs);
  }

  // ==========================================
  // AUTH ROUTER
  // ==========================================

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    if (isSupabaseConfigured()) {
      const result = await supabaseService.login(email, password);
      return { user: result.user, token: 'supa_token' };
    }
    
    await delay(800);
    const users = this.getTable<UserWithAuth>(DB_KEYS.USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !mockCompare(password, user.passwordHash)) throw new Error("Invalid credentials");
    
    const token = `jwt_${Date.now()}`;
    this.createSession(user.id, token);
    
    const { passwordHash, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    if (isSupabaseConfigured()) {
      const result = await supabaseService.signup(name, email, password);
      return { user: result.user, token: 'supa_token' };
    }

    await delay(1000);
    const users = this.getTable<UserWithAuth>(DB_KEYS.USERS);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error("User already exists");
    
    const newUser: UserWithAuth = {
      id: `usr_${Date.now()}`,
      email, 
      name, 
      passwordHash: mockHash(password),
      plan: 'free', 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveTable(DB_KEYS.USERS, users);
    
    const token = `jwt_${Date.now()}`;
    this.createSession(newUser.id, token);
    
    const { passwordHash, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      return supabaseService.logout();
    }

    await delay(300);
    const token = localStorage.getItem('cm_auth_token');
    if (token) {
      let sessions = this.getTable<Session>(DB_KEYS.SESSIONS);
      sessions = sessions.filter(s => s.token !== token);
      this.saveTable(DB_KEYS.SESSIONS, sessions);
      localStorage.removeItem('cm_auth_token');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured()) {
      return supabaseService.getCurrentUser();
    }

    const token = localStorage.getItem('cm_auth_token');
    if (!token) return null;
    
    const sessions = this.getTable<Session>(DB_KEYS.SESSIONS);
    const session = sessions.find(s => s.token === token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('cm_auth_token');
      return null;
    }
    
    const users = this.getTable<UserWithAuth>(DB_KEYS.USERS);
    const user = users.find(u => u.id === session.userId);
    if (!user) return null;
    
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.updateUser(userId, updates);
    }

    await delay(500);
    const users = this.getTable<UserWithAuth>(DB_KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveTable(DB_KEYS.USERS, users);
    
    const { passwordHash, ...safeUser } = users[index];
    return safeUser;
  }

  async upgradePlan(userId: string, plan: 'pro' | 'enterprise'): Promise<User> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.upgradePlan(userId, plan);
    }

    await delay(1500);
    const users = this.getTable<UserWithAuth>(DB_KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    
    users[index] = { ...users[index], plan, updatedAt: new Date().toISOString() };
    this.saveTable(DB_KEYS.USERS, users);
    
    const { passwordHash, ...safeUser } = users[index];
    return safeUser;
  }

  // ==========================================
  // DATA ROUTER
  // ==========================================

  async getResumes(userId: string): Promise<Resume[]> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.getResumes(userId);
    }

    await delay(600);
    const allResumes = this.getTable<Resume>(DB_KEYS.RESUMES);
    return allResumes
      .filter(r => r.userId === userId && r.isActive)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getResumeById(id: string): Promise<Resume | null> {
    // Note: We don't pass userId here because we first need to find the resume 
    // to know who owns it, THEN check auth.
    if (isSupabaseConfigured()) {
      return supabaseService.getResumeById(id);
    }

    await delay(300);
    const resumes = this.getTable<Resume>(DB_KEYS.RESUMES);
    const resume = resumes.find(r => r.id === id && r.isActive);
    
    if (resume) {
      // Post-fetch Authorization Check
      await this.authGuard(resume.userId);
    }

    return resume || null;
  }

  async saveResume(userId: string, data: FinalOutput, conversationHistory: Message[] = []): Promise<Resume> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.saveResume(userId, data, conversationHistory);
    }

    await delay(800);
    const resumes = this.getTable<Resume>(DB_KEYS.RESUMES);
    const newResume: Resume = {
      id: `res_${Date.now()}`,
      userId,
      title: data.professionalResume.personalInfo.name || 'Untitled Resume',
      version: 1,
      professionalResumeData: data.professionalResume,
      careerInsightsData: data.careerInsights,
      conversationHistory,
      template: 'classic',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    resumes.push(newResume);
    this.saveTable(DB_KEYS.RESUMES, resumes);
    return newResume;
  }

  async updateResume(userId: string, id: string, updates: Partial<Resume>): Promise<void> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.updateResume(userId, id, updates);
    }

    await delay(500);
    const resumes = this.getTable<Resume>(DB_KEYS.RESUMES);
    const index = resumes.findIndex(r => r.id === id && r.userId === userId);
    if (index !== -1) {
      resumes[index] = { 
        ...resumes[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.saveTable(DB_KEYS.RESUMES, resumes);
    } else {
      throw new Error("Resume not found or access denied");
    }
  }

  async deleteResume(userId: string, id: string): Promise<void> {
    await this.authGuard(userId); // Middleware Check

    if (isSupabaseConfigured()) {
      return supabaseService.deleteResume(userId, id);
    }

    await delay(400);
    const resumes = this.getTable<Resume>(DB_KEYS.RESUMES);
    const index = resumes.findIndex(r => r.id === id && r.userId === userId);
    if (index !== -1) {
      resumes[index].isActive = false; 
      this.saveTable(DB_KEYS.RESUMES, resumes);
    } else {
       throw new Error("Resume not found or access denied");
    }
  }

  // ==========================================
  // LOCAL HELPERS
  // ==========================================

  private createSession(userId: string, token: string) {
    const sessions = this.getTable<Session>(DB_KEYS.SESSIONS);
    const newSession: Session = {
      id: `sess_${Date.now()}`,
      userId, token, createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    sessions.push(newSession);
    this.saveTable(DB_KEYS.SESSIONS, sessions);
    localStorage.setItem('cm_auth_token', token);
  }

  private getTable<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveTable<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const mockBackend = new MockBackendService();
