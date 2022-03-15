import { OrdersMatched } from '../generated/OpenseaExchange/OpenseaExchange';

import {
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
} from "@graphprotocol/graph-ts";

export class OrdersMatchedEntity extends Entity {

  constructor(id: string, event: OrdersMatched) {
    super();
    this.id = id;
    this.transactionHash = event.transaction.hash;
    this.buyHash = event.params.buyHash;
    this.sellHash = event.params.sellHash;
    this.maker = event.params.maker;
    this.taker = event.params.taker;
    this.metadata = event.params.metadata;
    this.price = event.params.price;
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OrdersMatchedEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type OrdersMatchedEntity must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("OrdersMatchedEntity", id.toString(), this);
    }
  }

  static load(id: string): OrdersMatchedEntity | null {
    return changetype<OrdersMatchedEntity | null>(store.get("OrdersMatchedEntity", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transactionHash(): Bytes {
    let value = this.get("transactionHash");
    return value!.toBytes();
  }

  set transactionHash(value: Bytes) {
    this.set("transactionHash", Value.fromBytes(value));
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

  get maker(): Bytes {
    let value = this.get("maker");
    return value!.toBytes();
  }

  set maker(value: Bytes) {
    this.set("maker", Value.fromBytes(value));
  }

  get taker(): Bytes {
    let value = this.get("taker");
    return value!.toBytes();
  }

  set taker(value: Bytes) {
    this.set("taker", Value.fromBytes(value));
  }

  get metadata(): Bytes {
    let value = this.get("metadata");
    return value!.toBytes();
  }

  set metadata(value: Bytes) {
    this.set("metadata", Value.fromBytes(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }
}
