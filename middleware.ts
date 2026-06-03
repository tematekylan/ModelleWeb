import { auth } from "@/lib/auth";

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/seller/:path*",
    "/admin/:path*",
    "/checkout/:templateId",
  ],
};
