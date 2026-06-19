import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - api routes
  // - auth routes
  // - static files
  // - sitemap
  matcher: [
    '/((?!api|auth|buildflow|webmind|sitemap\.xml|favicon\.svg|robots\.txt|_next|.*\..*).*)',
  ],
};
