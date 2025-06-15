import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  conversations: defineTable({
    userId: v.id("users"),
    messages: v.array(v.object({
      id: v.string(),
      type: v.union(v.literal("user"), v.literal("ai")),
      content: v.string(),
      timestamp: v.number(),
      mood: v.optional(v.string()),
      voiceData: v.optional(v.id("_storage")),
      language: v.optional(v.string()),
    })),
    sessionId: v.string(),
    moodAnalysis: v.optional(v.object({
      overallMood: v.string(),
      confidence: v.number(),
      emotions: v.array(v.object({
        emotion: v.string(),
        intensity: v.number(),
      })),
      recommendations: v.array(v.string()),
    })),
  }).index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    preferences: v.object({
      language: v.string(),
      theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
      voiceEnabled: v.boolean(),
      notifications: v.boolean(),
    }),
    mentalHealthData: v.object({
      currentMood: v.optional(v.string()),
      moodHistory: v.array(v.object({
        mood: v.string(),
        timestamp: v.number(),
        notes: v.optional(v.string()),
      })),
      goals: v.array(v.string()),
      triggers: v.array(v.string()),
    }),
  }).index("by_user", ["userId"]),

  voiceAnalysis: defineTable({
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
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  supportSessions: defineTable({
    userId: v.id("users"),
    sessionType: v.union(
      v.literal("crisis"),
      v.literal("support"),
      v.literal("check-in"),
      v.literal("therapy")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("scheduled")
    ),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    notes: v.optional(v.string()),
    aiRecommendations: v.array(v.string()),
  }).index("by_user", ["userId"])
    .index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
