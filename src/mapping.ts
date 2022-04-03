import { AtomicMatch_Call } from './../generated/OpenseaExchange/OpenseaExchange';
import { log } from "@graphprotocol/graph-ts";
import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange";
import {
    Transfer as TransferEvent,
} from "./../generated/ERC721/ERC721";

export function handleTransfer(event: TransferEvent): void {
}

export function handleOrdersMatched(event: OrdersMatched): void {
}

export function handleAtomicMatch(call: AtomicMatch_Call): void {
    const addresses = call.inputs.addrs;
    const pToken = addresses[6];

    // 0x0000000000000000000000000000000000000000 : ETH
    // 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 : WETH

    log.info(`block number ${call.block.number}, Atomic match all with payment token of ${pToken.toHexString()}`, [])
}