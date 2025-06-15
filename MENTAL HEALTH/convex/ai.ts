import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    try {
      // Get conversation context
      const conversation: any = await ctx.runQuery(internal.ai.getConversationContext, {
        conversationId: args.conversationId,
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Analyze user's emotional state from message
      const emotionalAnalysis: any = await analyzeEmotionalState(args.userMessage);

      // Generate contextual response
      const systemPrompt = `You are a compassionate AI mental health support assistant. Your role is to:
1. Provide empathetic, non-judgmental support
2. Help users process their emotions
3. Suggest healthy coping strategies
4. Recognize crisis situations and recommend professional help
5. Maintain a warm, understanding tone

Current user emotional state: ${emotionalAnalysis.primaryEmotion} (confidence: ${emotionalAnalysis.confidence})
Language: ${args.language}

Guidelines:
- Always validate the user's feelings
- Ask open-ended questions to encourage reflection
- Provide practical, actionable advice
- If detecting severe distress, gently suggest professional resources
- Keep responses concise but meaningful
- Adapt language complexity to user's communication style`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...conversation.messages.slice(-5).map((msg: any) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      ];

      const response: any = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse: string | null | undefined = response.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response generated");
      }

      // Save AI response to conversation
      await ctx.runMutation(internal.ai.addAIResponse, {
        conversationId: args.conversationId,
        content: aiResponse,
        emotionalAnalysis,
      });

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      
      // Fallback response
      const fallbackResponse = "I'm here to listen and support you. Could you tell me more about how you're feeling right now?";
      
      await ctx.runMutation(internal.ai.addAIResponse, {
        conversationId: args.conversationId,
        content: fallbackResponse,
        emotionalAnalysis: { primaryEmotion: "neutral", confidence: 0.5 },
      });

      return fallbackResponse;
    }
  },
});

export const getConversationContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const addAIResponse = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    emotionalAnalysis: v.object({
      primaryEmotion: v.string(),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const aiMessage = {
      id: `msg_${Date.now()}`,
      type: "ai" as const,
      content: args.content,
      timestamp: Date.now(),
      mood: args.emotionalAnalysis.primaryEmotion,
    };

    const updatedMessages = [...conversation.messages, aiMessage];

    await ctx.db.patch(args.conversationId, {
      messages: updatedMessages,
    });

    return aiMessage;
  },
});

// Helper function to analyze emotional state
async function analyzeEmotionalState(message: string) {
  const emotionKeywords = {
    anxiety: ["anxious", "worried", "nervous", "panic", "fear", "scared"],
    depression: ["sad", "depressed", "hopeless", "empty", "worthless", "down"],
    stress: ["stressed", "overwhelmed", "pressure", "burden", "exhausted"],
    anger: ["angry", "frustrated", "mad", "irritated", "furious"],
    joy: ["happy", "excited", "great", "wonderful", "amazing", "good"],
    neutral: ["okay", "fine", "normal", "alright"],
  };

  const messageLower = message.toLowerCase();
  let maxScore = 0;
  let primaryEmotion = "neutral";

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (messageLower.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion;
    }
  }

  const confidence = Math.min(maxScore / 3, 1); // Normalize confidence

  return {
    primaryEmotion,
    confidence,
  };
}
