import { GoogleGenAI, Type, Chat, Schema } from "@google/genai";
import { FinalOutput, Message, ProfessionalResume, CareerInsights } from "../types";

const CHAT_MODEL = "gemini-2.5-flash";
const GENERATION_MODEL = "gemini-2.5-flash";

// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY || "" });

export class GeminiService {
  private chatSession: Chat | null = null;
  private client: GoogleGenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || "";
    // Initialize with dummy key if missing to prevent crash, but methods will fail if called
    this.client = new GoogleGenAI({ apiKey: apiKey || "dummy_key_for_init" });
  }

  private getSystemPrompt(): string {
    return `You are a professional, empathetic Career Counselor and Resume Expert named CareerMirror.
    
    YOUR MISSION:
    Help the user build a high-impact professional resume and discover their ideal career path through a natural, stress-free conversation.
    
    THE PERSONA:
    - Friendly, encouraging, and professional.
    - **ADAPTIVE**: 
      - If the user is a **Student/Grad**: Focus on coursework, academic projects, and soft skills. Guide them if they lack work experience.
      - If the user is a **Professional**: Focus on leadership, specific metrics, ROI, and career growth.
    - Don't be robotic. Use natural transitions.
    - If the user gives a short answer, ask a specific follow-up to dig deeper (e.g., "That sounds impactful! Do you recall roughly how much time that saved the team?").
    
    INTERVIEW STAGES (Track this internally):
    1. **Intro & Role**: Current role, main focus.
    2. **Deep Dive Experience**: Key projects, daily responsibilities.
    3. **Impact Extraction**: Specific achievements, metrics, numbers. (CRITICAL for ATS).
    4. **Skills Analysis**: Technical hard skills vs. soft skills.
    5. **Education & Background**: Degrees, certs, languages.
    6. **Career Psychology (CRITICAL for Insights)**: 
       - Ask about what they **LOVE** vs **HATE** in a job.
       - Ask about their ideal work environment (remote, fast-paced, structured?).
       - Ask about their long-term dreams.
    7. **Future Vision**: Goals for the next 1-3 years.
    
    RULES:
    - Ask ONE major question at a time.
    - Keep responses concise (2-3 sentences max) so the user isn't overwhelmed.
    - When you have sufficient data (usually 8-15 exchanges), kindly suggest: "I think I have a great picture of your profile now. Ready to generate your resume and career map?"
    `;
  }

  // Initialize chat session, optionally restoring from history
  public initializeChat(history?: Message[]): void {
    const config = {
      systemInstruction: this.getSystemPrompt(),
      temperature: 0.7,
    };

    if (history && history.length > 0) {
      // Map internal Message format to Gemini Content format
      const geminiHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      this.chatSession = this.client.chats.create({
        model: CHAT_MODEL,
        config,
        history: geminiHistory
      });
    } else {
      this.chatSession = this.client.chats.create({
        model: CHAT_MODEL,
        config
      });
    }
  }

  // Send message in chat
  public async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      // Fallback if session was lost/not initialized
      this.initializeChat();
    }

    if (!this.chatSession) throw new Error("Failed to initialize chat session");

    try {
      const result = await this.chatSession.sendMessage({ message });
      return result.text || "I'm listening. Could you tell me more?";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "I seem to be having a momentary connection issue. Could you please repeat that?";
    }
  }

  // Generate final resume and insights in parallel to avoid token limits
  public async generateOutput(conversationHistory: Message[]): Promise<FinalOutput> {
    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
      .join('\n\n');

    try {
      const [resume, insights] = await Promise.all([
        this.generateResume(conversationText),
        this.generateInsights(conversationText)
      ]);

      return {
        professionalResume: resume,
        careerInsights: insights
      };
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw new Error("Failed to generate resume data. Please try again.");
    }
  }

  private async generateResume(conversationText: string): Promise<ProfessionalResume> {
    const prompt = `Based on the conversation below, generate a professional ATS-optimized resume.
    
    CONVERSATION:
    ${conversationText}
    
    INSTRUCTIONS:
    - Use professional, action-oriented language.
    - Infer missing contact info as placeholders.
    - **CRITICAL**: For every project/job, generate an "impact" statement highlighting value/metrics.
    - Categorize skills strictly.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        personalInfo: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING },
            portfolio: { type: Type.STRING },
          },
          required: ["name"],
        },
        summary: { type: Type.STRING },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              company: { type: Type.STRING },
              position: { type: Type.STRING },
              duration: { type: Type.STRING },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["company", "position"],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              institution: { type: Type.STRING },
              degree: { type: Type.STRING },
              field: { type: Type.STRING },
              year: { type: Type.STRING },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["institution", "degree"],
          },
        },
        skills: {
          type: Type.OBJECT,
          properties: {
            technical: { type: Type.ARRAY, items: { type: Type.STRING } },
            soft: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              impact: { type: Type.STRING },
            },
          },
        },
        certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
        languages: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["personalInfo", "summary", "experience", "skills"],
    };

    const result = await this.client.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        maxOutputTokens: 8192,
      },
    });

    if (!result.text) throw new Error("Resume generation failed");
    return JSON.parse(result.text) as ProfessionalResume;
  }

  private async generateInsights(conversationText: string): Promise<CareerInsights> {
    const prompt = `Based on the conversation below, generate a psychometric career profile.
    
    CONVERSATION:
    ${conversationText}
    
    INSTRUCTIONS:
    - **Personality Profile**: Analyze implied work style (e.g., "Collaborative Builder").
    - **Ideal Roles**: Identify 4-6 distinct roles with "Match Score" (0-100).
    - **Environment**: Distinctly separate environments to Thrive In vs Avoid.
    - **Red Flags**: List 3-5 warning signs in job descriptions for THIS user.
    - **Career Roadmap**: Short Term (1-2 yrs) vs Long Term (3-5 yrs).
    - **Recommendations**: 5-7 actionable steps.
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        personalityProfile: {
          type: Type.OBJECT,
          properties: {
            workStyle: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            preferences: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        idealRoles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
            },
          },
        },
        environments: {
          type: Type.OBJECT,
          properties: {
            preferred: { type: Type.ARRAY, items: { type: Type.STRING } },
            toAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        careerPath: {
          type: Type.OBJECT,
          properties: {
            shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } },
            longTerm: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["personalityProfile", "idealRoles", "recommendations", "environments", "careerPath", "redFlags"],
    };

    const result = await this.client.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        maxOutputTokens: 8192,
      },
    });

    if (!result.text) throw new Error("Insights generation failed");
    return JSON.parse(result.text) as CareerInsights;
  }
}

export const geminiService = new GeminiService();
