import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({ text, onClick, type = "button" }) => {
  return (
    <button
      className="font-medium rounded focus:outline-none transition-colors duration-200 bg-black text-white hover:bg-gray-800 px-4 py-2"
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default Button;
