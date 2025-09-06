import OpenAI from "openai";
import { storage } from "../storage";
import type { KnowledgeEntry } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface InquiryAnalysis {
  category: string;
  intent: string;
  urgency: "low" | "medium" | "high";
  confidence: number;
  suggestedResponse?: string;
  knowledgeEntryId?: string;
  requiresHuman: boolean;
}

export class OpenAIService {
  async analyzeInquiry(content: string): Promise<InquiryAnalysis> {
    try {
      // First, search for relevant knowledge entries
      const knowledgeEntries = await storage.searchKnowledgeEntries(content);
      const contextualKnowledge = knowledgeEntries.slice(0, 3).map(entry => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        category: entry.category
      }));

      const systemPrompt = `You are an AI assistant specialized in analyzing customer inquiries for data teams. 

Common data team inquiry categories:
- Data Access: Permissions, warehouse access, table schemas
- Pipeline Issues: ETL failures, data quality problems, monitoring
- Report Generation: Dashboard creation, custom reports, data exports  
- Schema Questions: Table structures, data definitions, relationships
- Performance: Query optimization, slow reports, resource usage

Available knowledge base entries:
${contextualKnowledge.map(kb => `ID: ${kb.id}\nTitle: ${kb.title}\nCategory: ${kb.category}\nContent: ${kb.content}`).join('\n\n')}

Analyze the inquiry and respond with JSON in this exact format:
{
  "category": "string (one of the categories above)",
  "intent": "string (brief description of what user wants)",
  "urgency": "low|medium|high",
  "confidence": number (0-1, how confident you are in the analysis),
  "suggestedResponse": "string (helpful response if confidence > 0.7)",
  "knowledgeEntryId": "string (ID of most relevant KB entry, if any)",
  "requiresHuman": boolean (true if too complex or confidence < 0.6)
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this inquiry: "${content}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and normalize the response
      return {
        category: analysis.category || "Unknown",
        intent: analysis.intent || "Unclear intent",
        urgency: ["low", "medium", "high"].includes(analysis.urgency) ? analysis.urgency : "medium",
        confidence: Math.max(0, Math.min(1, analysis.confidence || 0)),
        suggestedResponse: analysis.suggestedResponse,
        knowledgeEntryId: analysis.knowledgeEntryId,
        requiresHuman: analysis.requiresHuman || analysis.confidence < 0.6
      };
    } catch (error) {
      console.error("OpenAI analysis failed:", error);
      return {
        category: "Unknown",
        intent: "Analysis failed",
        urgency: "medium",
        confidence: 0,
        requiresHuman: true
      };
    }
  }

  async generateResponse(inquiry: string, knowledgeEntry?: KnowledgeEntry): Promise<string> {
    try {
      const systemPrompt = `You are a helpful AI assistant for a data team. Provide clear, actionable responses to data-related inquiries.

Guidelines:
- Be specific and technical when appropriate
- Include step-by-step instructions when possible
- Mention relevant tools, permissions, or contact info
- Keep responses concise but comprehensive
- If you reference external resources, be specific

${knowledgeEntry ? `Relevant knowledge base entry:
Title: ${knowledgeEntry.title}
Content: ${knowledgeEntry.content}
Category: ${knowledgeEntry.category}

Use this information to provide an accurate, helpful response.` : ''}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: inquiry }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a response for your inquiry. Please contact a team member for assistance.";
    } catch (error) {
      console.error("OpenAI response generation failed:", error);
      return "I'm experiencing technical difficulties. Please contact a team member for assistance.";
    }
  }

  async enhanceKnowledgeEntry(title: string, content: string, category: string): Promise<{
    enhancedTitle: string;
    enhancedContent: string;
    suggestedTags: string[];
  }> {
    try {
      const systemPrompt = `You are an AI assistant that helps improve knowledge base entries for data teams.

Enhance the given knowledge entry by:
- Improving clarity and structure
- Adding relevant technical details
- Ensuring completeness
- Suggesting appropriate tags

Respond with JSON in this format:
{
  "enhancedTitle": "string (improved title)",
  "enhancedContent": "string (enhanced content with better structure)",
  "suggestedTags": ["tag1", "tag2", "tag3"] (array of relevant tags)
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Category: ${category}\nTitle: ${title}\nContent: ${content}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const enhancement = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        enhancedTitle: enhancement.enhancedTitle || title,
        enhancedContent: enhancement.enhancedContent || content,
        suggestedTags: Array.isArray(enhancement.suggestedTags) ? enhancement.suggestedTags : []
      };
    } catch (error) {
      console.error("Knowledge enhancement failed:", error);
      return {
        enhancedTitle: title,
        enhancedContent: content,
        suggestedTags: []
      };
    }
  }
}

export const openaiService = new OpenAIService();
