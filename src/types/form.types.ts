import React from "react";

export interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  // Allow a broader icon prop shape to accommodate lucide-react components
  icon: React.ComponentType<any>;
  required?: boolean;
}