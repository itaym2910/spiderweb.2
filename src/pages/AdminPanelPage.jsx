// src/AdminPanelPage.js
import React, { useState } from "react";
// --- Redux Imports ---
import { useDispatch, useSelector } from "react-redux";
import { addCoreDevice } from "../redux/slices/devicesSlice";
import { addCorePikudim } from "../redux/slices/corePikudimSlice";
import { selectAllPikudim } from "../redux/slices/corePikudimSlice";
import { selectAllNetTypes } from "../redux/slices/netTypesSlice";
import { MdSettings } from "react-icons/md"; // For a placeholder icon

// --- STYLES UPDATED ---
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
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
    />
  </div>
);

// --- STYLES UPDATED ---
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
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
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

// --- STYLES UPDATED ---
export function AdminPanelPage() {
  const dispatch = useDispatch();
  const allPikudim = useSelector(selectAllPikudim);
  const allNetTypes = useSelector(selectAllNetTypes);

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

  const pikudimOptions = allPikudim.map((p) => ({
    value: p.id,
    label: p.core_site_name,
  }));
  const netTypeOptions = allNetTypes.map((nt) => ({
    value: nt.id,
    label: nt.name,
  }));

  const handleCoreSiteSubmit = (e) => {
    e.preventDefault();
    const newPikud = {
      id: Date.now(),
      core_site_name: coreSiteData.name,
      location: coreSiteData.location,
      type_id: parseInt(coreSiteData.type_id, 10),
      timestamp: new Date().toISOString(),
    };
    dispatch(addCorePikudim(newPikud));
    alert(`Core Pikud "${newPikud.core_site_name}" submitted!`);
    setCoreSiteData({ name: "", location: "", type_id: "" });
  };

  const handleCoreDeviceSubmit = (e) => {
    e.preventDefault();
    const newDevice = {
      id: Date.now(),
      hostname: coreDeviceData.hostname,
      ip_address: coreDeviceData.ip_address,
      network_type_id: parseInt(coreDeviceData.network_type_id, 10),
      core_pikudim_site_id: parseInt(coreDeviceData.core_pikudim_site_id, 10),
      timestamp: new Date().toISOString(),
    };
    dispatch(addCoreDevice(newDevice));
    alert(`Core Device "${newDevice.hostname}" submitted!`);
    setCoreDeviceData({
      hostname: "",
      ip_address: "",
      network_type_id: "",
      core_pikudim_site_id: "",
    });
  };

  const renderSectionForm = () => {
    switch (activeSection) {
      case "coreSite":
        return (
          <form
            onSubmit={handleCoreSiteSubmit}
            className="mt-6 space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Add New Core Pikud
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Add Core Pikud
            </button>
          </form>
        );
      case "coreDevice":
        return (
          <form
            onSubmit={handleCoreDeviceSubmit}
            className="mt-6 space-y-4 p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Add New Core Device
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Add Core Device
            </button>
          </form>
        );
      default:
        return (
          <div className="text-center py-16 px-4 mt-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <MdSettings
              size={56}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
            />
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
              Admin Control
            </p>
            <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
              Select an action above to manage system entities.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Admin Panel
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          Manage core system entities like Pikudim and Devices.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSection("coreSite")}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
              activeSection === "coreSite"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Add Core Pikud
          </button>
          <button
            onClick={() => setActiveSection("coreDevice")}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
              activeSection === "coreDevice"
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Add Core Device
          </button>
        </div>
        {renderSectionForm()}
      </div>
    </div>
  );
}
