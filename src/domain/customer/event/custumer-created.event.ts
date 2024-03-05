import EventInterface from "../../@shared/event/event.interface";

export default class CustomerCreatedEvent implements EventInterface {
  eventData: any;
  dataTimeOccurred: Date;
  constructor(event: any) {
    this.dataTimeOccurred = new Date();
    this.eventData = event;
  }
}
