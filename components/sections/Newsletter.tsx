import React from 'react';
import Button from '@/components/ui/button';

const Newsletter: React.FC = () => {
  return (
    <section className="bg-gray-100 py-12 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Join Our Newsletter</h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Sign up to receive updates on new arrivals, special offers, and style inspiration.
        </p>
        
        <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <Button text="Subscribe" type="submit" />
        </form>
      </div>
    </section>
  );
};

export default Newsletter;