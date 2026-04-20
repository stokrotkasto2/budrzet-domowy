import { auth } from "./auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;
  console.log(`Proxy: ${pathname} | isLoggedIn: ${isLoggedIn} | auth: ${JSON.stringify(req.auth)}`);

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAuthPage) {
    if (isLoggedIn) {
      console.log("Redirecting to / (Logged In)");
      return Response.redirect(new URL('/', req.nextUrl));
    }
    return null;
  }

  if (!isLoggedIn) {
    console.log("Redirecting to /login (Not Logged In)");
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  return null;
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.png$).*)"],
}
