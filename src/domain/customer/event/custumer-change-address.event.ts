import EventInterface from "../../@shared/event/event.interface";

export default class CustomerChangeAddressEvent implements EventInterface {
  eventData: any;
  dataTimeOccurred: Date;
  name: string;
  id: string;
  street: string;
  constructor(event: any) {
    this.dataTimeOccurred = new Date();
    this.eventData = event;
    this.name = event.name;
    this.id = event.id;
    this.street = event.Address.street;
  }
}
