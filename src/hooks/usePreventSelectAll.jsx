import { useEffect } from "react";

/**
 * Determines whether the given element is an editable input/textarea or contentEditable.
 */
function isEditableElement(el) {
  if (!el) return false;
  const tagName = el.tagName ? el.tagName.toLowerCase() : "";
  if (tagName === "textarea") return true;
  if (tagName === "input") {
    const type = el.type ? el.type.toLowerCase() : "text";
    const nonTextTypes = [
      "button",
      "checkbox",
      "color",
      "file",
      "hidden",
      "image",
      "radio",
      "range",
      "reset",
      "submit",
    ];
    return !nonTextTypes.includes(type);
  }
  if (el.isContentEditable) return true;
  if (
    typeof el.getAttribute === "function" &&
    el.getAttribute("contenteditable") === "true"
  ) {
    return true;
  }
  return false;
}

/**
 * Hook to prevent default Ctrl+A / Cmd+A ("Select All") behavior across the entire page,
 * while preserving standard text selection within editable fields (search boxes, text inputs, textareas).
 */
export function usePreventSelectAll() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+A (Windows / Linux) or Cmd+A (macOS)
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        const target = e.target;
        const activeEl = document.activeElement;

        // If the user is inside an editable field, allow normal select-all within that field
        if (isEditableElement(target) || isEditableElement(activeEl)) {
          return;
        }

        // Otherwise prevent browser from selecting/marking all text on the page
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
