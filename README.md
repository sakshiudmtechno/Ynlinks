# YNLinks

A link-in-bio tool for creators to showcase links, social profiles, and content in one customizable page.

---

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Framework | Next.js |
| Authentication | Clerk |
| Database | Convex |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Vercel |

---

## How It Works

```
User signs up (Clerk) → Webhook creates user (Convex) → User customizes profile
                                                                         ↓
Visitor views /u/[username] ← Convex serves data ← User adds links in dashboard
```

### The Flow

1. **Sign Up** → Clerk handles authentication
2. **Onboarding** → User picks username + niche/category
3. **Dashboard** → User adds links, customizes design
4. **Public Page** → Visitors see the profile at `/u/[username]`

---

## Key Pages

| Route | Purpose |
|-------|---------|
| `/sign-up` | New user registration |
| `/sign-in` | Existing user login |
| `/onboarding/username` | Pick public username |
| `/onboarding/about` | Select category/niche |
| `/bio` | User dashboard - manage links |
| `/design` | Customize profile appearance |
| `/u/[username]` | Public profile page |

---

## Database (Convex)

### Tables

- **`users`** — Profile data, theme settings, avatar, niche
- **`links`** — User's links (title, URL, order, clicks)
- **`linkClicks`** — Each link click recorded
- **`bioVisits`** — Each profile visit recorded

---

## Customization Options

- Avatar shape (circle, rounded, square, hexagon, none)
- Theme colors
- Button style
- Font style
- Page visibility settings

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

---

## Project Structure

```
├── app/
│   ├── (auth)/          # Sign-up, sign-in pages
│   ├── (dashboard)/     # User dashboard (bio, design)
│   ├── (onboarding)/   # Username, about pages
│   ├── u/[username]/   # Public profile
│   └── api/            # Webhooks, API routes
├── components/         # React components
├── convex/             # Database schema & functions
│   ├── schema.ts       # Table definitions
│   ├── users.ts       # User queries/mutations
│   ├── links.ts       # Link queries/mutations
│   └── http.ts        # Clerk webhook handler
└── lib/               # Utilities
```

---

## Connecting Clerk to Convex

The bridge is the **`clerkId`** field in the Convex `users` table:

- Clerk provides `user.id` (Clerk's user ID)
- Convex stores this as `clerkId`
- Queries look up users by `clerkId` to find the matching Convex record

---

## Notes

- Users must complete onboarding before accessing the dashboard
- Analytics are tracked in Convex tables (linkClicks, bioVisits)
- Public profiles can be customized from the `/design` page

---

## License

MIT