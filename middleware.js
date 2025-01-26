import { NextResponse } from 'next/server';

export async function middleware(req) {
  try {
    // Get the cookie token
    const token = req.cookies.get('token');
    if (!token) {
      console.warn('Token missing, redirecting to login.');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Validate the token by calling the API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Verify that the API responded correctly
    if (!res.ok) {
      console.error(`Error validating token: ${res.statusText}`);
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const data = await res.json();

    // Check if the user has admin privileges
    if (!data.admin) {
      console.warn('User is not admin, redirecting to home page.');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // All right, continue to the next page
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login on error
  }
}
