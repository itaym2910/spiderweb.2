import React, { useState, useMemo, useCallback } from "react";
import { useInterfaceData } from "../useInterfaceData";
import { VirtualizedTable } from "../../components/ui/VirtualizedTable";
import { StatusIndicator } from "../../components/ui/StatusIndicator";
import { FavoriteButton } from "../../components/ui/FavoriteButton";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import { Star } from "lucide-react";

export default function FavoritesPage({ theme }) {
  const { interfaces, handleToggleFavorite } = useInterfaceData();
  const [popupItem, setPopupItem] = useState(null);
  const handleClosePopup = useCallback(() => setPopupItem(null), []);

  const favoriteInterfaces = useMemo(() => {
    return interfaces.filter((iface) => iface.isFavorite);
  }, [interfaces]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "interface",
        header: "Interface",
        size: 3,
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {row.interfaceName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {row.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "device",
        header: "Device(s)",
        size: 2,
        cell: ({ row }) => (
          <span className="text-gray-600 dark:text-gray-300">
            {row.deviceName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 1.5,
        cell: ({ row }) => <StatusIndicator status={row.status} size="lg" />,
      },
      {
        accessorKey: "traffic",
        header: "Traffic (In/Out)",
        size: 1.5,
          cell: ({ row }) => {
            const inVal = row.trafficIn && String(row.trafficIn).trim() !== "" && row.trafficIn !== "N/A" ? row.trafficIn : "NA";
            const outVal = row.trafficOut && String(row.trafficOut).trim() !== "" && row.trafficOut !== "N/A" ? row.trafficOut : "NA";
            return (
              <span className="text-gray-600 dark:text-gray-300">
                {`${inVal}/${outVal}`}
              </span>
            );
          },
      },
      {
        accessorKey: "errors",
        header: "Errors (In/Out)",
        align: "center",
        size: 1.5,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <span
              className={
                row.errors.in > 0 || row.errors.out > 0
                  ? "font-bold text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300"
              }
            >
              {`${row.errors.in} / ${row.errors.out}`}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "favorite",
        header: "Favorite",
        align: "center",
        size: 1,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <FavoriteButton
              id={row.id}
              isFavorite={row.isFavorite}
              onClick={handleToggleFavorite}
            />
          </div>
        ),
      },
    ],
    [handleToggleFavorite]
  );

  const emptyMessage = (
    <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <Star
        size={56}
        className="mx-auto text-yellow-400 dark:text-yellow-500 mb-4"
      />
      <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">
        No Favorite Connections Yet
      </p>
      <p className="text-md text-gray-500 dark:text-gray-500 mt-2">
        Click the star icon on any interface in the "All Interfaces" page to
        add it here.
      </p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full h-full flex flex-col gap-6 overflow-hidden">
      <header className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Favorite Connections
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400 mt-1">
          A quick overview of your most important network links and connections.
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
        <VirtualizedTable
          data={favoriteInterfaces}
          columns={columns}
          isLoading={false}
          emptyMessage={emptyMessage}
          onRowClick={(row) => setPopupItem({ data: row.raw, type: "link", title: row.interfaceName })}
        />
      </div>

      <LinkDetailPopup
        linkData={popupItem?.data || null}
        linkType={popupItem?.type || "link"}
        linkTitle={popupItem?.title || ""}
        onClose={handleClosePopup}
        theme={theme}
      />
    </div>
  );
}
