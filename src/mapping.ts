import { Transfer } from './../generated/ERC721/ERC721';
import { log } from "@graphprotocol/graph-ts";
import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange"
import { Sale } from "./schema"

export function handleOrdersMatched(event: OrdersMatched): void {
  const id = event.transaction.hash.toHexString();
  let entity: Sale | null = Sale.load(id);
  if (entity != null) {
    log.warning("Sale entity already exists: " + id, []);
    return;
  }
  entity = new Sale(id, event);
  entity.save();
}

export function handleTransfer(event: Transfer): void {
  const id = event.transaction.hash.toHexString();
  const entity: Sale | null = Sale.load(id);
  if (entity == null) {
    log.warning("Transfer event ignored since no OrdersMatched event handled for this event: " + id, []);
    return;
  }
  entity.saveTokenData(event);
  entity.save();
  log.info("Sale entity saved: " + id, []);
}