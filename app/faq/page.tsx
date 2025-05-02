// app/faq/page.tsx
"use client";
import { Accordion, AccordionItem } from "@heroui/accordion";

export default function FaqPage() {
  const faqs1 = [
    {
      key: "q1",
      title: "Which size should I order?",
      content: (
        <>
          The fit of our products is oversized. You can also check the sizing of each 
          product in the corresponding product size guide on the product page.
          <div className="my-4" />
          If you still have doubts regarding which size you should order, please 
          do not hesitate to contact us{' '}
          <a href="/contact" className="underline">
            here
          </a>.
        </>
      ),
    },
    {
      key: "q2",
      title: "Which payment methods do you accept?",
      content: (
        <>
          We currently accept the following payment methods:
          <div className="my-4" />
          Visa, MasterCard, American Express, Link (Shop) Pay, Apple Pay, Google Pay, Amazon Pay, Cash App Pay, and Klarna.
        </>
      ),
    },
    {
      key: "q3",
      title: "How can I cancel my order?",
      content: (
        <>
          If your order hasn’t been prepared yet, we can modify it or cancel it without any problems. To do this, please contact us stating your order number and any other relevant information{' '}
          <a href="/contact" className="underline">
            here
          </a>.
          <div className="my-4" />
          If we cannot modify or cancel your order, you will need to request a return.
        </>
      ),
    },
    {
      key: "q4",
      title: "What if I receive the wrong product?",
      content: (
        <>
          Even though this rarely occurs, mistakes can happen; hence, you might receive the wrong product. In this case, contact us{' '}
          <a href="/contact" className="underline">
            here
          </a>.
        </>
      ),
    },
    {
      key: "q5",
      title: "What should I do if my payment does not go through?",
      content: (
        <>
          If your payment failed at our checkout page, we recommend clearing your cache and cookies, or even using a different payment method. If your payment still fails, please{' '}
          <a href="/contact" className="underline">
            contact us
          </a>.
        </>
      ),
    },
  ];

  const faqs2 = [
    {
      key: "q1",
      title: "How long does shipping take?",
      content: (
        <>
          Since shipping varies depending on the destination, please check our{' '}
          <a href="/shipping-and-returns" className="underline">
            shipping policy
          </a>{' '}for the estimated shipping times.
        </>
      ),
    },
    {
      key: "q2",
      title: "When will my order ship?",
      content:
        "As soon as an order enters our system, it is transferred and shipped as soon as possible. If demand is high, this process might take longer than usual.",
    },
    {
      key: "q3",
      title: "How can I track my package?",
      content: (
        <>
          When your order ships, you will receive an email containing the tracking information of your order.
          <div className="my-4" />
          You can also track your order{' '}
          <a href="/track-order" className="underline">
            here
          </a>, once you&apos;ve placed an order.
        </>
      ),
    },
    {
      key: "q4",
      title: "Is my order subject to custom fees?",
      content: (
        <>
          No. All taxes are covered by Noir.
          <div className="my-4" />
          For more information check our{' '}
          <a href="/shipping-and-returns" className="underline">
            Shipping Policy
          </a>.
        </>
      ),
    },
  ];

  const faqs3 = [
    {
      key: "q1",
      title: "If I’m not happy with my purchase, can I return it?",
      content: (
        <>
          If you are not entirely satisfied with your recent Scuffers order, we will gladly accept any 
          items that are in new condition and have not been worn, washed, or altered.
          <div className="my-4" />
          For more information regarding return costs you can check our{' '}
          <a href="/shipping-and-returns" className="underline">
            Returns Policy
          </a>.
        </>
      ),
    },
    {
      key: "q2",
      title: "How long do I have to request a return?",
      content: (
        <>
          We allow up to{' '}<span className="font-bold">14 days</span>{' '}since you received your order, or placed your purchase in-store to request a return.
        </>
      ),
    },
    {
      key: "q3",
      title: "Is there a charge for making a return?",
      content: (
        <>
          Yes. All returns will incur a charge.
          <div className="my-4" />
          For more information check our{' '}
          <a href="/shipping-and-returns" className="underline">
            Returns Policy
          </a>.
        </>
      ),
    },
    {
      key: "q4",
      title: "How long will it take to process my refund?",
      content: (
        <>
          Please allow up to{' '}
          <span className="font-bold">
            14 days
          </span>{' '}for us to receive and process your return. You will receive an email notification upon the fulfillment of return processing.
        </>
      ),
    },
  ];

  return (
    <div className="mx-4 md:mx-16 mt-28 mb-16 flex justify-center">
      <div className="flex flex-col w-full max-w-[800px] stagger-fadein">
        <div>
          <h1 className="text-4xl font-medium mb-4">FAQs</h1>
          <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Order & Payment</h2>
          <Accordion className="px-0">
            {faqs1.map(({ key, title, content }) => (
              <AccordionItem key={key} aria-label={title} title={title} classNames={{ title: "text-sm font-medium" }}>
                <div className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">{content}</div>
              </AccordionItem>
            ))}
          </Accordion>
          <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Shipping</h2>
          <Accordion className="px-0">
            {faqs2.map(({ key, title, content }) => (
              <AccordionItem key={key} aria-label={title} title={title} classNames={{ title: "text-sm font-medium" }}>
                <div className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">{content}</div>
              </AccordionItem>
            ))}
          </Accordion>
          <hr className="shrink-0 bg-divider border-none w-full h-divider"/>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mt-8 mb-2">Returns</h2>
          <Accordion className="px-0">
            {faqs3.map(({ key, title, content }) => (
              <AccordionItem key={key} aria-label={title} title={title} classNames={{ title: "text-sm font-medium" }}>
                <div className="text-gray-800 dark:text-gray-400 text-sm leading-relaxed">{content}</div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}