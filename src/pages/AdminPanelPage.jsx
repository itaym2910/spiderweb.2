// src/AdminPanelPage.js
import React, { useState } from "react";
// --- Redux Imports ---
import { useDispatch, useSelector } from "react-redux";
import { addCoreDevice } from "../redux/slices/devicesSlice"; // Action for adding
import { addCorePikudim } from "../redux/slices/corePikudimSlice"; // Action for adding
import { selectAllPikudim } from "../redux/slices/corePikudimSlice"; // Selector for reading
import { selectAllNetTypes } from "../redux/slices/netTypesSlice"; // Selector for reading

// --- Reusable UI Components (remain unchanged) ---
const InputField = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="mb-4">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
    />
  </div>
);

const SelectField = ({
  label,
  id,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="mb-4">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-gray-100"
    >
      <option value="">-- Select --</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export function AdminPanelPage() {
  // --- Redux Hooks ---
  const dispatch = useDispatch();
  // Use `useSelector` to read data FROM the Redux store to populate our dropdowns
  const allPikudim = useSelector(selectAllPikudim);
  const allNetTypes = useSelector(selectAllNetTypes);

  // --- Component State ---
  const [activeSection, setActiveSection] = useState(null);
  const [coreSiteData, setCoreSiteData] = useState({
    name: "",
    location: "",
    type_id: "",
  });
  const [coreDeviceData, setCoreDeviceData] = useState({
    hostname: "",
    ip_address: "",
    network_type_id: "",
    core_pikudim_site_id: "",
  });

  // --- Data Transformation for Select Fields ---
  // Transform the data from Redux into the format the <SelectField> expects
  const pikudimOptions = allPikudim.map((p) => ({
    value: p.id,
    label: p.core_site_name,
  }));
  const netTypeOptions = allNetTypes.map((nt) => ({
    value: nt.id,
    label: nt.name,
  }));

  // --- Handlers that Dispatch Redux Actions ---
  const handleCoreSiteSubmit = (e) => {
    e.preventDefault();
    const newPikud = {
      id: Date.now(), // Generate a temporary unique ID
      core_site_name: coreSiteData.name,
      location: coreSiteData.location,
      type_id: parseInt(coreSiteData.type_id, 10), // Ensure it's a number
      timestamp: new Date().toISOString(),
    };
    // DISPATCH the action to the Redux store
    dispatch(addCorePikudim(newPikud));
    alert(`Core Pikud "${newPikud.core_site_name}" submitted!`);
    setCoreSiteData({ name: "", location: "", type_id: "" }); // Reset form
  };

  const handleCoreDeviceSubmit = (e) => {
    e.preventDefault();
    const newDevice = {
      id: Date.now(), // Generate a temporary unique ID
      hostname: coreDeviceData.hostname,
      ip_address: coreDeviceData.ip_address,
      network_type_id: parseInt(coreDeviceData.network_type_id, 10),
      core_pikudim_site_id: parseInt(coreDeviceData.core_pikudim_site_id, 10),
      timestamp: new Date().toISOString(),
    };
    // DISPATCH the action to the Redux store
    dispatch(addCoreDevice(newDevice));
    alert(`Core Device "${newDevice.hostname}" submitted!`);
    setCoreDeviceData({
      hostname: "",
      ip_address: "",
      network_type_id: "",
      core_pikudim_site_id: "",
    });
  };

  // --- Form Rendering Logic ---
  const renderSectionForm = () => {
    switch (activeSection) {
      case "coreSite":
        return (
          <form
            onSubmit={handleCoreSiteSubmit}
            className="mt-6 space-y-4 p-4 border dark:border-gray-700 rounded-md"
          >
            <h3 className="text-lg font-medium">Add New Core Pikud</h3>
            <InputField
              label="Site Name"
              id="name"
              value={coreSiteData.name}
              onChange={(e) =>
                setCoreSiteData({ ...coreSiteData, name: e.target.value })
              }
              required
            />
            <InputField
              label="Location"
              id="location"
              value={coreSiteData.location}
              onChange={(e) =>
                setCoreSiteData({ ...coreSiteData, location: e.target.value })
              }
              required
            />
            <SelectField
              label="Type"
              id="type_id"
              value={coreSiteData.type_id}
              onChange={(e) =>
                setCoreSiteData({ ...coreSiteData, type_id: e.target.value })
              }
              options={[
                { value: 1, label: "L-Chart" },
                { value: 2, label: "P-Chart" },
              ]}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Core Pikud
            </button>
          </form>
        );
      case "coreDevice":
        return (
          <form
            onSubmit={handleCoreDeviceSubmit}
            className="mt-6 space-y-4 p-4 border dark:border-gray-700 rounded-md"
          >
            <h3 className="text-lg font-medium">Add New Core Device</h3>
            <InputField
              label="Hostname"
              id="hostname"
              value={coreDeviceData.hostname}
              onChange={(e) =>
                setCoreDeviceData({
                  ...coreDeviceData,
                  hostname: e.target.value,
                })
              }
              required
            />
            <InputField
              label="IP Address"
              id="ip_address"
              value={coreDeviceData.ip_address}
              onChange={(e) =>
                setCoreDeviceData({
                  ...coreDeviceData,
                  ip_address: e.target.value,
                })
              }
              required
            />
            <SelectField
              label="Associated Pikud"
              id="core_pikudim_site_id"
              value={coreDeviceData.core_pikudim_site_id}
              onChange={(e) =>
                setCoreDeviceData({
                  ...coreDeviceData,
                  core_pikudim_site_id: e.target.value,
                })
              }
              options={pikudimOptions}
              required
            />
            <SelectField
              label="Network Type"
              id="network_type_id"
              value={coreDeviceData.network_type_id}
              onChange={(e) =>
                setCoreDeviceData({
                  ...coreDeviceData,
                  network_type_id: e.target.value,
                })
              }
              options={netTypeOptions}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Core Device
            </button>
          </form>
        );
      default:
        return (
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Select an action above to get started.
          </p>
        );
    }
  };

  // --- Main JSX Return ---
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSection("coreSite")}
          className={`px-4 py-2 rounded-md ${
            activeSection === "coreSite"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Add Core Pikud
        </button>
        <button
          onClick={() => setActiveSection("coreDevice")}
          className={`px-4 py-2 rounded-md ${
            activeSection === "coreDevice"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          Add Core Device
        </button>
      </div>
      {renderSectionForm()}
    </div>
  );
}
