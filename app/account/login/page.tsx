"use client";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { recoverGuestOrders } from "@/lib/recoverGuestOrders";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loginWithGoogle, resetPassword } = useAuth();


  useEffect(() => {
    if (user) {
      // Check for redirect parameter in URL
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get('redirect');
      
      if (redirectPath) {
        // Redirect to the specified path (e.g., /checkout)
        router.push(redirectPath);
      } else {
        // Default redirect to account page
        router.push("/account");
      }
    }
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const getErrorMessage = (error: any) => {
    const errorCode = error.code || "";

    // Map common Firebase error codes to user-friendly messages
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Invalid email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many unsuccessful login attempts. Please try again later.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      default:
        return "An error occurred during login. Please try again.";
    }
  };

  const handleEmailLogin = async () => {
    try {
      await login(email, pw);
      
      // Get the current user from context instead of from the function return
      if (user) {
        const recoveredOrders = await recoverGuestOrders(
          user.uid, 
          user.email || email
        );
        
        if (recoveredOrders.length > 0) {
          addToast({
            title: "Orders Recovered",
            description: `We found ${recoveredOrders.length} previous order(s) and added them to your account.`,
            color: "success",
          });
        }
      }
      
      addToast({
        title: "Log in successful",
        description: "redirecting to home.",
        color: "success",
      });
    } catch (e: any) {
      addToast({
        title: "Login Failed",
        description: getErrorMessage(e),
        color: "danger",
      });
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      
      // Get the current user from context instead of from the function return
      if (user && user.email) {
        const recoveredOrders = await recoverGuestOrders(
          user.uid, 
          user.email
        );
        
        if (recoveredOrders.length > 0) {
          addToast({
            title: "Orders Recovered",
            description: `We found ${recoveredOrders.length} previous order(s) and added them to your account.`,
            color: "success",
          });
        }
      }
      
      addToast({
        title: "Log in successful",
        description: "redirecting to home.",
        color: "success",
      });
    } catch (e: any) {
      addToast({
        title: "Login Failed",
        description: getErrorMessage(e),
        color: "danger",
      });
    }
  };
  return (
    <div className="flex flex-col justify-center items-center flex-grow min-h-[80vh] sm:min-h-[50vh] stagger-fadein">
      <div className="flex flex-col p-4 w-full max-w-md">
        <h1 className="text-2xl mb-4 text-center">Login</h1>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2"
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <Input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mb-4"
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <Button
          onPress={handleEmailLogin}
          className="mb-2 w-full py-2 px-6 border bg-transparent border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
        >
          Login
        </Button>
        <Button
          onPress={handleGoogleLogin}
          className="mb-2 w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          startContent={
            <img
              src="/google-color.webp"
              alt="Google logo"
              className="w-5 h-5"
            />
          }
        >
          Use Google
        </Button>
        <div className="flex justify-between items-center">
          <Link
            href="/account/forgot-password"
            className="text-xs text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-color duration-300"
          >
            Forgot password?
          </Link>
          <Link
            href="/account/register"
            className="text-xs text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-color duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
