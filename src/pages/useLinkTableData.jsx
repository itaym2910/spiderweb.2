import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllSites } from "../redux/slices/sitesSlice";
import { selectLinksByTypeId } from "../redux/slices/tenGigLinksSlice";
import { useParams } from "react-router-dom";

// --- MODIFIED: Accept chartType as an argument ---
export function useLinkTableData(chartType) {
  // We still get the deviceHostname from the URL params
  const { nodeId: deviceHostname } = useParams();

  const allDevices = useSelector(selectAllDevices);
  const allSites = useSelector(selectAllSites);

  // Now we use the chartType prop to get the correct link type ID
  const typeId = chartType === "P" ? 2 : 1;
  const allCoreLinks = useSelector((state) =>
    selectLinksByTypeId(state, typeId)
  );

  // 2. Derive the final, categorized list of links using useMemo for performance
  const links = useMemo(() => {
    if (!deviceHostname || !allDevices.length) {
      return [];
    }

    // Find the full object for the currently viewed device
    const currentDevice = allDevices.find((d) => d.hostname === deviceHostname);
    if (!currentDevice) return [];

    // Create a map of all devices by hostname for quick lookups
    const deviceMapByHostname = new Map(allDevices.map((d) => [d.hostname, d]));

    // --- CATEGORY 1 & 2: Inter-Core Links ---
    const interCoreLinks = allCoreLinks
      .filter(
        (link) =>
          link.source === deviceHostname || link.target === deviceHostname
      )
      .map((link) => {
        const otherDeviceHostname =
          link.source === deviceHostname ? link.target : link.source;
        const otherDevice = deviceMapByHostname.get(otherDeviceHostname);

        let linkType = "inter-core-different-site";
        if (
          otherDevice &&
          otherDevice.core_pikudim_site_id ===
            currentDevice.core_pikudim_site_id
        ) {
          linkType = "inter-core-same-site";
        }

        return {
          id: link.id,
          name: `Link to ${otherDeviceHostname}`,
          description: `Inter-Core Link (${
            linkType.includes("same") ? "Same Site" : "Different Site"
          })`,
          status: link.status,
          bandwidth: link.bandwidth,
          ospfStatus: "Enabled", // Placeholder
          mplsStatus: "Enabled", // Placeholder
          type: linkType,
          // You can add real additionalDetails here if they exist on the link object
        };
      });

    // --- CATEGORY 3: Core-to-Site Links (Synthesized) ---
    const coreToSiteLinks = allSites
      .filter((site) => site.device_id === currentDevice.id)
      .map((site) => {
        // Create a "pseudo-link" object that has the same shape as a real link
        return {
          id: `site-link-${site.id}`, // Create a unique ID
          name: site.site_name_english,
          description: `Connection to End-Site`,
          status: "up", // Assume sites are 'up' for visual purposes
          bandwidth: "1 Gbps", // Placeholder
          ospfStatus: "N/A",
          mplsStatus: "N/A",
          type: "core-to-site",
          additionalDetails: {
            mediaType: "Ethernet/Fiber",
            containerName: site.site_name_hebrew, // Use Hebrew name for extra detail
          },
        };
      });

    // 3. Combine all categories into a single list
    return [...interCoreLinks, ...coreToSiteLinks];
  }, [deviceHostname, allDevices, allSites, allCoreLinks]);

  return links; // Return the final, combined array of all link types
}
