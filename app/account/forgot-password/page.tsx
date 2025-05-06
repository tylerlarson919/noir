"use client";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { addToast } from "@heroui/toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    try {
      await resetPassword(email);
      addToast({
        title: "Email Sent",
        description: "Check your inbox for the reset link.",
        color: "success",
      });
    } catch (e: any) {
      addToast({
        title: "Error",
        description: e.code === "auth/user-not-found"
          ? "No user with that email."
          : "Couldn’t send reset email.",
        color: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col justify-center items-center flex-grow min-h-[80vh] sm:min-h-[50vh] stagger-fadein">
      <div className="flex flex-col p-4 w-full max-w-md">
        <h1 className="text-2xl mb-4 text-center">Reset Password</h1>
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-2"
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <Button
          onPress={handleReset}
          className="mb-2 w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          radius="sm"
        >
          Send Reset Link
        </Button>
        <Link
            href="/account/login"
            className="text-xs font-medium text-black/40 dark:text-white/40 hover:text-black hover:dark:text-white transition-color duration-300"
          >
            Back to Login
          </Link>
      </div>
    </div>
  );
}
