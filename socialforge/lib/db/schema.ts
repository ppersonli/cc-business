import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  clerkId: text('clerk_id').notNull().unique(),
  imageUrl: text('image_url'),
  subscriptionTier: text('subscription_tier').notNull().default('free'),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_users_clerk_id').on(t.clerkId),
]);

export const socialAccounts = sqliteTable('social_accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  platform: text('platform').notNull(),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  username: text('username').notNull(),
  platformUserId: text('platform_user_id'),
  status: text('status').notNull().default('active'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_social_accounts_user_id').on(t.userId),
]);

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('draft'),
  scheduledAt: text('scheduled_at'),
  publishedAt: text('published_at'),
  targetPlatforms: text('target_platforms').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (t) => [
  index('idx_posts_user_id').on(t.userId),
  index('idx_posts_status').on(t.status),
]);

export const postMedia = sqliteTable('post_media', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  mediaAssetId: text('media_asset_id').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  altText: text('alt_text'),
}, (t) => [
  index('idx_post_media_post_id').on(t.postId),
]);

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  filename: text('filename').notNull(),
  blobUrl: text('blob_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_media_assets_user_id').on(t.userId),
]);

export const postLogs = sqliteTable('post_logs', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  platform: text('platform').notNull(),
  status: text('status').notNull(),
  platformPostId: text('platform_post_id'),
  errorMessage: text('error_message'),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_post_logs_post_id').on(t.postId),
]);

export const analyticsDaily = sqliteTable('analytics_daily', {
  id: text('id').primaryKey(),
  socialAccountId: text('social_account_id').notNull(),
  date: text('date').notNull(),
  followers: integer('followers').notNull().default(0),
  engagementRate: real('engagement_rate').notNull().default(0),
  impressions: integer('impressions').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_analytics_daily_account_date').on(t.socialAccountId, t.date),
]);

export const analyticsPosts = sqliteTable('analytics_posts', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  platform: text('platform').notNull(),
  likes: integer('likes').notNull().default(0),
  comments: integer('comments').notNull().default(0),
  shares: integer('shares').notNull().default(0),
  impressions: integer('impressions').notNull().default(0),
  clicks: integer('clicks').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_analytics_posts_post_id').on(t.postId),
]);

export const aiGenerations = sqliteTable('ai_generations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  prompt: text('prompt').notNull(),
  result: text('result').notNull(),
  model: text('model').notNull(),
  tokensUsed: integer('tokens_used').notNull().default(0),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_ai_generations_user_id').on(t.userId),
]);

export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  keyHash: text('key_hash').notNull(),
  name: text('name').notNull(),
  permissions: text('permissions').notNull().default('[]'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull(),
}, (t) => [
  index('idx_api_keys_user_id').on(t.userId),
]);
