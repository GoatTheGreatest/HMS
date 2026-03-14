import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Cannot use jsonwebtoken in Edge runtime, so using jose
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only');

export async function proxy(req) {
  const token = req.cookies.get('token')?.value;

  // Paths that don't require authentication
  const publicPaths = ['/login', '/register', '/'];
  if (publicPaths.includes(req.nextUrl.pathname) || req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Role-based routing
    const role = payload.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith('/dashboard')) {
      if (path.startsWith('/dashboard/patient') && role !== 'PATIENT') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
      }
      if (path.startsWith('/dashboard/doctor') && role !== 'DOCTOR') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
      }
      if (path.startsWith('/dashboard/nurse') && role !== 'NURSE') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
      }
      if (path.startsWith('/dashboard/pharmaceutical') && role !== 'PHARMACEUTICAL') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
      }

      // If just /dashboard without role
      if (path === '/dashboard') {
        return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
