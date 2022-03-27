import {
    Entity,
    Value,
    ValueKind,
    store,
    Bytes,
    BigInt,
} from "@graphprotocol/graph-ts";

import { OrdersMatched } from "../generated/OpenseaExchange/OpenseaExchange";
import { Transfer as TransferEvent } from "../generated/ERC721/ERC721";

export class Sale extends Entity {
    constructor(
        id: string,
        transfer: string,
        token: string,
        event: OrdersMatched
    ) {
        super();
        this.id = id;
        this.blockNumber = event.block.number;
        this.timestamp = event.block.timestamp;
        this.transfer = transfer;
        this.token = token;
        this.exchange = event.address;
        this.buyHash = event.params.buyHash;
        this.sellHash = event.params.sellHash;
        this.metadata = event.params.metadata;
        this.price = event.params.price;
    }

    save(): void {
        let id = this.get("id");
        assert(id != null, "Cannot save Sale entity without an ID");
        if (id) {
            assert(
                id.kind == ValueKind.STRING,
                `Entities of type Sale must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
            );
            store.set("Sale", id.toString(), this);
        }
    }

    static load(id: string): Sale | null {
        return changetype<Sale | null>(store.get("Sale", id));
    }

    get id(): string {
        let value = this.get("id");
        return value!.toString();
    }

    set id(value: string) {
        this.set("id", Value.fromString(value));
    }

    get blockNumber(): BigInt {
        let value = this.get("blockNumber");
        return value!.toBigInt();
    }

    set blockNumber(value: BigInt) {
        this.set("blockNumber", Value.fromBigInt(value));
    }

    get timestamp(): BigInt {
        let value = this.get("timestamp");
        return value!.toBigInt();
    }

    set timestamp(value: BigInt) {
        this.set("timestamp", Value.fromBigInt(value));
    }

    get transfer(): string {
        let value = this.get("transfer");
        return value!.toString();
    }

    set transfer(value: string) {
        this.set("transfer", Value.fromString(value));
    }

    get token(): string {
        let value = this.get("token");
        return value!.toString();
    }

    set token(value: string) {
        this.set("token", Value.fromString(value));
    }

    get exchange(): Bytes {
        let value = this.get("exchange");
        return value!.toBytes();
    }

    set exchange(value: Bytes) {
        this.set("exchange", Value.fromBytes(value));
    }

    get buyHash(): Bytes {
        let value = this.get("buyHash");
        return value!.toBytes();
    }

    set buyHash(value: Bytes) {
        this.set("buyHash", Value.fromBytes(value));
    }

    get sellHash(): Bytes {
        let value = this.get("sellHash");
        return value!.toBytes();
    }

    set sellHash(value: Bytes) {
        this.set("sellHash", Value.fromBytes(value));
    }

    get price(): BigInt {
        let value = this.get("price");
        return value!.toBigInt();
    }

    set price(value: BigInt) {
        this.set("price", Value.fromBigInt(value));
    }

    get metadata(): Bytes {
        let value = this.get("metadata");
        return value!.toBytes();
    }

    set metadata(value: Bytes) {
        this.set("metadata", Value.fromBytes(value));
    }
}

export class Transfer extends Entity {
    constructor(id: string, event: TransferEvent) {
        super();
        this.id = id;
        this.blockNumber = event.block.number;
        this.timestamp = event.block.timestamp;
        this.from = event.params.from;
        this.to = event.params.to;
        this.value = event.params.tokenId;
        this.address = event.address;
    }

    save(): void {
        let id = this.get("id");
        assert(id != null, "Cannot save Transfer entity without an ID");
        if (id) {
            assert(
                id.kind == ValueKind.STRING,
                `Entities of type Transfer must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
            );
            store.set("Transfer", id.toString(), this);
        }
    }

    static load(id: string): Transfer | null {
        return changetype<Transfer | null>(store.get("Transfer", id));
    }

