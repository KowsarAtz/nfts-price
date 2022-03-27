import { BigInt, log } from "@graphprotocol/graph-ts";
import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange";
import { Transfer as TransferEvent } from "./../generated/ERC721/ERC721";
import { Sale, Transfer } from "./schema";

const ONE = BigInt.fromString("1");
const nullAddress = "0x0000000000000000000000000000000000000000";

export function handleOrdersMatched(event: OrdersMatched): void {
    const id = `${event.transaction.hash.toHexString()}:${event.logIndex}`;
    const transferId = `${event.transaction.hash.toHexString()}:${BigInt.fromString(
        event.logIndex.toString()
    ).minus(ONE)}`;

    if (Transfer.load(transferId) == null) {
        log.debug(
            `Transfer ${transferId} not found. OrdersMatched event ignored`,
            []
        );
        return;
    }

    if (Sale.load(id) != null) {
        log.warning(`Sale ${id} already exists`, []);
        return;
    }

    new Sale(id, transferId, event).save();
    log.info(`Sale ${id} stored`, []);
}

export function handleTransfer(event: TransferEvent): void {
    const id = `${event.transaction.hash.toHexString()}:${event.logIndex}`;

    if (Transfer.load(id) != null) {
        log.warning(`Transfer ${id} already exists`, []);
        return;
    }

    if (event.params.from.toHexString().toLowerCase() == nullAddress) {
        log.debug(
            `Transfer ${id} ignored since it corresponds to a mint event`,
            []
        );
        return;
    }

    if (event.params.to.toHexString().toLowerCase() == nullAddress) {
        log.debug(
            `Transfer ${id} ignored since it corresponds to a burn event`,
            []
        );
        return;
    }
    new Transfer(id, event).save();
    log.info(`Transfer ${id} stored`, []);
}
