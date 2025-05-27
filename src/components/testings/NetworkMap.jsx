import React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const NetworkMap = () => {
  const coreSites = [
    {
      id: "core-site-1",
      name: "Core Site 1",
      x: 400,
      y: 200,
      coreDevices: [
        {
          id: "core-device-1",
          name: "Core Device A",
          x: 300,
          y: 300,
          sites: [
            { id: "site-1", name: "Site 1", x: 250, y: 370 },
            { id: "site-2", name: "Site 2", x: 350, y: 370 },
          ],
        },
        {
          id: "core-device-2",
          name: "Core Device B",
          x: 500,
          y: 300,
          sites: [
            { id: "site-3", name: "Site 3", x: 450, y: 370 },
            { id: "site-4", name: "Site 4", x: 550, y: 370 },
          ],
        },
      ],
    },
  ];

  return (
    <div className="w-full h-screen bg-gray-100 overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        centerOnInit
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent>
          <div className="relative w-[2000px] h-[2000px]">
            {/* Core Sites */}
            {coreSites.map((coreSite) => (
              <div
                key={coreSite.id}
                className="absolute text-white text-sm font-bold flex items-center justify-center transition-transform duration-200 hover:scale-105"
                style={{
                  width: 120,
                  height: 120,
                  left: coreSite.x,
                  top: coreSite.y,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed)",
                  boxShadow: "0 0 8px rgba(124, 58, 237, 0.3)",
                }}
              >
                A
              </div>
            ))}

            {/* Core Devices */}
            {coreSites.flatMap((coreSite) =>
              coreSite.coreDevices.map((device) => (
                <div
                  key={device.id}
                  className="absolute text-white text-sm font-semibold flex items-center justify-center transition-transform duration-200 hover:scale-105"
                  style={{
                    width: 80,
                    height: 80,
                    left: device.x,
                    top: device.y,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 30% 30%, #60a5fa, #3b82f6)",
                    boxShadow: "0 0 6px rgba(59, 130, 246, 0.3)",
                  }}
                >
                  10
                </div>
              ))
            )}

            {/* Sites */}
            {coreSites.flatMap((coreSite) =>
              coreSite.coreDevices.flatMap((device) =>
                device.sites.map((site) => (
                  <div
                    key={site.id}
                    className="absolute text-white text-xs font-medium flex items-center justify-center transition-transform duration-200 hover:scale-110"
                    style={{
                      width: 50,
                      height: 50,
                      left: site.x,
                      top: site.y,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 30%, #86efac, #22c55e)",
                      boxShadow: "0 0 4px rgba(34, 197, 94, 0.3)",
                    }}
                  >
                    21
                  </div>
                ))
              )
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
};

export default NetworkMap;
