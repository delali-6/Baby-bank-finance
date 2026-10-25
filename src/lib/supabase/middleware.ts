
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  ...(process.env.NODE_ENV !== "production"
    ? ["/preview", "/api/health"]
    : []),
];

function isPublic(path: string) {
  return PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const redirectTo = (pathname: string, search = "") => {
    const target = request.nextUrl.clone();
    target.pathname = pathname;
    target.search = search;

    const redirect = NextResponse.redirect(target);

    response.cookies.getAll().forEach((cookie) => {
      redirect.cookies.set(cookie);
    });

    return redirect;
  };

  if (!user && !isPublic(path)) {
    return redirectTo(
      "/login",
      `?next=${encodeURIComponent(path)}`
    );
  }

  if (user && (path === "/login" || path === "/signup")) {
    return redirectTo("/dashboard");
  }

  return response;
}
