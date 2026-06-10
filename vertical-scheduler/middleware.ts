import createMiddleware from 'next-intl/middleware';
import { auth } from './auth';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.includes('/dashboard') && !isLoggedIn) {
    const locale = pathname.split('/')[1] || 'en';
    return Response.redirect(new URL(`/${locale}/auth/signin`, req.nextUrl.origin));
  }

  // Redirect logged-in users from signin to dashboard
  if (pathname.includes('/auth/signin') && isLoggedIn) {
    const locale = pathname.split('/')[1] || 'en';
    return Response.redirect(new URL(`/${locale}/dashboard`, req.nextUrl.origin));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