    get id(): string {
        let value = this.get("id");
        return value!.toString();
    }

    set id(value: string) {
        this.set("id", Value.fromString(value));
    }

    get blockNumber(): BigInt {
        let value = this.get("blockNumber");
        return value!.toBigInt();
    }

    set blockNumber(value: BigInt) {
        this.set("blockNumber", Value.fromBigInt(value));
    }

    get timestamp(): BigInt {
        let value = this.get("timestamp");
        return value!.toBigInt();
    }

    set timestamp(value: BigInt) {
        this.set("timestamp", Value.fromBigInt(value));
    }

    get exchange(): Bytes {
        let value = this.get("exchange");
        return value!.toBytes();
    }

    get address(): Bytes {
        let value = this.get("address");
        return value!.toBytes();
    }

    set address(value: Bytes) {
        this.set("address", Value.fromBytes(value));
    }

    get from(): Bytes {
        let value = this.get("from");
        return value!.toBytes();
    }

    set from(value: Bytes) {
        this.set("from", Value.fromBytes(value));
    }

    get to(): Bytes {
        let value = this.get("to");
        return value!.toBytes();
    }

    set to(value: Bytes) {
        this.set("to", Value.fromBytes(value));
    }

    get value(): BigInt {
        let value = this.get("value");
        return value!.toBigInt();
    }

    set value(value: BigInt) {
        this.set("value", Value.fromBigInt(value));
    }
}

export class Token extends Entity {
    constructor(
        id: string,
        collection: string,
        uri: string | null,
        tokenId: BigInt
    ) {
        super();
        this.id = id;
        this.collection = collection;
        this.tokenId = tokenId;
        if (uri != null) this.uri = uri!;
    }

    save(): void {
        let id = this.get("id");
        assert(id != null, "Cannot save Token entity without an ID");
        if (id) {
            assert(
                id.kind == ValueKind.STRING,
                `Entities of type Token must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
            );
            store.set("Token", id.toString(), this);
        }
    }

    static load(id: string): Token | null {
        return changetype<Token | null>(store.get("Token", id));
    }

    get id(): string {
        let value = this.get("id");
        return value!.toString();
    }

    set id(value: string) {
        this.set("id", Value.fromString(value));
    }

    get collection(): string {
        let value = this.get("collection");
        return value!.toString();
    }

    set collection(value: string) {
        this.set("collection", Value.fromString(value));
    }

    get uri(): string {
        let value = this.get("uri");
        return value!.toString();
    }

    set uri(value: string) {
        this.set("uri", Value.fromString(value));
    }

    get tokenId(): BigInt {
        let value = this.get("tokenId");
        return value!.toBigInt();
    }

    set tokenId(value: BigInt) {
        this.set("tokenId", Value.fromBigInt(value));
    }
}

export class Collection extends Entity {
    constructor(id: string, symbol: string | null, name: string | null) {
        super();
        this.id = id;
        if (symbol != null) this.symbol = symbol!;
        if (name != null) this.name = name!;
    }

    save(): void {
        let id = this.get("id");
        assert(id != null, "Cannot save Collection entity without an ID");
        if (id) {
            assert(
                id.kind == ValueKind.STRING,
                `Entities of type Collection must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
            );
            store.set("Collection", id.toString(), this);
        }
    }

    static load(id: string): Collection | null {
        return changetype<Collection | null>(store.get("Collection", id));
    }

    get id(): string {
        let value = this.get("id");
        return value!.toString();
    }

    set id(value: string) {
        this.set("id", Value.fromString(value));
    }

    get symbol(): string {
        let value = this.get("symbol");
        return value!.toString();
    }

    set symbol(value: string) {
        this.set("symbol", Value.fromString(value));
    }

    get name(): string {
        let value = this.get("name");
        return value!.toString();
    }

    set name(value: string) {
        this.set("name", Value.fromString(value));
    }
}
