import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/about',
    '/careers',
    '/community',
    '/blog',
    '/creator-report',
    '/help',
    '/privacy',
    '/terms',
    '/cookies',
    '/trust-center',
    '/social-good',
    '/niches/finance',
    '/niches/games',
    '/niches/jobs',
    '/niches/affiliate',
    '/api/webhooks/clerk',
    '/api/clerk-webhook',
    '/favicon.ico',
  ],
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/api/clerk-webhook',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};