import { OrdersMatched } from '../generated/OpenseaExchange/OpenseaExchange';
import { Transfer } from '../generated/ERC721/ERC721';

import {
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
} from "@graphprotocol/graph-ts";

export class Sale extends Entity {

  constructor(id: string, event: OrdersMatched) {
    super();
    this.id = id;
    this.blockNumber = event.block.number;
    this.price = event.params.price;
  }

  saveTokenData(event: Transfer): void {
    this.seller = event.params.from;
    this.buyer = event.params.to;
    this.tokenId = event.params.tokenId;
    this.collection = event.address;
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

  get seller(): Bytes {
    let value = this.get("seller");
    return value!.toBytes();
  }

  set seller(value: Bytes) {
    this.set("seller", Value.fromBytes(value));
  }

  get buyer(): Bytes {
    let value = this.get("buyer");
    return value!.toBytes();
  }

  set buyer(value: Bytes) {
    this.set("buyer", Value.fromBytes(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get blockNumber(): BigInt {
    let value = this.get("blockNumber");
    return value!.toBigInt();
  }

  set blockNumber(value: BigInt) {
    this.set("blockNumber", Value.fromBigInt(value));
  }

  get tokenId(): BigInt {
    let value = this.get("tokenId");
    return value!.toBigInt();
  }

  set tokenId(value: BigInt) {
    this.set("tokenId", Value.fromBigInt(value));
  }

  get collection(): Bytes {
    let value = this.get("collection");
    return value!.toBytes();
  }

  set collection(value: Bytes) {
    this.set("collection", Value.fromBytes(value));
  }
}
