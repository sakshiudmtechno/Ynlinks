import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing CLERK_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const { type, data } = evt;

  if (type === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url, username } = data;
    const primaryEmail = email_addresses[0]?.email_address || '';
    const baseUsername = username || primaryEmail.split('@')[0] || `user_${Date.now()}`;
    const timestamp = Date.now().toString().slice(-4);
    const uniqueUsername = `${baseUsername}_${timestamp}`.replace(/[^a-zA-Z0-9_]/g, '');
    const displayName = [first_name, last_name].filter(Boolean).join(' ') || baseUsername;

    // Create user in Convex via HTTP mutation
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      try {
        await fetch(`${convexUrl}/api/mutation/users/createUser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
          body: JSON.stringify({
            clerkId,
            username: uniqueUsername,
            email: primaryEmail,
            displayName,
            avatarUrl: image_url,
          }),
        });
      } catch (error) {
        console.error('Failed to create user in Convex:', error);
      }
    }
  }

  if (type === 'user.updated') {
    const { id: clerkId, first_name, last_name, image_url } = data;

    // Get the user from Convex first
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      try {
        // First get the user to find their Convex ID
        const userResponse = await fetch(`${convexUrl}/api/query/users/getUserByClerkId?clerkId=${encodeURIComponent(clerkId)}`, {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        });
        const userData = await userResponse.json();

        if (userData && userData._id) {
          // Update user in Convex
          await fetch(`${convexUrl}/api/mutation/users/updateUserProfile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
            body: JSON.stringify({
              userId: userData._id,
              displayName: [first_name, last_name].filter(Boolean).join(' ') || undefined,
              avatarUrl: image_url,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to update user in Convex:', error);
      }
    }
  }

  return NextResponse.json({ success: true });
}