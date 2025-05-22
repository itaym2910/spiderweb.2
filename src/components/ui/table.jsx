import React from "react";

export function Table({ children, className = "" }) {
  return (
    <table className={`min-w-full text-sm text-left ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead className={`bg-gray-100 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className = "" }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-4 py-2 text-gray-700 dark:text-gray-200 ${className}`}>
      {children}
    </td>
  );
}
