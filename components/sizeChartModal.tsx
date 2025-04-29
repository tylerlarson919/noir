// src/components/sizeChartModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface SizeChartModalProps {
  productSizeChart: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeChartModal({ isOpen, onClose, productSizeChart }: SizeChartModalProps) {
    const [isRendered, setIsRendered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (isOpen && event.key === 'Escape') {
            onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && !isRendered) {
          setIsRendered(true);
          // Small delay to ensure DOM is updated before starting animation
          setTimeout(() => setIsAnimating(true), 10);
        } else if (!isOpen && isRendered) {
          setIsAnimating(false);
          // Wait for animation to complete before removing from DOM
          const timer = setTimeout(() => setIsRendered(false), 300);
          return () => clearTimeout(timer);
        }
      }, [isOpen, isRendered]);
      
      if (!isRendered) return null;
  
      return (
        <div 
          className={`fixed inset-0 bg-black z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 ease-in-out ${
            isAnimating ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isOpen}
        >
          <button 
            className="absolute inset-0 w-full h-full cursor-default bg-transparent"
            onClick={onClose}
            aria-label="Close modal"
          />
          <div 
            ref={modalContentRef}
            className={`rounded-lg shadow-xl w-fit max-h-[80vh] flex flex-col transition-transform duration-300 relative ${
              isAnimating ? 'scale-100' : 'scale-95'
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-chart-title"
          >
            <div className="flex justify-between items-center p-4 absolute top-0 right-0 left-0">
              <h2 className="text-xl font-semibold text-black">Size Chart</h2>
              <button 
                onClick={onClose}
                className="text-black hover:text-black/50 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        
        <div className="p-0 w-full h-full">
            <Image alt="Size Chart" className="w-fit max-h-1/4 rounded-lg" src={productSizeChart} height={800} width={400}/>
        </div>
      </div>
    </div>
  );
}