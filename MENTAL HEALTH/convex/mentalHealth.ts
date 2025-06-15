import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

// Get user's mental health profile
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

// Create or update user profile
export const updateUserProfile = mutation({
  args: {
    preferences: v.object({
      language: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      voiceEnabled: v.boolean(),
      notifications: v.boolean(),
    }),
    mentalHealthData: v.optional(v.object({
      currentMood: v.optional(v.string()),
      goals: v.array(v.string()),
      triggers: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const profileData = {
      userId,
      preferences: args.preferences,
      mentalHealthData: {
        currentMood: args.mentalHealthData?.currentMood,
        moodHistory: existingProfile?.mentalHealthData?.moodHistory || [],
        goals: args.mentalHealthData?.goals || [],
        triggers: args.mentalHealthData?.triggers || [],
      },
    };

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, profileData);
      return existingProfile._id;
    } else {
      return await ctx.db.insert("userProfiles", profileData);
    }
  },
});

// Record mood entry
export const recordMood = mutation({
  args: {
    mood: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const moodEntry = {
      mood: args.mood,
      timestamp: Date.now(),
      notes: args.notes,
    };

    const updatedMoodHistory = [...profile.mentalHealthData.moodHistory, moodEntry];

    await ctx.db.patch(profile._id, {
      mentalHealthData: {
        ...profile.mentalHealthData,
        currentMood: args.mood,
        moodHistory: updatedMoodHistory,
      },
    });

    return moodEntry;
  },
});

// Get conversations for user
export const getConversations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 10);

    return conversations;
  },
});

// Start new conversation
export const startConversation = mutation({
  args: {
    initialMessage: v.string(),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation = await ctx.db.insert("conversations", {
      userId,
      sessionId,
      messages: [{
        id: `msg_${Date.now()}`,
        type: "user",
        content: args.initialMessage,
        timestamp: Date.now(),
        language: args.language || "en",
      }],
    });

    // Schedule AI response
    await ctx.scheduler.runAfter(0, internal.ai.generateResponse, {
      conversationId: conversation,
      userMessage: args.initialMessage,
      language: args.language || "en",
    });

    return conversation;
  },
});

// Add message to conversation
export const addMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    voiceData: v.optional(v.id("_storage")),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      type: "user" as const,
      content: args.content,
      timestamp: Date.now(),
      voiceData: args.voiceData,
      language: args.language || "en",
    };

    const updatedMessages = [...conversation.messages, newMessage];

    await ctx.db.patch(args.conversationId, {
      messages: updatedMessages,
    });

    // Schedule AI response
    await ctx.scheduler.runAfter(0, internal.ai.generateResponse, {
      conversationId: args.conversationId,
      userMessage: args.content,
      language: args.language || "en",
    });

    return newMessage;
  },
});

// Generate upload URL for voice data
export const generateVoiceUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.storage.generateUploadUrl();
  },
});

// Process voice analysis
export const processVoiceAnalysis = action({
  args: {
    audioFileId: v.id("_storage"),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // This would integrate with your voice analysis service
    // For now, we'll simulate the analysis
    const mockAnalysis = {
      transcription: "I'm feeling a bit overwhelmed today...",
      language: args.language || "en",
      emotions: [
        { emotion: "stress", confidence: 0.75 },
        { emotion: "anxiety", confidence: 0.60 },
      ],
      stressLevel: 0.7,
      speechPattern: {
        pace: "fast",
        tone: "tense",
        clarity: 0.8,
      },
    };

    const analysisId: any = await ctx.runMutation(internal.mentalHealth.saveVoiceAnalysis, {
      userId,
      audioFileId: args.audioFileId,
      analysis: mockAnalysis,
    });

    return { analysisId, analysis: mockAnalysis };
  },
});

// Internal function to save voice analysis
export const saveVoiceAnalysis = internalMutation({
  args: {
    userId: v.id("users"),
    audioFileId: v.id("_storage"),
    analysis: v.object({
      transcription: v.string(),
      language: v.string(),
      emotions: v.array(v.object({
        emotion: v.string(),
        confidence: v.number(),
      })),
      stressLevel: v.number(),
      speechPattern: v.object({
        pace: v.string(),
        tone: v.string(),
        clarity: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("voiceAnalysis", {
      userId: args.userId,
      audioFileId: args.audioFileId,
      analysis: args.analysis,
      timestamp: Date.now(),
    });
  },
});
