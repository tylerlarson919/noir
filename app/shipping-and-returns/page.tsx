// app/return-policy/page.tsx
import Link from "next/link";
export default function ReturnPolicyPage() {
  return (
    <div className="mx-4 md:mx-16 mt-24 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-medium mb-4 text-center">Return Policy</h1>
      <div className="flex flex-col items-center justify-start leading-relaxed gap-2">
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          Our policy is 30 days. If 30 days have passed since your purchase, unfortunately we are unable to offer a refund or exchange.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          To be eligible for a return, the item must be unused and in the same condition in which you received it. It must also be in its original packaging.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          Fill <Link href="/contact" className="font-bold underline">THIS FORM</Link> and we will send you all the info about your refund or exchange.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          There are several types of goods that are exempt from being returned. 
          * Gift cards
          * Downloadable software products
          * Some health and personal care products
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          Please do not send your return purchase to the manufacturer. To complete your return, we require a receipt or proof of purchase.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          There are some situations where only partial refunds can be guaranteed: (if applicable).
          * Any item that is not in its original condition, is damaged or missing parts for reasons beyond our control.
          * Any item that is returned more than 30 days after shipment.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-left font-bold">
          Refunds (where applicable):
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          Once your return is received and inspected, we will send an email to notify you that we have received your return. We will also notify you of the approval or denial of your refund.
          If you are approved, then your refund will be processed and a credit will be automatically applied to your credit card or original method of payment, within a certain amount of days.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-left font-bold">
          Late or Missing Refunds (where applicable):
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          If you have not yet received your refund, please check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted.
          Next step, contact your bank. It often takes some time before your refund is posted. If you have followed all of these steps and still have not received your refund, please contact us at info@noir-clothing.com
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-left font-bold">
          Gifts
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          If the item was marked as a gift when it was purchased and shipped directly to you, you will receive a gift credit for the value of the return. Once we receive the item, a gift certificate will be mailed to you.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          If the item was not marked as a gift when purchased, or the gift was shipped to the buyer for delivery to you at a later date, we will send a refund to the buyer and he will know about your return.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-left font-bold">
          Shipping
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          To return your product, you must send it to: Calle Pino Silvestre 11, 41016, Sevilla (Spain).
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          You will be responsible for paying the shipping costs for the return of the item. Shipping costs are non-refundable. If you receive a refund, the return shipping cost will be deducted from your refund.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          Depending on where you live, the time it takes to receive the exchanged product may vary.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-left">
          If you are shipping a product with a value greater than €75, you should consider using a trackable shipping service or purchasing shipping insurance. We do not guarantee that we will receive your return.
        </p>
        </div>
    </div>
  );
}
