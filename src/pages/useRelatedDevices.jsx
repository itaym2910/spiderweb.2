import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectAllDevices } from "../redux/slices/devicesSlice";
import { selectAllPikudim } from "../redux/slices/corePikudimSlice";

export function useRelatedDevices(currentDeviceName, currentZoneName) {
  const allDevices = useSelector(selectAllDevices);
  const allPikudim = useSelector(selectAllPikudim);

  const relatedDevices = useMemo(() => {
    // This console.log is great for debugging
    // console.log("Hook called with:", { currentDeviceName, currentZoneName });

    if (
      !currentDeviceName ||
      !currentZoneName ||
      !allDevices.length ||
      !allPikudim.length
    ) {
      return [];
    }

    const currentPikud = allPikudim.find(
      (p) => p.core_site_name === currentZoneName
    );
    if (!currentPikud) {
      // console.log("Could not find Pikud for zone:", currentZoneName);
      return [];
    }
    const currentPikudId = currentPikud.id;
    // console.log("Found Pikud ID:", currentPikudId);

    const devicesInSamePikud = allDevices.filter(
      // --- THIS IS THE FIX ---
      // Corrected 'core_pukudim_site_id' to 'core_pikudim_site_id'
      (device) => device.core_pikudim_site_id === currentPikudId
    );
    // console.log("Found devices in same Pikud:", devicesInSamePikud);

    const otherDevices = devicesInSamePikud.filter(
      (device) => device.hostname !== currentDeviceName
    );
    // console.log("Found OTHER devices:", otherDevices);

    return otherDevices.map((device) => ({
      ...device,
      zoneName: currentZoneName,
    }));
  }, [currentDeviceName, currentZoneName, allDevices, allPikudim]);

  return relatedDevices;
}
