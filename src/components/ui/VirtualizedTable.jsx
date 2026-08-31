import React, { useRef, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { TableSkeleton } from "./feedback/TableSkeleton";

/**
 * A reusable, high-performance virtualized table component.
 *
 * @param {object[]} data - The array of data to render.
 * @param {object[]} columns - Column definitions with header, accessorKey, cell, size.
 * @param {boolean} isLoading - If true, shows a skeleton loader.
 * @param {React.ReactNode} emptyMessage - JSX to display when data is empty.
 * @param {Function} onScrollEnd - Optional. Called when user scrolls near the bottom.
 * @param {boolean} isFetchingMore - Optional. True if currently loading next page.
 * @param {boolean} hasMore - Optional. True if more data can be loaded.
 * @param {Function} renderExpandedRow - Optional. Renders the expanded content for a row.
 */
export function VirtualizedTable({
  data,
  columns,
  isLoading,
  emptyMessage,
  onScrollEnd,
  isFetchingMore,
  hasMore,
  renderExpandedRow,
}) {
  const parentRef = useRef(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  const handleScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el || !onScrollEnd) return;
    // Fire when within 300px of the bottom
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      onScrollEnd();
    }
  }, [onScrollEnd]);

  const toggleRow = useCallback((row) => {
    if (!renderExpandedRow) return;
    setExpandedRowId((prev) => (prev === row.id ? null : row.id));
  }, [renderExpandedRow]);

  if (isLoading && data.length === 0) {
    return <TableSkeleton rows={10} cols={columns.length} />;
  }

  if (!data.length) {
    return <div className="p-4">{emptyMessage}</div>;
  }

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      role="grid"
      className="h-full w-full overflow-auto border dark:border-gray-700/50 rounded-lg"
    >
      {/* Header */}
      <div
        role="rowheader"
        className="flex sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700/50"
      >
        {columns.map((column) => (
          <div
            key={column.accessorKey}
            role="columnheader"
            className={`px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 ${
              column.align === "center"
                ? "text-center"
                : column.align === "right"
                ? "text-right"
                : "text-left"
            }`}
            style={{ flex: `${column.size} 0 0%` }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {virtualItems.map((virtualRow) => {
          const row = data[virtualRow.index];
          const isExpanded = expandedRowId === row.id;

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              role="row"
              className="absolute top-0 left-0 w-full border-b dark:border-gray-800/50 transition-colors"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div 
                className={`flex items-center w-full min-h-[64px] hover:bg-gray-50 dark:hover:bg-gray-800/20 ${renderExpandedRow ? "cursor-pointer" : ""} ${isExpanded ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                onClick={() => toggleRow(row)}
              >
                {columns.map((column) => (
                  <div
                    key={column.accessorKey}
                    role="gridcell"
                    className="px-4 py-2 truncate"
                    style={{ flex: `${column.size} 0 0%` }}
                    onClick={(e) => {
                      // Prevent expanding if clicking on an interactive element inside cell (e.g. favorite button)
                      if (e.target.closest('button')) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {column.cell({ row })}
                  </div>
                ))}
              </div>
              
              {isExpanded && renderExpandedRow && (
                <div className="border-t border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40 p-4">
                  {renderExpandedRow({ row })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading indicator at bottom */}
      {isFetchingMore && (
        <div className="flex justify-center items-center gap-3 p-4 text-blue-500 font-medium">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          Loading more...
        </div>
      )}
      
      {/* Manual load more button when auto-scroll doesn't trigger */}
      {hasMore && !isFetchingMore && onScrollEnd && (
        <div className="flex justify-center p-4">
          <button
            onClick={onScrollEnd}
            className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-400 font-medium rounded-lg transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

