import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const AUTH_PATHS = ['/login', '/signup'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;
  const auth = token ? verifyToken(token) : null;

  if (pathname.startsWith('/dashboard')) {
    if (!auth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!auth || auth.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  if (AUTH_PATHS.includes(pathname) && auth) {
    if (auth.role === 'admin') return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
