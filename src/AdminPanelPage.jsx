// src/AdminPanelPage.js
import React, { useState } from 'react';

// Reusable Input Field Component (optional, but good for consistency)
const InputField = ({ label, id, type = "text", value, onChange, placeholder, required = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

// Reusable Select Field Component
const SelectField = ({ label, id, value, onChange, options, required = false }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);


export function AdminPanelPage() {
    const [activeSection, setActiveSection] = useState(null); // 'coreSite', 'coreDevice', 'simpleSite'

    // --- Core Site State and Handlers ---
    const [coreSiteData, setCoreSiteData] = useState({ name: '', location: '', description: '' });
    const handleCoreSiteChange = (e) => {
        setCoreSiteData({ ...coreSiteData, [e.target.name]: e.target.value });
    };
    const handleCoreSiteSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Core Site:", coreSiteData);
        // TODO: API call to submit data
        alert(`Core Site "${coreSiteData.name}" submitted (check console).`);
        setCoreSiteData({ name: '', location: '', description: '' }); // Reset form
        setActiveSection(null); // Optionally close form
    };

    // --- Core Device State and Handlers ---
    const [coreDeviceData, setCoreDeviceData] = useState({ name: '', type: '', ipAddress: '', associatedSite: '' });
    const coreDeviceTypes = [
        { value: 'router', label: 'Router' },
        { value: 'switch', label: 'Switch' },
        { value: 'firewall', label: 'Firewall' },
        { value: 'server', label: 'Server' },
        { value: 'iot_sensor', label: 'IoT Sensor' },
    ];
    // In a real app, you'd fetch existing core sites for this dropdown
    const exampleCoreSites = [
        { value: 'site_alpha', label: 'Alpha Datacenter' },
        { value: 'site_beta', label: 'Beta Office Branch' },
    ];
    const handleCoreDeviceChange = (e) => {
        setCoreDeviceData({ ...coreDeviceData, [e.target.name]: e.target.value });
    };
    const handleCoreDeviceSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Core Device:", coreDeviceData);
        // TODO: API call to submit data
        alert(`Core Device "${coreDeviceData.name}" submitted (check console).`);
        setCoreDeviceData({ name: '', type: '', ipAddress: '', associatedSite: '' }); // Reset form
        setActiveSection(null); // Optionally close form
    };

    // --- Simple Site State and Handlers ---
    const [simpleSiteData, setSimpleSiteData] = useState({ name: '', url: '' });
    const handleSimpleSiteChange = (e) => {
        setSimpleSiteData({ ...simpleSiteData, [e.target.name]: e.target.value });
    };
    const handleSimpleSiteSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting Simple Site:", simpleSiteData);
        // TODO: API call to submit data
        alert(`Simple Site "${simpleSiteData.name}" submitted (check console).`);
        setSimpleSiteData({ name: '', url: '' }); // Reset form
        setActiveSection(null); // Optionally close form
    };

    const renderSectionForm = () => {
        switch (activeSection) {
            case 'coreSite':
                return (
                    <form onSubmit={handleCoreSiteSubmit} className="mt-6 space-y-4 p-4 border dark:border-gray-700 rounded-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Add New Core Site</h3>
                        <InputField label="Site Name" id="name" value={coreSiteData.name} onChange={handleCoreSiteChange} placeholder="e.g., Main Datacenter" required />
                        <InputField label="Location" id="location" value={coreSiteData.location} onChange={handleCoreSiteChange} placeholder="e.g., New York, USA" required />
                        <InputField label="Description" id="description" type="textarea" value={coreSiteData.description} onChange={handleCoreSiteChange} placeholder="Brief description of the site" />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Core Site</button>
                    </form>
                );
            case 'coreDevice':
                return (
                    <form onSubmit={handleCoreDeviceSubmit} className="mt-6 space-y-4 p-4 border dark:border-gray-700 rounded-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Add New Core Device</h3>
                        <InputField label="Device Name" id="name" value={coreDeviceData.name} onChange={handleCoreDeviceChange} placeholder="e.g., Edge Router 01" required />
                        <SelectField label="Device Type" id="type" value={coreDeviceData.type} onChange={handleCoreDeviceChange} options={coreDeviceTypes} required />
                        <InputField label="IP Address" id="ipAddress" value={coreDeviceData.ipAddress} onChange={handleCoreDeviceChange} placeholder="e.g., 192.168.1.1" />
                        <SelectField label="Associated Core Site" id="associatedSite" value={coreDeviceData.associatedSite} onChange={handleCoreDeviceChange} options={exampleCoreSites} />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Core Device</button>
                    </form>
                );
            case 'simpleSite':
                return (
                    <form onSubmit={handleSimpleSiteSubmit} className="mt-6 space-y-4 p-4 border dark:border-gray-700 rounded-md">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Add New Simple Site</h3>
                        <InputField label="Site Name" id="name" value={simpleSiteData.name} onChange={handleSimpleSiteChange} placeholder="e.g., Company Blog" required />
                        <InputField label="URL" id="url" type="url" value={simpleSiteData.url} onChange={handleSimpleSiteChange} placeholder="e.g., https://example.com/blog" required />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Simple Site</button>
                    </form>
                );
            default:
                return <p className="mt-4 text-gray-600 dark:text-gray-400">Select an action above to get started.</p>;
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveSection('coreSite')}
                    className={`px-4 py-2 rounded-md text-sm font-medium
            ${activeSection === 'coreSite'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    Add Core Site
                </button>
                <button
                    onClick={() => setActiveSection('coreDevice')}
                    className={`px-4 py-2 rounded-md text-sm font-medium
            ${activeSection === 'coreDevice'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    Add Core Device
                </button>
                <button
                    onClick={() => setActiveSection('simpleSite')}
                    className={`px-4 py-2 rounded-md text-sm font-medium
            ${activeSection === 'simpleSite'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    Add Simple Site
                </button>
            </div>

            {renderSectionForm()}

            {/* You might also want a section to LIST existing items later */}
            {/* <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Existing Items</h3>
        <p className="text-gray-600 dark:text-gray-400">Display tables of core sites, devices, etc., here.</p>
      </div> */}
        </div>
    );
}