// app/contact/page.tsx
"use client";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real submit logic
    console.log("submit", form);
  };

  return (
    <div className="flex flex-col justify-center items-center flex-grow min-h-[80vh] sm:min-h-[50vh]">
      <div className="flex flex-col p-4 w-full max-w-md stagger-fadein">
        <h1 className="text-4xl font-medium mb-6 text-left">Contact Us</h1>
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
          <Button
            type="submit"
            className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
          >
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
