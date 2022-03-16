import {
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  log
} from "@graphprotocol/graph-ts";

import { OrdersMatched } from '../generated/OpenseaExchange/OpenseaExchange';
import { Transfer } from '../generated/ERC721/ERC721';

export class Sale extends Entity {

  constructor(id: string, blockNumber: BigInt, timestamp: BigInt) {
    super();
    this.id = id;
    this.blockNumber = blockNumber;
    this.timestamp = timestamp;
  }

  saveTransferData(event: Transfer): void {
    this.seller = event.params.from;
    this.buyer = event.params.to;

    if (this.get("tokenId") != null || this.get("collection") != null)
      log.warning(`Sale ${this.id} token info to be overwritten`, [])
    this.tokenId = event.params.tokenId;
    this.collection = event.address;
  }

  saveOrdersMatchedData(event: OrdersMatched): void {
    this.buyHash = event.params.buyHash;
    this.sellHash = event.params.sellHash;
    this.metadata = event.params.metadata;

    if (this.get("price") != null)
      log.warning(`Sale ${this.id} price to be overwritten`, [])
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
  
  get collection(): Bytes {
    let value = this.get("collection");
    return value!.toBytes();
  }

  set collection(value: Bytes) {
    this.set("collection", Value.fromBytes(value));
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

  get tokenId(): BigInt {
    let value = this.get("tokenId");
    return value!.toBigInt();
  }

  set tokenId(value: BigInt) {
    this.set("tokenId", Value.fromBigInt(value));
  }

}
