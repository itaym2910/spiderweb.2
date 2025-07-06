import realtimeService from "../../services/realtimeService";
import { startConnecting, disconnect } from "../slices/realtimeSlice";

const realtimeMiddleware = (store) => (next) => (action) => {
  const { dispatch, getState } = store;

  // Let the action pass through to the reducers first
  next(action);

  // Intercept specific actions to manage the service
  switch (action.type) {
    case startConnecting.type:
      // When the app wants to connect, start the service.
      realtimeService.start(dispatch, getState);
      break;

    case disconnect.type:
      // When the app wants to disconnect, stop the service.
      realtimeService.stop();
      break;

    default:
      break;
  }
};

export default realtimeMiddleware;
