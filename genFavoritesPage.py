import re

with open("src/pages/dashboard/AllInterfacesPage.jsx", "r", encoding="utf-8") as f:
    all_interfaces_code = f.read()

# Extract columns
columns_match = re.search(r'const columns = useMemo\([\s\S]*?\[handleToggleFavorite\]\n  \);', all_interfaces_code)
columns_code = columns_match.group(0)

# Build FavoritesPage.jsx
favorites_code = f"""import React, {{ useState, useMemo, useCallback }} from "react";
import {{ useInterfaceData }} from "../useInterfaceData";
import {{ VirtualizedTable }} from "../../components/ui/VirtualizedTable";
import {{ StatusIndicator }} from "../../components/ui/StatusIndicator";
import {{ FavoriteButton }} from "../../components/ui/FavoriteButton";
import LinkDetailPopup from "../../components/shared/LinkDetailPopup";
import {{ Star }} from "lucide-react";

export default function FavoritesPage({{ theme }}) {{
  const {{ interfaces, handleToggleFavorite }} = useInterfaceData();
  const [popupItem, setPopupItem] = useState(null);
  const handleClosePopup = useCallback(() => setPopupItem(null), []);

  const favoriteInterfaces = useMemo(() => {{
    return interfaces.filter((iface) => iface.isFavorite);
  }}, [interfaces]);

  {columns_code}

  const emptyMessage = (
    <div className="text-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <Star
        size={{56}}
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
          data={{favoriteInterfaces}}
          columns={{columns}}
          isLoading={{false}}
          emptyMessage={{emptyMessage}}
          onRowClick={{(row) => setPopupItem({{ data: row.raw, type: "link", title: row.interfaceName }})}}
        />
      </div>

      <LinkDetailPopup
        linkData={{popupItem?.data || null}}
        linkType={{popupItem?.type || "link"}}
        linkTitle={{popupItem?.title || ""}}
        onClose={{handleClosePopup}}
        theme={{theme}}
      />
    </div>
  );
}}
"""

with open("src/pages/dashboard/FavoritesPage.jsx", "w", encoding="utf-8") as f:
    f.write(favorites_code)

print("Updated FavoritesPage.jsx")
