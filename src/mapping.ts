import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange"
import { OrdersMatchedEntity } from "./schema"

export function handleOrdersMatched(event: OrdersMatched): void {
  const id = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let entity = OrdersMatchedEntity.load(id);
  if (!entity) {
    return; // TODO: warn
  }
  entity = new OrdersMatchedEntity(id, event);
  entity.save();
}