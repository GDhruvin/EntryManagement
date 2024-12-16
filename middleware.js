// import { NextResponse } from "next/server";

// export function middleware(request) {
//   // Extract the token from the cookies
//   const tokenCookie = request.cookies.get("token");

//   if (!tokenCookie) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   } else {
//     if (request.url === "/login") {
//       return NextResponse.redirect(new URL("/", request.url));
//     } else {
//       return NextResponse.next();
//     }
//   }
// }

// // Define the paths for which this middleware should be applied
// export const config = {
//   matcher: ["/", "/login"],
// };

import { NextResponse } from "next/server";

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const cookieData = request.cookies.get("authData")?.value;

  if ((path === "/" || path === "/details") && !cookieData) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (path === "/login") {
    if (!!cookieData) {
      return NextResponse.redirect(new URL("/", request.url));
    } else {
      return NextResponse.next();
    }
  }
  if (!cookieData) {
    return NextResponse.redirect(new URL("/login", request.url));
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/", "/login", "/details"],
};
