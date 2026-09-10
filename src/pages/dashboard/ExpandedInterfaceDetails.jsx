import React from "react";

export function ExpandedInterfaceDetails({ row }) {
  const link = row.raw;

  if (!link) {
    return <div className="text-gray-500">No details available.</div>;
  }

  const renderField = (label, value) => (
    <div className="flex flex-col mb-4">
      <span className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-gray-100 break-words">
        {value !== null && value !== undefined && value !== "" ? String(value) : "-"}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-3">General Info</h4>
        {renderField("ID", link.id)}
        {renderField("Name", link.name)}
        {renderField("Description", link.description)}
        {renderField("Media Type", link.media_type)}
        {renderField("Created At", link.created_at ? new Date(link.created_at).toLocaleString() : null)}
        {renderField("Crawler Cycle", link.crawler_cycle)}
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-3">Status & Protocol</h4>
        {renderField("Physical Status", link.physical_status)}
        {renderField("Protocol Status", link.protocol_status)}
        {renderField("MPLS LDP", link.mpls_ldp)}
        {renderField("OSPF", link.ospf)}
        {renderField("OSPF Interface Address", link.ospf_interface_address)}
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-3">Metrics & Traffic</h4>
        {renderField("Bandwidth (BW)", link.bw)}
        {renderField("MTU", link.mtu)}
        {renderField("Input Rate", link.input_rate)}
        {renderField("Output Rate", link.output_rate)}
        {renderField("TX Rate", link.tx)}
        {renderField("RX Rate", link.rx)}
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-3">Neighbors & Devices</h4>
        {renderField("Core Device", link.coredevice?.name || "-")}
        {renderField("Core Device IP", link.coredevice?.ip || "-")}
        {renderField("Interface IP", link.interface_ip)}
        {renderField("Neighbor Site", link.neighbor_site?.name || "-")}
        {renderField("Neighbor Device", link.neighbor_coredevice?.name || "-")}
        {renderField("Neighbor IP", link.neighbor_ip)}
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-2 border-t pt-4 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {renderField("Input Errors", link.input_errors)}
          {renderField("Output Errors", link.output_errors)}
          {renderField("CRC Errors", link.crc)}
        </div>
      </div>
    </div>
  );
}
