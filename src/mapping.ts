import { BigInt, log } from "@graphprotocol/graph-ts";
import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange"
import { Transfer } from './../generated/ERC721/ERC721';
import { Sale } from "./schema"

const ONE = BigInt.fromString("1");
const nullAddress = "0x0000000000000000000000000000000000000000";

export function handleOrdersMatched(event: OrdersMatched): void {
  const id = `${event.transaction.hash.toHexString()}:${BigInt.fromString(event.logIndex.toString()).minus(ONE)}`;
  let entity: Sale | null = Sale.load(id);
  if (entity == null) {
    entity = new Sale(id, event.block.number, event.block.timestamp);
    log.info(`Sale ${id} to be instantiated by OrdersMatched event data`, []);
  }
  else {
    log.info(`Sale ${id} to be completed by OrdersMatched event data`, []);
  }
  entity.saveOrdersMatchedData(event);
  entity.save();
}

export function handleTransfer(event: Transfer): void {
  const id = `${event.transaction.hash.toHexString()}:${event.logIndex}`;
  let entity: Sale | null = Sale.load(id);
  if (entity == null) {

    if(event.params.from.toHexString().toLowerCase() == nullAddress) {
      log.debug(`Transfer ${id} ignored since it corresponds to a mint event`, []);
      return;
    }

    if(event.params.to.toHexString().toLowerCase() == nullAddress) {
      log.debug(`Transfer ${id} ignored since it corresponds to a burn event`, []);
      return;
    }

    entity = new Sale(id, event.block.number, event.block.timestamp);
    log.info(`Sale ${id} to be instantiated by Transfer event data`, []);
  }
  else {
    log.info(`Sale ${id} to be completed by Transfer event data`, []);
  }
  entity.saveTransferData(event);
  entity.save();
}