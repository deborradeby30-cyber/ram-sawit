import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const role = user?.user_metadata?.role;

  // Proteksi Route Admin
  if (path.startsWith('/dashboard') || path.startsWith('/transaksi') || path.startsWith('/petani') || path.startsWith('/harga') || path.startsWith('/riwayat')) {
    if (!user || role !== 'admin') {
      return NextResponse.redirect(new URL('/login-admin', request.url));
    }
  }

  // Proteksi Route Petani
  if (path.startsWith('/portal')) {
    if (!user || role !== 'petani') {
      return NextResponse.redirect(new URL('/login-petani', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/transaksi/:path*', '/petani/:path*', '/harga/:path*', '/riwayat/:path*', '/portal/:path*'],
};