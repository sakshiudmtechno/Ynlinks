# API Collection - YNLinks

This document contains all API endpoints and functions from your Convex backend.

---

## How to Test These APIs

### Method 1: Using Convex Client (React)
```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

// For queries
const result = useQuery(api.users.getUserByUsername, { username: 'john' });

// For mutations
const updateProfile = useMutation(api.users.updateUserProfile);
await updateProfile({ userId, displayName: 'John Doe' });
```

### Method 2: Using HTTP Endpoints
Convex exposes APIs via HTTP. The URL format varies depending on your deployment:

**Development:** `http://localhost:3000/api/[query|mutation]/[module]/[function]`

**Production:** `https://[your-deployment].convex.site/api/[query|mutation]/[module]/[function]`

**Example:**
```bash
# Query example
curl -X POST "https://your-app.convex.site/api/query/users/getUserByUsername" \
  -H "Content-Type: application/json" \
  -d '{"username": "john"}'

# Mutation example
curl -X POST "https://your-app.convex.site/api/mutation/users/updateUserProfile" \
  -H "Content-Type: application/json" \
  -d '{"userId": "abc123", "displayName": "John Doe"}'
```

### Method 3: Using Convex Dashboard
1. Go to your Convex dashboard
2. Navigate to the "API" tab
3. Select the function and test it with different arguments

---

## API URL Pattern

| Type | Pattern | Example |
|------|---------|---------|
| Query | `/api/query/[module]/[function]` | `/api/query/users/getUserByUsername` |
| Mutation | `/api/mutation/[module]/[function]` | `/api/mutation/users/updateUserProfile` |

---

## Authentication

### `users.ts` - User Management

