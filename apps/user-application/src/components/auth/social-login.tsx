import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function SocialLogin() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleDiscordSignIn = async () => {
    await authClient.signIn.social({
      provider: "discord",
      callbackURL: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base"
            variant="outline"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
          <Button
            onClick={handleDiscordSignIn}
            className="w-full h-12 text-base"
            variant="outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126.644 96">
              <path
                d="M81.15 0a73.742 73.742 0 00-3.36 6.794 97.868 97.868 0 00-28.994 0A67.874 67.874 0 0045.437 0a105.547 105.547 0 00-26.14 8.057C2.779 32.53-1.691 56.373.53 79.887a105.038 105.038 0 0032.05 16.088 76.912 76.912 0 006.87-11.063c-3.738-1.389-7.35-3.131-10.81-5.152.91-.657 1.794-1.338 2.653-1.995a75.255 75.255 0 0064.075 0c.86.707 1.743 1.389 2.652 1.995a68.772 68.772 0 01-10.835 5.178A76.903 76.903 0 0094.056 96a104.99 104.99 0 0032.051-16.063c2.626-27.277-4.496-50.917-18.817-71.855A103.923 103.923 0 0081.175.05L81.15 0zM42.28 65.414c-6.238 0-11.416-5.657-11.416-12.653s4.976-12.679 11.391-12.679 11.517 5.708 11.416 12.679c-.101 6.97-5.026 12.653-11.39 12.653zm42.078 0c-6.264 0-11.391-5.657-11.391-12.653s4.975-12.679 11.39-12.679S95.85 45.79 95.749 52.761c-.1 6.97-5.026 12.653-11.39 12.653z"
                fill="#5865f2"
              />
            </svg>
            Continue with Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}