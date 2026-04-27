"use client";

import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`mb-1 block text-sm font-medium text-foreground ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
