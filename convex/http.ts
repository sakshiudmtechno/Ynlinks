import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { v } from 'convex/values';

const handle = httpRouter({
  clerkWebhook: httpAction(async (ctx, request) => {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'user.created') {
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = data;
      const primaryEmail = email_addresses[0]?.email_address || '';
      const username = primaryEmail.split('@')[0] || `user_${Date.now()}`;
      const timestamp = Date.now().toString().slice(-4);
      const uniqueUsername = `${username}_${timestamp}`;
      const displayName = [first_name, last_name].filter(Boolean).join(' ') || username;

      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
        .first();

      if (!existingUser) {
        await ctx.db.insert('users', {
          clerkId,
          username: uniqueUsername,
          email: primaryEmail,
          displayName,
          avatarUrl: image_url,
          isAdmin: false,
          earnings: 0,
          balance: 0,
          status: 'active',
          role: 'creator',
        });
      }
    }

    if (type === 'user.updated') {
      const { id: clerkId, first_name, last_name, image_url } = data;

      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', clerkId))
        .first();

      if (user) {
        const displayName = [first_name, last_name].filter(Boolean).join(' ') || user.displayName;
        await ctx.db.patch(user._id, {
          displayName,
          avatarUrl: image_url,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
});

export default handle;