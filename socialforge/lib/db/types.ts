import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type {
  users,
  socialAccounts,
  posts,
  postMedia,
  mediaAssets,
  postLogs,
  analyticsDaily,
  analyticsPosts,
  aiGenerations,
  apiKeys,
} from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type SocialAccount = InferSelectModel<typeof socialAccounts>;
export type NewSocialAccount = InferInsertModel<typeof socialAccounts>;

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;

export type PostMedia = InferSelectModel<typeof postMedia>;
export type NewPostMedia = InferInsertModel<typeof postMedia>;

export type MediaAsset = InferSelectModel<typeof mediaAssets>;
export type NewMediaAsset = InferInsertModel<typeof mediaAssets>;

export type PostLog = InferSelectModel<typeof postLogs>;
export type NewPostLog = InferInsertModel<typeof postLogs>;

export type AnalyticsDaily = InferSelectModel<typeof analyticsDaily>;
export type NewAnalyticsDaily = InferInsertModel<typeof analyticsDaily>;

export type AnalyticsPost = InferSelectModel<typeof analyticsPosts>;
export type NewAnalyticsPost = InferInsertModel<typeof analyticsPosts>;

export type AiGeneration = InferSelectModel<typeof aiGenerations>;
export type NewAiGeneration = InferInsertModel<typeof aiGenerations>;

export type ApiKey = InferSelectModel<typeof apiKeys>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;
