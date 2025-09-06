import { storage } from "../storage";
import { openaiService } from "./openai";
import { sendSlackMessage } from "./slack";
import type { InsertInquiry } from "@shared/schema";

interface WebhookPayload {
  source: string;
  sourceId: string;
  content: string;
  userId: string;
  userDisplayName?: string;
  channelId?: string;
  timestamp?: string;
}

export class IntegrationService {
  async processIncomingInquiry(payload: WebhookPayload): Promise<{
    inquiryId: string;
    status: 'auto_resolved' | 'escalated' | 'processing';
    response?: string;
    confidence?: number;
  }> {
    try {
      // Analyze the inquiry with OpenAI
      const analysis = await openaiService.analyzeInquiry(payload.content);

      // Create inquiry record
      const inquiryData: InsertInquiry = {
        content: payload.content,
        source: payload.source,
        sourceId: payload.sourceId,
        channelId: payload.channelId,
        userId: payload.userId,
        userDisplayName: payload.userDisplayName,
        category: analysis.category,
        status: analysis.requiresHuman ? 'escalated' : 'pending',
        confidence: analysis.confidence.toString(),
        knowledgeEntryId: analysis.knowledgeEntryId,
      };

      const inquiry = await storage.createInquiry(inquiryData);

      // Check if we should auto-resolve
      if (!analysis.requiresHuman && analysis.confidence >= 0.7) {
        let response = analysis.suggestedResponse;

        // If we have a knowledge entry, generate a more detailed response
        if (analysis.knowledgeEntryId) {
          const knowledgeEntry = await storage.getKnowledgeEntry(analysis.knowledgeEntryId);
          if (knowledgeEntry) {
            response = await openaiService.generateResponse(payload.content, knowledgeEntry);
            await storage.incrementKnowledgeEntryUsage(analysis.knowledgeEntryId);
          }
        }

        if (response) {
          // Update inquiry as auto-resolved
          await storage.updateInquiry(inquiry.id, {
            status: 'auto_resolved',
            aiResponse: response,
            resolvedAt: new Date(),
          });

          // Send response back to the source platform
          await this.sendResponse(payload.source, payload.channelId || '', response, payload.sourceId);

          return {
            inquiryId: inquiry.id,
            status: 'auto_resolved',
            response,
            confidence: analysis.confidence,
          };
        }
      }

      // If we reach here, escalate to human review
      await storage.updateInquiry(inquiry.id, { status: 'escalated' });

      return {
        inquiryId: inquiry.id,
        status: 'escalated',
        confidence: analysis.confidence,
      };
    } catch (error) {
      console.error('Error processing inquiry:', error);
      throw new Error('Failed to process inquiry');
    }
  }

  async sendResponse(source: string, channelId: string, response: string, originalMessageId?: string): Promise<void> {
    try {
      switch (source) {
        case 'slack':
          if (channelId) {
            await sendSlackMessage({
              channel: channelId,
              text: response,
              thread_ts: originalMessageId, // Reply in thread if available
            });
          }
          break;

        case 'teams':
          // TODO: Implement Teams response
          console.log('Teams response not implemented yet');
          break;

        case 'discord':
          // TODO: Implement Discord response
          console.log('Discord response not implemented yet');
          break;

        case 'zendesk':
          // TODO: Implement Zendesk response
          console.log('Zendesk response not implemented yet');
          break;

        default:
          console.warn(`Unknown source: ${source}`);
      }
    } catch (error) {
      console.error(`Failed to send response to ${source}:`, error);
    }
  }

  async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        return { success: false, message: 'Integration not found' };
      }

      switch (integration.type) {
        case 'slack':
          // Test Slack integration by sending a test message
          try {
            const config = integration.config as { channelId?: string };
            if (config.channelId) {
              await sendSlackMessage({
                channel: config.channelId,
                text: '🤖 DataFlow AI integration test successful!',
              });
              return { success: true, message: 'Slack integration working correctly' };
            } else {
              return { success: false, message: 'No channel configured for Slack integration' };
            }
          } catch (error) {
            return { success: false, message: `Slack test failed: ${(error as Error).message}` };
          }

        case 'teams':
          // TODO: Implement Teams test
          return { success: false, message: 'Teams integration testing not implemented yet' };

        case 'discord':
          // TODO: Implement Discord test
          return { success: false, message: 'Discord integration testing not implemented yet' };

        case 'zendesk':
          // TODO: Implement Zendesk test
          return { success: false, message: 'Zendesk integration testing not implemented yet' };

        default:
          return { success: false, message: `Unknown integration type: ${integration.type}` };
      }
    } catch (error) {
      return { success: false, message: `Integration test failed: ${(error as Error).message}` };
    }
  }

  async syncIntegrationData(integrationId: string): Promise<void> {
    try {
      const integration = await storage.getIntegration(integrationId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Update last sync timestamp
      await storage.updateIntegration(integrationId, {
        lastSync: new Date(),
        status: 'active',
      });

      // TODO: Implement specific sync logic for each integration type
      console.log(`Synced integration: ${integration.name}`);
    } catch (error) {
      console.error('Integration sync failed:', error);
      // Update integration status to error
      await storage.updateIntegration(integrationId, {
        status: 'error',
      });
      throw error;
    }
  }
}

export const integrationService = new IntegrationService();
