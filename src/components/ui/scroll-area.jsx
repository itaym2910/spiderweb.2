import React from "react";

export function ScrollArea({ children, className = "", style = {} }) {
  return (
    <div
      className={`overflow-auto max-h-96 rounded-md border ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
