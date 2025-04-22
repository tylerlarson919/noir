"use client";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user, router]);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const getErrorMessage = (error: any) => {
    const errorCode = error.code || "";

    // Map common Firebase error codes to user-friendly messages
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      case "auth/operation-not-allowed":
        return "Registration is currently disabled. Please try again later.";
      default:
        return "An error occurred during registration. Please try again.";
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, pw);
      addToast({
        title: "Account created",
        description: "Redirecting to your account…",
        color: "success",
      });
    } catch (e: any) {
      addToast({
        title: "Registration Failed",
        description: getErrorMessage(e),
        color: "danger",
      });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      addToast({
        title: "Signed up with Google",
        description: "Redirecting to your account…",

        color: "success",
      });
    } catch (e: any) {
      addToast({
        title: "Google Sign-up Failed",
        description: getErrorMessage(e),
        color: "danger",
      });
    }
  };

  return (
    <div className="absolute inset-0 m-auto flex justify-center items-center w-full">
      <div className="flex flex-col w-[350px] h-[300px] p-4">
        <h1 className="text-2xl mb-4 text-center">Register</h1>
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
          onPress={handleRegister}
          className="mb-2 w-full py-2 px-6 border bg-transparent border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
        >
          Register
        </Button>
        <Button
          onPress={handleGoogleSignup}
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
            href="/account/login"
            className="text-xs text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-color duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
