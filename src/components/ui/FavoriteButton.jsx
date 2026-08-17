import React from "react";
import { Button } from "./button";
import { Star } from "lucide-react";

/**
 * Reusable FavoriteButton component for toggling interface favorites.
 *
 * @param {object} props
 * @param {boolean} props.isFavorite - Whether the item is currently favorited
 * @param {function} props.onClick - Function called on click (receives id as optional argument)
 * @param {string|number} [props.id] - Optional ID passed back to onClick callback
 */
export const FavoriteButton = ({ isFavorite, onClick, id }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => (id !== undefined ? onClick(id) : onClick())}
    aria-label={isFavorite ? "Unfavorite" : "Favorite"}
  >
    <Star
      className={`h-5 w-5 transition-colors ${
        isFavorite
          ? "text-yellow-500 fill-yellow-400"
          : "text-gray-400 hover:text-yellow-500"
      }`}
    />
  </Button>
);

export default FavoriteButton;
