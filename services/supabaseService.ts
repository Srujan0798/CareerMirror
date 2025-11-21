
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { User, Resume, FinalOutput, Message } from '../types';

/**
 * PRODUCTION BACKEND SERVICE (Supabase)
 * 
 * Implements the backend logic using Supabase Auth & Database.
 * Handles CamelCase (App) <-> SnakeCase (DB) mapping.
 */

export class SupabaseService {
  private client: SupabaseClient | null = null;

  constructor() {
    if (config.supabase.anonKey) {
      this.client = createClient(config.supabase.url, config.supabase.anonKey);
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) throw new Error("Supabase client not initialized. Check your API Key in config.ts");
    return this.client;
  }

  // ==========================================
  // ANALYTICS
  // ==========================================

  async logEvent(event: string, userId: string | null, metadata?: any): Promise<void> {
    this.getClient()
      .from('analytics')
      .insert({
        user_id: userId,
        event,
        metadata
      })
      .then(({ error }) => {
        if (error) console.warn("Analytics error:", error);
      });
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async signup(name: string, email: string, password: string): Promise<{ user: User }> {
    const { data, error } = await this.getClient().auth.signUp({
      email,
      password,
      options: {
        data: { name } // Passed to handle_new_user trigger
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Signup failed");

    // Return provisional user
    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        name: name,
        plan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  async login(email: string, password: string): Promise<{ user: User }> {
    const { error } = await this.getClient().auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User profile could not be retrieved");

    return { user };
  }

  async logout(): Promise<void> {
    await this.getClient().auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.getClient().auth.getUser();
    if (!user) return null;

    // Fetch Profile Data
    const { data: profile, error } = await this.getClient()
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      // Fallback if profile missing (shouldn't happen with triggers)
      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        plan: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Map DB snake_case to App camelCase
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      plan: profile.plan,
      planExpiresAt: profile.plan_expires_at,
      
      // Profile Fields
      phone: profile.phone,
      location: profile.location,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      preferences: profile.preferences,

      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    // Map App camelCase to DB snake_case
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.linkedin !== undefined) payload.linkedin = updates.linkedin;
    if (updates.portfolio !== undefined) payload.portfolio = updates.portfolio;

    const { error } = await this.getClient()
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    if (error) throw error;
    
    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not found after update");
    return user;
  }

  async upgradePlan(userId: string, plan: 'pro' | 'enterprise'): Promise<User> {
    const { error } = await this.getClient()
      .from('profiles')
      .update({ 
        plan,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;

    const user = await this.getCurrentUser();
    if (!user) throw new Error("User not found after upgrade");
    return user;
  }

  // ==========================================
  // DATABASE (Resumes)
  // ==========================================

  async saveResume(userId: string, data: FinalOutput, conversationHistory: Message[]): Promise<Resume> {
    const payload = {
      user_id: userId,
      title: data.professionalResume.personalInfo.name || 'Untitled Resume',
      version: 1,
      professional_resume_data: data.professionalResume,
      career_insights_data: data.careerInsights,
      conversation_history: conversationHistory,
      template: 'classic',
      is_active: true
    };

    const { data: saved, error } = await this.getClient()
      .from('resumes')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return this.mapResume(saved);
  }

  async getResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await this.getClient()
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapResume);
  }

  async getResumeById(id: string): Promise<Resume | null> {
    const { data, error } = await this.getClient()
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return this.mapResume(data);
  }

  async updateResume(userId: string, id: string, updates: Partial<Resume>): Promise<void> {
    const payload: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.professionalResumeData !== undefined) payload.professional_resume_data = updates.professionalResumeData;
    if (updates.careerInsightsData !== undefined) payload.career_insights_data = updates.careerInsightsData;
    if (updates.template !== undefined) payload.template = updates.template;

    const { error } = await this.getClient()
      .from('resumes')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async deleteResume(userId: string, id: string): Promise<void> {
    const { error } = await this.getClient()
      .from('resumes')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Helper to map DB Result -> App Interface
  private mapResume(dbRecord: any): Resume {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      title: dbRecord.title,
      version: dbRecord.version,
      professionalResumeData: dbRecord.professional_resume_data,
      careerInsightsData: dbRecord.career_insights_data,
      conversationHistory: dbRecord.conversation_history,
      template: dbRecord.template,
      isActive: dbRecord.is_active,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    };
  }
}

export const supabaseService = new SupabaseService();
