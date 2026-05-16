import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    return user;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();

    return user;
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const existingUsername = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    if (existingUsername) {
      throw new Error('Username is not available');
    }

    const userId = await ctx.db.insert('users', {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      displayName: args.displayName || args.username,
      avatarUrl: args.avatarUrl,
      isAdmin: false,
      earnings: 0,
      balance: 0,
      status: 'active',
      role: 'creator',
      createdAt: new Date().toISOString(),
    });

    return userId;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id('users'),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    socialPlatform: v.optional(v.string()),
    socialId: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    await ctx.db.patch(userId, filteredUpdates);
    return { success: true };
  },
});

export const updateUserTheme = mutation({
  args: {
    userId: v.id('users'),
    theme: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { theme: args.theme });
    return { success: true };
  },
});

export const updateUserNiche = mutation({
  args: {
    userId: v.id('users'),
    niche: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { niche: args.niche });
    return { success: true };
  },
});

export const updateUserBalance = mutation({
  args: {
    userId: v.id('users'),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');

    const newBalance = (user.balance || 0) + args.amount;
    await ctx.db.patch(args.userId, { balance: newBalance });
    return { success: true };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users;
  },
});

export const getUserById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id('users'),
    updates: v.object({
      displayName: v.optional(v.string()),
      bio: v.optional(v.string()),
      avatarUrl: v.optional(v.string()),
      phone: v.optional(v.string()),
      niche: v.optional(v.string()),
      theme: v.optional(v.string()),
      isAdmin: v.optional(v.boolean()),
      status: v.optional(v.string()),
      balance: v.optional(v.number()),
      facebookUrl: v.optional(v.string()),
      instagramUrl: v.optional(v.string()),
      linkedinUrl: v.optional(v.string()),
      twitterUrl: v.optional(v.string()),
      youtubeUrl: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, args.updates);
    return { success: true };
  },
});

export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    return { available: !existingUser };
  },
});

export const checkEmailAvailability = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    return { available: !existingUser };
  },
});