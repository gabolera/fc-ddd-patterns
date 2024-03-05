import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangeAddressEvent from "../custumer-change-address.event";

export default class SendMessageOnChageAddressHandler
  implements EventHandlerInterface<CustomerChangeAddressEvent>
{
  handle(event: CustomerChangeAddressEvent): void {
    console.log(
      `Endereço do cliente: ${event.id}, ${event.name} alterado para: ${event.street}`
    );
  }
}
