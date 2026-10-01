import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { X, Compass } from "lucide-react";

export default function MapMinimap({
  theme = "dark",
  isOpen = true,
  onClose,
  nodes = [],
  links = [],
  nodeGroups = [],
  transform = { x: 0, y: 0, k: 1 },
  viewportWidth = 800,
  viewportHeight = 600,
  graphBounds = null,
  onPanTo,
  onFocusZone,
}) {
  const isDark = theme === "dark";
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({
    mouseX: 0,
    mouseY: 0,
    initialVx: 0,
    initialVy: 0,
    k: 1,
    boxW: 12,
    boxH: 8,
  });
  const dragCleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      dragCleanupRef.current?.();
    };
  }, []);

  const MINIMAP_WIDTH = 210;
  const MINIMAP_HEIGHT = 135;
  const PADDING = 10;

  // Calculate bounding box of the graph
  const bounds = useMemo(() => {
    if (graphBounds && graphBounds.width > 0 && graphBounds.height > 0) {
      return graphBounds;
    }

    if (!nodes || nodes.length === 0) {
      return { minX: 0, maxX: 1000, minY: 0, maxY: 700, width: 1000, height: 700 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      if (typeof n.x === "number") {
        minX = Math.min(minX, n.x);
        maxX = Math.max(maxX, n.x);
      }
      if (typeof n.y === "number") {
        minY = Math.min(minY, n.y);
        maxY = Math.max(maxY, n.y);
      }
    });

    (nodeGroups || []).forEach((z) => {
      if (typeof z.cx === "number") {
        minX = Math.min(minX, z.cx - 160);
        maxX = Math.max(maxX, z.cx + 160);
      }
      if (typeof z.cy === "number") {
        minY = Math.min(minY, z.cy - 160);
        maxY = Math.max(maxY, z.cy + 160);
      }
    });

    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = 1000;
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = 700;

    const width = maxX - minX || 1000;
    const height = maxY - minY || 700;

    return { minX, maxX, minY, maxY, width, height };
  }, [nodes, nodeGroups, graphBounds]);

  // Transform graph coordinates -> minimap coordinates
  const { scale, offsetX, offsetY } = useMemo(() => {
    const availW = MINIMAP_WIDTH - PADDING * 2;
    const availH = MINIMAP_HEIGHT - PADDING * 2;

    const s = Math.min(availW / bounds.width, availH / bounds.height);
    const ox = PADDING + (availW - bounds.width * s) / 2;
    const oy = PADDING + (availH - bounds.height * s) / 2;

    return { scale: s, offsetX: ox, offsetY: oy };
  }, [bounds]);

  const toMinimapX = useCallback(
    (gx) => offsetX + (gx - bounds.minX) * scale,
    [offsetX, bounds.minX, scale]
  );
  const toMinimapY = useCallback(
    (gy) => offsetY + (gy - bounds.minY) * scale,
    [offsetY, bounds.minY, scale]
  );

  const toGraphX = useCallback(
    (mx) => bounds.minX + (mx - offsetX) / scale,
    [bounds.minX, offsetX, scale]
  );
  const toGraphY = useCallback(
    (my) => bounds.minY + (my - offsetY) / scale,
    [bounds.minY, offsetY, scale]
  );

  // Viewfinder bounding box in minimap coordinates with bounds clamping
  const viewfinder = useMemo(() => {
    const k = transform.k || 1;
    const visibleGraphLeft = -transform.x / k;
    const visibleGraphTop = -transform.y / k;
    const visibleGraphWidth = viewportWidth / k;
    const visibleGraphHeight = viewportHeight / k;

    const rawVx = toMinimapX(visibleGraphLeft);
    const rawVy = toMinimapY(visibleGraphTop);
    const vw = visibleGraphWidth * scale;
    const vh = visibleGraphHeight * scale;
    const boxW = Math.max(12, vw);
    const boxH = Math.max(8, vh);

    const minVx = Math.min(0, MINIMAP_WIDTH - boxW);
    const maxVx = Math.max(0, MINIMAP_WIDTH - boxW);
    const vx = Math.max(minVx, Math.min(maxVx, rawVx));

    const minVy = Math.min(0, MINIMAP_HEIGHT - boxH);
    const maxVy = Math.max(0, MINIMAP_HEIGHT - boxH);
    const vy = Math.max(minVy, Math.min(maxVy, rawVy));

    return { x: vx, y: vy, width: boxW, height: boxH };
  }, [transform, viewportWidth, viewportHeight, scale, toMinimapX, toMinimapY]);

  // Click on minimap to jump (bounded to avoid going out of bounds)
  const handleMinimapClick = (e) => {
    if (isDraggingRef.current) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickMx = e.clientX - rect.left;
    const clickMy = e.clientY - rect.top;

    const k = transform.k || 1;
    const visibleGraphWidth = viewportWidth / k;
    const visibleGraphHeight = viewportHeight / k;
    const vw = visibleGraphWidth * scale;
    const vh = visibleGraphHeight * scale;
    const boxW = Math.max(12, vw);
    const boxH = Math.max(8, vh);

    const targetVx = clickMx - boxW / 2;
    const targetVy = clickMy - boxH / 2;

    const minVx = Math.min(0, MINIMAP_WIDTH - boxW);
    const maxVx = Math.max(0, MINIMAP_WIDTH - boxW);
    const clampedVx = Math.max(minVx, Math.min(maxVx, targetVx));

    const minVy = Math.min(0, MINIMAP_HEIGHT - boxH);
    const maxVy = Math.max(0, MINIMAP_HEIGHT - boxH);
    const clampedVy = Math.max(minVy, Math.min(maxVy, targetVy));

    const targetGx = toGraphX(clampedVx);
    const targetGy = toGraphY(clampedVy);

    const newTx = -targetGx * k;
    const newTy = -targetGy * k;

    onPanTo?.(newTx, newTy, true);
  };

  // Drag the viewfinder box (bounded so user cannot drag out of bounds)
  const handleViewfinderMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;

    const k = transform.k || 1;
    const visibleGraphLeft = -transform.x / k;
    const visibleGraphTop = -transform.y / k;
    const visibleGraphWidth = viewportWidth / k;
    const visibleGraphHeight = viewportHeight / k;

    const vw = visibleGraphWidth * scale;
    const vh = visibleGraphHeight * scale;
    const boxW = Math.max(12, vw);
    const boxH = Math.max(8, vh);

    const initialVx = toMinimapX(visibleGraphLeft);
    const initialVy = toMinimapY(visibleGraphTop);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialVx,
      initialVy,
      k,
      boxW,
      boxH,
    };

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const { mouseX, mouseY, initialVx, initialVy, k: curK, boxW: curW, boxH: curH } =
        dragStartRef.current;
      const dxMinimap = moveEvent.clientX - mouseX;
      const dyMinimap = moveEvent.clientY - mouseY;

      const targetVx = initialVx + dxMinimap;
      const targetVy = initialVy + dyMinimap;

      const minVx = Math.min(0, MINIMAP_WIDTH - curW);
      const maxVx = Math.max(0, MINIMAP_WIDTH - curW);
      const clampedVx = Math.max(minVx, Math.min(maxVx, targetVx));

      const minVy = Math.min(0, MINIMAP_HEIGHT - curH);
      const maxVy = Math.max(0, MINIMAP_HEIGHT - curH);
      const clampedVy = Math.max(minVy, Math.min(maxVy, targetVy));

      const newGraphLeft = toGraphX(clampedVx);
      const newGraphTop = toGraphY(clampedVy);

      const newTx = -newGraphLeft * curK;
      const newTy = -newGraphTop * curK;

      onPanTo?.(newTx, newTy, false);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      dragCleanupRef.current = null;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    dragCleanupRef.current = handleMouseUp;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`rounded-xl shadow-2xl border backdrop-blur-md overflow-hidden transition-all duration-200 pointer-events-auto select-none ${
        isDark
          ? "bg-gray-900/95 border-gray-700/80 shadow-black/40 text-gray-200"
          : "bg-white/95 border-gray-200 shadow-gray-300/50 text-gray-800"
      }`}
      style={{ width: MINIMAP_WIDTH }}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 border-b text-xs font-semibold ${
          isDark
            ? "border-gray-800 bg-gray-800/40 text-gray-400"
            : "border-gray-100 bg-gray-50/70 text-gray-500"
        }`}
      >
        <div className="flex items-center gap-1.5 text-sky-500">
          <Compass className="w-3.5 h-3.5" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Navigator
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Close Minimap"
          aria-label="Close Minimap"
          className="hover:opacity-75 p-0.5 rounded transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="relative">
        <svg
          ref={svgRef}
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          onClick={handleMinimapClick}
          className="cursor-crosshair block"
          style={{
            backgroundColor: isDark ? "#0f172a" : "#f8fafc",
          }}
        >
          {/* Zone circles in miniature */}
          {nodeGroups.map((zone) => {
            const zx = toMinimapX(zone.cx);
            const zy = toMinimapY(zone.cy);
            const zr = 150 * scale;
            return (
              <g key={zone.id}>
                <circle
                  cx={zx}
                  cy={zy}
                  r={zr}
                  fill={isDark ? "#38bdf8" : "#bae6fd"}
                  fillOpacity={isDark ? 0.2 : 0.4}
                  stroke={isDark ? "#0284c7" : "#38bdf8"}
                  strokeWidth={0.8}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDraggingRef.current) return;
                    onFocusZone?.(zone);
                  }}
                />
              </g>
            );
          })}

          {/* Links in miniature */}
          {links.map((link) => {
            const s = link.source;
            const t = link.target;
            if (!s || !t || typeof s.x !== "number" || typeof t.x !== "number")
              return null;
            const x1 = toMinimapX(s.x);
            const y1 = toMinimapY(s.y);
            const x2 = toMinimapX(t.x);
            const y2 = toMinimapY(t.y);
            return (
              <line
                key={link.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isDark ? "#475569" : "#cbd5e1"}
                strokeWidth={0.7}
                strokeOpacity={0.6}
              />
            );
          })}

          {/* Nodes in miniature */}
          {nodes.map((node) => {
            if (typeof node.x !== "number" || typeof node.y !== "number")
              return null;
            const nx = toMinimapX(node.x);
            const ny = toMinimapY(node.y);
            return (
              <circle
                key={node.id}
                cx={nx}
                cy={ny}
                r={Math.max(2.5, 60 * scale)}
                fill={isDark ? "#38bdf8" : "#0284c7"}
                opacity={0.85}
              />
            );
          })}

          {/* Active Viewfinder Box */}
          <rect
            x={viewfinder.x}
            y={viewfinder.y}
            width={viewfinder.width}
            height={viewfinder.height}
            fill="rgba(56, 189, 248, 0.18)"
            stroke={isDark ? "#38bdf8" : "#0284c7"}
            strokeWidth={1.4}
            rx={3}
            ry={3}
            className="cursor-grab active:cursor-grabbing hover:stroke-sky-400 transition-colors"
            onMouseDown={handleViewfinderMouseDown}
          />
        </svg>

        <div
          className={`px-2 py-0.5 text-[9px] text-center border-t font-mono ${
            isDark
              ? "bg-gray-900/80 border-gray-800 text-gray-500"
              : "bg-gray-50 border-gray-100 text-gray-400"
          }`}
        >
          Click or drag frame to navigate
        </div>
      </div>
    </div>
  );
}
