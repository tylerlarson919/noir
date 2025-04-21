import React from "react";
import Link from "next/link";

import Button from "@/components/ui/button";

interface CategoryPreviewProps {
  title: string;
  description: string;
  imageSrc: string;
  ctaText: string;
  ctaLink: string;
  imagePosition?: "left" | "right";
}

const CategoryPreview: React.FC<CategoryPreviewProps> = ({
  title,
  description,
  imageSrc,
  ctaText,
  ctaLink,
  imagePosition = "left",
}) => {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div
          className={`flex flex-col ${imagePosition === "right" ? "md:flex-row" : "md:flex-row-reverse"} items-center`}
        >
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div
              className="h-96 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />
          </div>

          <div
            className={`w-full md:w-1/2 ${imagePosition === "right" ? "md:pr-12" : "md:pl-12"}`}
          >
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{description}</p>
            <Link href={ctaLink}>
              <Button text={ctaText} variant="outline" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryPreview;
