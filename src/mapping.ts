import { Address, BigInt, log, ethereum } from "@graphprotocol/graph-ts";
import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange";
import {
    ERC721,
    Transfer as TransferEvent,
} from "./../generated/ERC721/ERC721";
import { Collection, Sale, Token, Transfer } from "./schema";

const ONE = BigInt.fromString("1");
const nullAddress = "0x0000000000000000000000000000000000000000";

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

export function handleOrdersMatched(event: OrdersMatched): void {
    const id = `${event.transaction.hash.toHexString()}:${event.logIndex}`;
    const transferId = `${event.transaction.hash.toHexString()}:${BigInt.fromString(
        event.logIndex.toString()
    ).minus(ONE)}`;

    const transfer: Transfer | null = Transfer.load(transferId);
    if (transfer == null) {
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

    const collectionId = transfer.address.toHexString();
    const tokenId = `${collectionId}:${transfer.value}`;
    createToken(
        tokenId,
        collectionId,
        transfer.value,
        ERC721.bind(Address.fromBytes(transfer.address))
    );
    new Sale(id, transferId, tokenId, event).save();
    log.info(`Sale ${id} stored`, []);
}

export function createToken(
    id: string,
    collectionId: string,
    tokenId: BigInt,
    contract: ERC721
): void {
    const token: Token | null = Token.load(id);
    if (token != null) return;

    if (Collection.load(collectionId) == null) {
        let symbol: ethereum.CallResult<string> = contract.try_symbol();
        let name: ethereum.CallResult<string> = contract.try_name();

        if (symbol.reverted) {
            log.error(
                `failed to load collection symbol for ${collectionId}`,
                []
            );
        }

        if (name.reverted) {
            log.error(`failed to load collection name for ${collectionId}`, []);
        }

        new Collection(
            collectionId,
            symbol.reverted ? null : symbol.value,
            name.reverted ? null : name.value
        ).save();
    }

    let tokenUri: ethereum.CallResult<string> = contract.try_tokenURI(tokenId);
    if (tokenUri.reverted) {
        log.error(`failed to load token uri for ${id}`, []);
    }

    new Token(
        id,
        collectionId,
        tokenUri.reverted ? null : tokenUri.value,
        tokenId
    ).save();
}