#### Queries (Read Operations)

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getUserByUsername` | Get user by public username | `{ username: string }` | `/api/users/getUserByUsername` | User or `null` |
| `getUserByClerkId` | Get user by Clerk ID | `{ clerkId: string }` | `/api/users/getUserByClerkId` | User or `null` |
| `getUserById` | Get user by internal ID | `{ userId: v.id('users') }` | `/api/users/getUserById` | User object |
| `getAllUsers` | Get all users | None | `/api/users/getAllUsers` | Array of all users |
| `checkUsernameAvailability` | Check if username is available | `{ username: string }` | `/api/users/checkUsernameAvailability` | `{ available: boolean }` |
| `checkEmailAvailability` | Check if email is available | `{ email: string }` | `/api/users/checkEmailAvailability` | `{ available: boolean }` |
| `getUserLinks` | Get all links for a user | `{ userId: string }` | `/api/users/getUserLinks` | Array of links (sorted) |
| `getLinkCountByUser` | Get total and enabled link count | `{ userId: string }` | `/api/users/getLinkCountByUser` | `{ total: number, enabled: number }` |
| `exportUserData` | Export user data (GDPR) | `{ userId: v.id('users') }` | `/api/users/exportUserData` | Full user data |

#### Mutations (Write Operations)

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `createUser` | Create new user in Convex | `{ clerkId: string, username: string, email: string, displayName?: string, avatarUrl?: string }` | `/api/users/createUser` | User ID |
| `updateUserProfile` | Update user profile | `{ userId: v.id('users'), displayName?: string, bio?: string, avatarUrl?: string, phone?: string, socialPlatform?: string, socialId?: string, facebookUrl?: string, instagramUrl?: string, linkedinUrl?: string, twitterUrl?: string, youtubeUrl?: string, theme?: string, buttonStyle?: string, fontStyle?: string, avatarShape?: string, username?: string, niche?: string, location?: string, telegramUrl?: string, onboardingComplete?: boolean }` | `/api/users/updateUserProfile` | `{ success: boolean }` |
| `updateUserTheme` | Update only theme settings | `{ userId: v.id('users'), theme: string }` | `/api/users/updateUserTheme` | `{ success: boolean }` |
| `updateUserNiche` | Update user niche | `{ userId: v.id('users'), niche: string }` | `/api/users/updateUserNiche` | `{ success: boolean }` |
| `updateUserBalance` | Update user balance (earnings) | `{ userId: v.id('users'), amount: number }` | `/api/users/updateUserBalance` | `{ success: boolean }` |
| `updatePageSettings` | Update page visibility settings | `{ userId: v.id('users'), pageVisible?: boolean, showBranding?: boolean, allowIndexing?: boolean }` | `/api/users/updatePageSettings` | `{ success: boolean }` |
| `clearAllLinks` | Delete all user's links | `{ userId: v.id('users') }` | `/api/users/clearAllLinks` | `{ success: boolean, deleted: number }` |
| `deleteAccount` | Permanently delete user and data | `{ userId: v.id('users') }` | `/api/users/deleteAccount` | `{ success: boolean }` |
| `updateUser` | Update user fields (limited) | `{ userId: v.id('users), updates: { displayName?: string, bio?: string, avatarUrl?: string, phone?: string, niche?: string, theme?: string, isAdmin?: boolean, status?: string, balance?: number, facebookUrl?: string, instagramUrl?: string, linkedinUrl?: string, twitterUrl?: string, youtubeUrl?: string } }` | `/api/users/updateUser` | `{ success: boolean }` |

---

## Links Management

### `links.ts` - Link Operations

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getLinksByUser` | Get all links for a user | `{ userId: string }` | `/api/links/getLinksByUser` | Array of links (sorted) |
| `getEnabledLinksByUser` | Get only enabled, non-archived links | `{ userId: string }` | `/api/links/getEnabledLinksByUser` | Array of active links |
| `getLinkById` | Get single link by ID | `{ linkId: v.id('links') }` | `/api/links/getLinkById` | Link object |
| `getLinkCountByUser` | Get link count statistics | `{ userId: string }` | `/api/links/getLinkCountByUser` | `{ total: number, enabled: number }` |

#### Mutations

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `createLink` | Create new link | `{ userId: string, title: string, url: string, description?: string, thumbnailUrl?: string, enabled: boolean }` | `/api/links/createLink` | Link ID |
| `updateLink` | Update existing link | `{ linkId: v.id('links'), title?: string, url?: string, description?: string, thumbnailUrl?: string, enabled?: boolean, type?: string, imageUrl?: string }` | `/api/links/updateLink` | `{ success: boolean }` |
| `deleteLink` | Delete a link | `{ linkId: v.id('links') }` | `/api/links/deleteLink` | `{ success: boolean }` |
| `reorderLinks` | Change link order | `{ userId: string, linkIds: v.array(v.id('links')) }` | `/api/links/reorderLinks` | `{ success: boolean }` |
| `toggleLinkEnabled` | Enable/disable link | `{ linkId: v.id('links'), enabled: boolean }` | `/api/links/toggleLinkEnabled` | `{ success: boolean }` |
| `toggleLinkArchived` | Archive/unarchive link | `{ linkId: v.id('links'), archived: boolean }` | `/api/links/toggleLinkArchived` | `{ success: boolean }` |
| `toggleLinkPinned` | Pin/unpin link | `{ linkId: v.id('links'), pinned: boolean }` | `/api/links/toggleLinkPinned` | `{ success: boolean }` |
| `incrementLinkClicks` | Record click update | `{ linkId: v.id('links'), userId: string, ipAddress?: string }` | `/api/links/incrementLinkClicks` | `{ success: boolean, clicks: number }` |

---

## Analytics & Tracking

### `analytics.ts` - Event Tracking

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getUserVisitAnalytics` | Get daily visit count for date range | `{ userId: string, daysBack?: number }` | `/api/query/analytics/getUserVisitAnalytics` | Array of `{ date: string, count: number }` |
| `getUserClickAnalytics` | Get daily click count for date range | `{ userId: string, daysBack?: number }` | `/api/query/analytics/getUserClickAnalytics` | Array of `{ date: string, click_count: number }` |
| `getTotalVisitCount` | Get total visit count | `{ userId: string }` | `/api/query/analytics/getTotalVisitCount` | Total count number |
| `getTotalClickCount` | Get total click count | `{ userId: string }` | `/api/query/analytics/getTotalClickCount` | Total count number |
| `getTodayVisitCount` | Get today's visit count | `{ userId: string }` | `/api/query/analytics/getTodayVisitCount` | Today's count number |
| `getTodayClickCount` | Get today's click count | `{ userId: string }` | `/api/query/analytics/getTodayClickCount` | Today's count number |

#### Mutations

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `trackVisit` | Track bio page visit | `{ userId: string, ipAddress?: string }` | `/api/mutation/analytics/trackVisit` | `{ success: boolean }` |
| `trackClick` | Track link click with earnings ($0.10) | `{ linkId: v.id('links'), userId: string, ipAddress?: string }` | `/api/mutation/analytics/trackClick` | `{ success: boolean, clicks: number }` |

---

## Earnings

### `earnings.ts` - Revenue Management

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getUserEarnings` | Calculate earnings and stats | `{ userId: string }` | `/api/query/earnings/getUserEarnings` | `{ balance: number, earnings: number, totalClicks: number, totalVisits: number }` |
| `getEarningsAnalytics` | Get daily earnings breakdown | `{ userId: string, daysBack?: number }` | `/api/query/earnings/getEarningsAnalytics` | `{ dailyEarnings: Array<{ date: string, earnings: number }>, totalEarnings: number }` |
| `getTopEarningUsers` | Get top earning users | `{ limit?: number }` | `/api/query/earnings/getTopEarningUsers` | Array of top users with balances |

#### Mutations

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| *No mutations defined in earnings.ts* | | |

---

## Notifications

### `notifications.ts` - User Notifications

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getUserNotifications` | Get user's notifications | `{ userId: v.id('users') }` | `/api/notifications/getUserNotifications` | Array of notifications (sorted newest first) |
| `getUnreadCount` | Get unread notification count | `{ userId: v.id('users') }` | `/api/notifications/getUnreadCount` | Count number |

#### Mutations

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `createNotification` | Create new notification | `{ userId: v.id('users'), message: string }` | `/api/notifications/createNotification` | Notification ID |
| `markNotificationRead` | Mark single as read | `{ notificationId: v.id('notifications') }` | `/api/notifications/markNotificationRead` | `{ success: boolean }` |
| `markAllRead` | Mark all as read for user | `{ userId: v.id('users') }` | `/api/notifications/markAllRead` | `{ success: boolean }` |
| `deleteNotification` | Delete notification | `{ notificationId: v.id('notifications') }` | `/api/notifications/deleteNotification` | `{ success: boolean }` |

---

## Business/Admin

### `withdrawals.ts` - Payout Management

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getUserWithdrawals` | Get user's withdrawal history | `{ userId: v.id('users') }` | `/api/withdrawals/getUserWithdrawals` | Array of withdrawals (newest first) |
| `getAllWithdrawals` | Get all withdrawals (admin) | `{ statusFilter?: string }` | `/api/withdrawals/getAllWithdrawals` | Array of all withdrawals |
| `getPendingWithdrawalsCount` | Get count of pending requests | None | `/api/withdrawals/getPendingWithdrawalsCount` | Count number |

#### Mutations

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `requestWithdrawal` | Create withdrawal request | `{ userId: v.id('users'), amount: number, method: string, details: any }` | `/api/withdrawals/requestWithdrawal` | `{ success: boolean }` |
| `approveWithdrawal` | Approve pending withdrawal | `{ withdrawalId: v.id('withdrawals') }` | `/api/withdrawals/approveWithdrawal` | `{ success: boolean }` |
| `rejectWithdrawal` | Reject pending withdrawal (refund) | `{ withdrawalId: v.id('withdrawals') }` | `/api/withdrawals/rejectWithdrawal` | `{ success: boolean }` |

### `admin.ts` - Administrative & Business Functions

#### Queries

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `getAllUsers` | Get all users (with filter) | `{ statusFilter?: string }` | `/api/admin/getAllUsers` | Array of all users |
| `getDashboardStats` | Get platform-wide statistics | None | `/api/admin/getDashboardStats` | `{ totalUsers, totalLinks, pendingWithdrawals, totalEarnings, totalClicks, totalVisits }` |
| `getAllWithdrawals` | Get all withdrawals with user info | `{ statusFilter?: string }` | `/api/admin/getAllWithdrawals` | Array of withdrawals with user data |
| `getClickAnalytics` | Get platform click analytics | `{ daysBack?: number }` | `/api/admin/getClickAnalytics` | Array of `{ date: string, count }` |
| `getTopCreators` | Get top earning creators | `{ limit?: number }` | `/api/admin/getTopCreators` | Array of creators with stats |
| `getNiches` | Get all niches | None | `/api/admin/getNiches` | Array of niches |
| `getAdvertiserInquiries` | Get business contact inquiries | None | `/api/admin/getAdvertiserInquiries` | Array of inquiries |
| `getSettings` | Get all system settings | None | `/api/admin/getSettings` | Array of settings |
| `getSettingByKey` | Get single setting | `{ key: string }` | `/api/admin/getSettingByKey` | Setting object |

#### Mutations (Admin Only)

| Function | Description | Raw Fields | Full API URL | Returns |
|----------|-------------|------------|------------|---------|
| `updateUser` | Update any user field | `{ userId: v.id('users'), updates: object }` | `/api/admin/updateUser` | `{ success: boolean }` |
| `addBonus` | Add bonus to user balance | `{ userId: v.id('users'), amount: number }` | `/api/admin/addBonus` | `{ success: boolean }` |
| `approveWithdrawal` | Approve withdrawal | `{ withdrawalId: v.id('withdrawals') }` | `/api/admin/approveWithdrawal` | `{ success: boolean }` |
| `rejectWithdrawal` | Reject and refund | `{ withdrawalId: v.id('withdrawals') }` | `/api/admin/rejectWithdrawal` | `{ success: boolean }` |
| `createNiche` | Create new niche | `{ name: string, slug: string, customDomain?: string, adCode?: string }` | `/api/admin/createNiche` | Niche ID |
| `updateNiche` | Update niche | `{ nicheId: v.id('niches'), updates: object }` | `/api/admin/updateNiche` | `{ success: boolean }` |
| `createAdvertiserInquiry` | Create advertiser inquiry | `{ name: string, email: string, message: string }` | `/api/admin/createAdvertiserInquiry` | Inquiry ID |
| `updateAdvertiserInquiryStatus` | Update inquiry status | `{ inquiryId: v.id('advertiserInquiries'), status: string }` | `/api/admin/updateAdvertiserInquiryStatus` | `{ success: boolean }` |
| `updateSetting` | Update system setting | `{ key: string, value: string }` | `/api/admin/updateSetting` | `{ success: boolean }` |

---

## Webhooks

### `http.ts` - Clerk Integration

#### HTTP Action

| Path | Method | Description | Handler |
|------|--------|-------------|---------|
| `/clerkWebhook` | POST | Handle Clerk user events | `clerkWebhook` function |

**Handler Logic:**
- On `user.created`: Create pending user record
- On `user.updated`: Update user profile
- Returns: `{ success: boolean }`