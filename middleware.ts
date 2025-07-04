import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // This `response` object is used to rewrite headers and set cookies.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The `set` method is called whenever the Supabase client detects a session change.
          // We need to update the cookies on the request and response.
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // The `remove` method is called whenever the Supabase client signs out a user.
          // We need to remove the cookies from the request and response.
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - important!
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;

  if (user && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // If the user is not authenticated and is not trying to access an authentication page,
  // redirect them to the login page.
  if (!user && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

// Ensure the middleware is invoked for every route except for static assets.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (for any auth-related API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
} 