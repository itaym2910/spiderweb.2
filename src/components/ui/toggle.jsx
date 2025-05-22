import React, { useState } from "react";

export function Toggle({
  label,
  onToggle,
  defaultChecked = false,
  className = "",
}) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = () => {
    const newState = !checked;
    setChecked(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <span className="mr-2 text-sm text-gray-700">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
        />
        <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );
}
