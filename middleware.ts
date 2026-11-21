import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
function isProtected(path: string) {
  return (
    ["/dashboard", "/ask", "/tutor", "/profile", "/teacher"].some(
      (p) => path === p || path.startsWith(p + "/"),
    ) ||
    /^\/teachers\/.+/.test(path) ||
    path === "/forum/new" ||
    /\/forum\/[^/]+\/(answer|edit)$/.test(path)
  );
}
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let authenticated = false;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }
  if (!authenticated && isProtected(request.nextUrl.pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.search = "";
    const redirected = NextResponse.redirect(target);
    response.cookies
      .getAll()
      .forEach((cookie) => redirected.cookies.set(cookie));
    return redirected;
  }
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|manifest.webmanifest).*)",
  ],
};
