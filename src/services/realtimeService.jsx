import { updateTenGigLink } from "../redux/slices/tenGigLinksSlice";
import { connectionEstablished } from "../redux/slices/realtimeSlice";

// This service simulates a persistent connection to a server.
const realtimeService = {
  intervalId: null,

  /**
   * Starts the mock real-time update service.
   * @param {function} dispatch - The Redux store's dispatch function.
   * @param {function} getState - The Redux store's getState function.
   */
  start(dispatch, getState) {
    // Prevent multiple intervals from running
    if (this.intervalId) {
      this.stop();
    }

    // Immediately dispatch that the connection is live.
    dispatch(connectionEstablished());

    this.intervalId = setInterval(() => {
      const { items: allLinks } = getState().tenGigLinks;

      if (allLinks && allLinks.length > 0) {
        // 1. Pick a random link to update
        const randomLink =
          allLinks[Math.floor(Math.random() * allLinks.length)];

        // 2. Determine a new status for it
        const statuses = ["up", "down", "issue"];
        const currentStatusIndex = statuses.indexOf(randomLink.status);
        const nextStatus = statuses[(currentStatusIndex + 1) % statuses.length]; // Cycle through statuses

        // 3. Create the payload for the update action
        const updatePayload = {
          id: randomLink.id,
          status: nextStatus,
        };

        // 4. Dispatch a standard Redux action, as if this came from a WebSocket.
        // The middleware has passed the store's dispatch function to this service.
        console.log(
          `[RealtimeService] Firing update for Link ${randomLink.id}: status -> ${nextStatus}`
        );
        dispatch(updateTenGigLink(updatePayload));
      }
    }, 3500); // Fire an update every 3.5 seconds
  },

  /**
   * Stops the real-time update service.
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[RealtimeService] Stopped.");
    }
  },
};

export default realtimeService;
