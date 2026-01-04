import { EventEmitter } from "events";

class NotificationEvents extends EventEmitter {}

const notificationEvents = new NotificationEvents();

export default notificationEvents;