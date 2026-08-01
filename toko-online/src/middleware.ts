import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil session dari cookies
  // Pastikan nama cookie ini sama persis dengan yang Anda set saat login
  const session = request.cookies.get('admin_session');

  // 2. Tentukan kondisi
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  // 3. Jika akses admin tapi belum login
  if (isAdminPage && !isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 4. Jika sudah login tapi akses halaman login kembali
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};