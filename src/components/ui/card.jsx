import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 shadow-md rounded-xl border dark:border-gray-700 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}
