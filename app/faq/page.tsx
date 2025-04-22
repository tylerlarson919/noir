// app/faq/page.tsx
"use client";
import { Accordion, AccordionItem } from "@heroui/accordion";

export default function FaqPage() {
  const faqs = [
    {
      key: "q1",
      title: "What is Noir Clothing?",
      content:
        "Noir Clothing is our signature line of minimalist, high‑quality streetwear.",
    },
    {
      key: "q2",
      title: "How do I track my order?",
      content:
        "Once your order ships, you’ll get an email with a tracking link.",
    },
    {
      key: "q3",
      title: "Can I return or exchange items?",
      content:
        "Yes—see our Return Policy page for full details on returns and exchanges.",
    },
    {
      key: "q4",
      title: "Do you offer international shipping?",
      content:
        "We ship globally. Shipping rates and times vary by destination.",
    },
  ];

  return (
    <div className="mx-4 md:mx-16 mt-24 flex flex-col items-center overflow-hidden">
      <h1 className="text-2xl font-medium mb-4">FAQ</h1>
      <Accordion>
        {faqs.map(({ key, title, content }) => (
          <AccordionItem key={key} aria-label={title} title={title}>
            <p className="text-gray-600">{content}</p>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
