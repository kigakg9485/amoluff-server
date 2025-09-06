import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { discordService } from "./services/discord";
import { insertApplicationSchema, insertApplicationSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clean expired sessions periodically
  setInterval(() => {
    storage.cleanExpiredSessions();
  }, 60 * 60 * 1000); // Every hour

  // Verify Discord user
  app.post("/api/verify-discord", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: "اسم المستخدم مطلوب" });
      }

      const result = await discordService.verifyUserInGuild(username);
      
      if (result.verified) {
        res.json({ verified: true, userId: result.userId });
      } else {
        res.status(404).json({ message: "المستخدم غير موجود في السيرفر" });
      }
    } catch (error) {
      console.error('Discord verification error:', error);
      res.status(500).json({ message: "خطأ في التحقق من العضوية" });
    }
  });

  // Submit application
  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);

      // Check if application type is open
      const settings = await storage.getApplicationSettings(applicationData.type);
      if (settings && !settings.isOpen) {
        return res.status(403).json({ message: "التقديم مغلق حالياً" });
      }

      const application = await storage.createApplication(applicationData);
      
      // Send to Discord channel
      try {
        await discordService.sendApplicationToChannel(application);
      } catch (error) {
        console.error('Failed to send to Discord:', error);
        // Continue anyway - application is saved
      }

      res.json({ success: true, applicationId: application.id });
    } catch (error) {
      console.error('Application submission error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "بيانات غير صحيحة", errors: error.errors });
      } else {
        res.status(500).json({ message: "خطأ في إرسال التقديم" });
      }
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === 'admin' && password === 'admin') {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "بيانات تسجيل الدخول غير صحيحة" });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "خطأ في تسجيل الدخول" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    }
  });

  // Check admin auth middleware
  const requireAdmin = async (req: any, res: any, next: any) => {
    // تم تبسيط التحقق - في بيئة التطوير فقط
    next();
  };

  // Get application settings
  app.get("/api/application-settings", async (req, res) => {
    try {
      const types = ['admin', 'script', 'hacks'];
      const settings: any = {};
      
      for (const type of types) {
        const setting = await storage.getApplicationSettings(type);
        settings[type] = setting ? setting.isOpen : true;
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Get application settings error:', error);
      res.status(500).json({ message: "خطأ في جلب إعدادات التقديم" });
    }
  });

  // Update application settings (admin only)
  app.put("/api/application-settings/:type", requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      const { isOpen } = req.body;
      
      if (!['admin', 'script', 'hacks'].includes(type)) {
        return res.status(400).json({ message: "نوع تقديم غير صحيح" });
      }
      
      if (typeof isOpen !== 'boolean') {
        return res.status(400).json({ message: "قيمة isOpen يجب أن تكون boolean" });
      }

      const settings = await storage.updateApplicationSettings(type, isOpen);
      res.json(settings);
    } catch (error) {
      console.error('Update application settings error:', error);
      res.status(500).json({ message: "خطأ في تحديث إعدادات التقديم" });
    }
  });

  // Get applications (admin only)
  app.get("/api/applications", requireAdmin, async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ message: "خطأ في جلب التقديمات" });
    }
  });

  // Handle application response from Discord (webhook)
  app.post("/api/applications/:id/respond", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, userId } = req.body; // action: 'accept' | 'reject'
      
      const application = await storage.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "التقديم غير موجود" });
      }

      await storage.updateApplicationStatus(id, action === 'accept' ? 'accepted' : 'rejected', 'Discord Bot');

      // Assign roles if accepted
      if (action === 'accept' && userId) {
        const roleMap = {
          'admin': '1336657149765484654',
          'script': '1336684394412507186',
          'hacks': '1321142625847345285'
        };
        
        const roleId = roleMap[application.type as keyof typeof roleMap];
        if (roleId) {
          try {
            await discordService.assignRole(userId, roleId);
          } catch (error) {
            console.error('Failed to assign role:', error);
          }
        }
      } else if (action === 'reject' && application.type === 'admin' && userId) {
        // Assign reject role for admin applications
        try {
          await discordService.assignRole(userId, '1332389782541697099');
        } catch (error) {
          console.error('Failed to assign reject role:', error);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Application response error:', error);
      res.status(500).json({ message: "خطأ في معالجة رد التقديم" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
