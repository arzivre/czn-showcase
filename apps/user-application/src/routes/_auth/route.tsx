import { SocialLogin } from "@/components/auth/social-login";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();

  return (
    <>
      {session.isPending ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : session.data ? (
        <div className="min-h-screen">
          <Outlet />
        </div>
      ) : (
        <SocialLogin />
      )}
    </>
  );
}
