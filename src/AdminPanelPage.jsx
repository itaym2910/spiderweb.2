// src/AdminPanelPage.js
import React from 'react';

export function AdminPanelPage() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Admin Panel</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Welcome to the Admin Panel. Manage users, settings, and more.
      </p>
      {/* Add more admin-specific content here */}
    </div>
  );
}