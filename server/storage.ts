
import { randomUUID } from "crypto";
import type { 
  Application, 
  InsertApplication,
  ApplicationSettings,
  AdminSession,
  InsertAdminSession
} from "@shared/schema";

class InMemoryStorage {
  private applications = new Map<string, Application>();
  private applicationSettings = new Map<string, ApplicationSettings>();
  private adminSessions = new Map<string, AdminSession>();

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      ...insertApplication,
      id,
      status: 'pending',
      reviewedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getApplicationById(id: string): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplicationStatus(id: string, status: 'accepted' | 'rejected', reviewedBy: string): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (application) {
      application.status = status;
      application.reviewedBy = reviewedBy;
      application.updatedAt = new Date();
      this.applications.set(id, application);
    }
    return application;
  }

  async getApplicationSettings(type: string): Promise<ApplicationSettings | undefined> {
    return this.applicationSettings.get(type);
  }

  async updateApplicationSettings(type: string, isOpen: boolean): Promise<ApplicationSettings> {
    const existing = this.applicationSettings.get(type);
    if (existing) {
      existing.isOpen = isOpen;
      existing.updatedAt = new Date();
      this.applicationSettings.set(type, existing);
      return existing;
    } else {
      const newSetting: ApplicationSettings = {
        id: randomUUID(),
        type,
        isOpen,
        updatedAt: new Date(),
      };
      this.applicationSettings.set(type, newSetting);
      return newSetting;
    }
  }

  async createAdminSession(insertSession: InsertAdminSession): Promise<AdminSession> {
    const id = randomUUID();
    const session: AdminSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.adminSessions.set(insertSession.sessionId, session);
    return session;
  }

  async getAdminSession(sessionId: string): Promise<AdminSession | undefined> {
    return this.adminSessions.get(sessionId);
  }

  async deleteAdminSession(sessionId: string): Promise<void> {
    this.adminSessions.delete(sessionId);
  }

  async cleanExpiredSessions(): Promise<void> {
    const now = new Date();
    for (const [sessionId, session] of Array.from(this.adminSessions.entries())) {
      if (session.expiresAt < now) {
        this.adminSessions.delete(sessionId);
      }
    }
  }
}

export const storage = new InMemoryStorage();
