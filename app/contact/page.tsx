// app/contact/page.tsx
"use client";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import ReCAPTCHA from "react-google-recaptcha";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [captchaOK, setCaptchaOK] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRecaptcha = (val: string | null) => setCaptchaOK(!!val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaOK) return alert("Please verify you’re human");
    // TODO: replace with real submit logic
    console.log("submit", form);
  };

  return (
    <div className="mx-4 md:mx-16 mt-24 max-w-xl">
      <h1 className="text-2xl font-medium mb-4">Contact Us</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          labelPlacement="inside"
          label="Name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <Input
          name="email"
          labelPlacement="inside"
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <div>
          <label className="sr-only" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Your message..."
            value={form.message}
            onChange={handleChange}
            className="w-full rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30 p-2 resize-none"
          />
        </div>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={handleRecaptcha}
        />
        <Button
          type="submit"
          disabled={!captchaOK}
          className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
        >
          Send Message
        </Button>
      </form>
    </div>
  );
}
