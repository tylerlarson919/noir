// app/contact/page.tsx
"use client";
import { useState, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import ReCAPTCHA from "react-google-recaptcha";
import { addToast } from "@heroui/toast";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) return
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, recaptchaToken }),
      })
      if (res.ok) {
        // clear form & recaptcha
        setForm({ name: '', email: '', message: '' })
        recaptchaRef.current?.reset()
        setRecaptchaToken(null)
        addToast({
          title: "Message Sent",
          description: "Thank you! We'll get back to you as soon as possible.",
          color: "success",
        });
      } else {
        addToast({
          title: "Failed",
          description: "Submission failed. Please try again.",
          color: "danger",
        });
      }
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
  };

  return (
    <div className="mx-4 md:mx-16 mt-20 mb-16 stagger-fadein flex flex-col items-center">
      <div className="flex flex-col py-4 w-full max-w-[800px] stagger-fadein">
        <h1 className="text-4xl font-medium mb-2 text-left">Contact Us</h1>
        <p className="mb-6">Please, before contacting us, check our FAQs. Find all the answers{' '}<a href="/faq" className="underline">here</a>.</p>
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
          <div className="relative">
            <label
              htmlFor="message"
              className="text-xs absolute top-2 left-[13px] pointer-events-none text-black/60 dark:text-[#d2d2d6]"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Message... (If you have any questions or issues regarding a placed order, please include your order number in your message so that we can expedite your case. Thank you very much.)"
              value={form.message}
              onChange={handleChange}
              className="
                w-full
                rounded-sm
                border
                bg-transparent
                border-black/30
                dark:border-textaccent/30
                dark:placeholder-[#a1a1aa]
                p-[12px]
                pt-6
                resize-none
                text-sm
                transition-colors
                placeholder-black/60
                focus:outline-none
                focus:ring-0
                focus:bg-white/10
                dark:focus:bg-white/10
                hover:bg-black/10
                dark:hover:bg-[#3f3f46]
              "
            />
          </div>
          <div className="h-full w-full flex justify-center px-4">
            <div className="h-full w-full max-w-[310px] ">
              <ReCAPTCHA
                ref={recaptchaRef}
                size="normal"
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={!recaptchaToken}
            className={`w-full py-2 px-6 rounded-sm transition-colors duration-300 ${
              recaptchaToken
                ? "bg-dark1 dark:bg-white text-white dark:text-black button-grow-subtle"
                : "bg-black/20 text-white cursor-not-allowed"
            }`}
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
