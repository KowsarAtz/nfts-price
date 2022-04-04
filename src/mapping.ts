import { UniswapRouter } from "../generated/UniswapRouter";
import { ERC20 } from "./../generated/ERC20";
import { Address, BigInt, log, ethereum } from "@graphprotocol/graph-ts";
import {
    AtomicMatch_Call as AtomicMatchCall,
    OrdersMatched as OrdersMatchedEvent,
} from "../generated/OpenseaExchange";
import { Transfer as TransferEvent } from "../generated/ERC721";
import { Transfer as ERC20TransferEvent } from "../generated/ERC20";
import {
    Sale,
    Transfer,
    ERC20Transfer,
    Transaction,
    PaymentToken,
} from "./schema";

const ONE = BigInt.fromString("1");
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const uniswapRouterContract = UniswapRouter.bind(
    Address.fromString("0x7a250d5630b4cf539739df2c5dacb4c659f2488d")
);
const USDT_ADDRESS = Address.fromString(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7"
);
const WETH_ADDRESS = Address.fromString(
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
);

export function handleERC20Transfer(event: ERC20TransferEvent): void {
    const txHash = event.transaction.hash.toHexString();
    log.debug(`handleERC20Transfer with txHash ${txHash}`, []);
    const logIndex = event.logIndex;

    const id = `${txHash}:${logIndex}`;

    if (ERC20Transfer.load(id) != null) {
        log.warning(`ERC20Transfer ${id} already exists`, []);
        return;
    }

    let transaction: Transaction | null = Transaction.load(txHash);
    if (transaction == null) {
        transaction = new Transaction(txHash);
    }
    const txERC20TransferLogs = cloneArray(transaction.unusedERC20TransferLogs);

    const transfer = new ERC20Transfer(id);
    transfer.logIndex = logIndex;
    transfer.address = event.address;
    transfer.from = event.params.src;
    transfer.to = event.params.dst;
    transfer.value = event.params.wad;

    transfer.save();
    log.info(`ERC20Transfer ${id} stored`, []);

    txERC20TransferLogs.push(id);

    transaction.unusedERC20TransferLogs = txERC20TransferLogs;
    transaction.save();
}

export function handleTransfer(event: TransferEvent): void {
    const txHash = event.transaction.hash.toHexString();
    log.debug(`handleTransfer with txHash ${txHash}`, []);
    const logIndex = event.logIndex;

    const id = `${txHash}:${logIndex}`;

    if (Transfer.load(id) != null) {
        log.warning(`Transfer ${id} already exists`, []);
        return;
    }

    if (event.params.from.toHexString().toLowerCase() == NULL_ADDRESS) {
        log.debug(
            `Transfer ${id} ignored since it corresponds to a mint event`,
            []
        );
        return;
    }

    if (event.params.to.toHexString().toLowerCase() == NULL_ADDRESS) {
        log.debug(
            `Transfer ${id} ignored since it corresponds to a burn event`,
            []
        );
        return;
    }

    let transaction: Transaction | null = Transaction.load(txHash);
    if (transaction == null) {
        transaction = new Transaction(txHash);
    }
    const txTransferLogs = cloneArray(transaction.unusedTransferLogs);

    const transfer = new Transfer(id);
    transfer.logIndex = logIndex;
    transfer.address = event.address;
    transfer.from = event.params.from;
    transfer.to = event.params.to;
    transfer.value = event.params.tokenId;

    transfer.save();
    log.info(`Transfer ${id} stored`, []);

    txTransferLogs.push(id);

    transaction.unusedTransferLogs = txTransferLogs;
    transaction.save();
}

export function handleOrdersMatched(event: OrdersMatchedEvent): void {
    const txHash = event.transaction.hash.toHexString();
    log.debug(`handleOrdersMatched with txHash ${txHash}`, []);
    const logIndex = event.logIndex;

    const transferId = `${txHash}:${BigInt.fromString(
        logIndex.toString()
    ).minus(ONE)}`;
    const id = `${txHash}:${logIndex}`;
    if (Transfer.load(transferId) == null) {
        log.warning(
            `OrdersMatched ${id} ignored since no matching Transfer log found`,
            []
        );
        return;
    }

    if (Sale.load(id) != null) {
        log.warning(`Sale ${id} already exists`, []);
        return;
    }

    const transaction: Transaction | null = Transaction.load(txHash);
    if (transaction == null) {
        log.warning(
            `Could not find transaction ${txHash} in handleOrdersMatched`,
            []
        );
        return;
    }

    const transferLogs = cloneArray(transaction.unusedTransferLogs);
    const erc20TransferLogs = cloneArray(transaction.unusedERC20TransferLogs);

    if (transferLogs.length == 0) {
        log.warning(
            `Not enough Transfer logs to process in handleOrdersMatched`,
            []
        );
        return;
    }

    // if (erc20TransferLogs.length == 0) {
    //     log.warning(
    //         `Not enough ERC20Transfer logs to process in handleOrdersMatched`,
    //         []
    //     );
    //     return;
    // }

    const erc20TransferLog = erc20TransferLogs.length != 0 ? ERC20Transfer.load(erc20TransferLogs.splice(0, 1)[0]) : null;
    // if (erc20TransferLog == null) {
    //     log.warning(
    //         `Could not retrieve ERC20Transfer ${erc20TransferLogId} to process in handleOrdersMatched`,
    //         []
    //     );
    // }

    const transferLogId = transferLogs.splice(0, 1)[0];
    const transferLog = Transfer.load(transferLogId);
    if (transferLog == null) {
        log.warning(
            `Could not retrieve Transfer ${transferLogId} to process in handleOrdersMatched`,
            []
        );
        return;
    }

    if (
        !BigInt.fromString(logIndex.toString())
            .minus(ONE)
            .equals(transferLog.logIndex)
    ) {
        log.warning(
            `Could not find matching Transfer log to process in handleOrdersMatched`,
            []
        );
        return;
    }

    const paymentTokenId = erc20TransferLog != null ? erc20TransferLog.address.toHexString() : NULL_ADDRESS;
    if (PaymentToken.load(paymentTokenId) == null) {
        if (!createPaymentToken(paymentTokenId)) {
            log.warning(`Could not create PaymentToken ${paymentTokenId}`, []);
            return;
        }
    }

    const sale = new Sale(id);

    sale.blockNumber = event.block.number;
    sale.timestamp = event.block.timestamp;
    sale.paymentToken = paymentTokenId;
    sale.transaction = transaction.id;

    if (!setUSDTPrice(sale, paymentTokenId, event.params.price)) {
        log.warning(`Could not calculate usdt price for sale ${sale.id}`, []);
    }

    sale.collection = transferLog.address;
    sale.seller = transferLog.from;
    sale.buyer = transferLog.to;
    sale.tokenId = transferLog.value;

    sale.exchange = event.address;
    sale.buyHash = event.params.buyHash;
    sale.sellHash = event.params.sellHash;
    sale.maker = event.params.maker;
    sale.taker = event.params.taker;
    sale.price = event.params.price;
    sale.metadata = event.params.metadata;

    sale.save();
    log.info(`Sale ${sale.id} stored`, []);

    transferLog.remove();
    if (erc20TransferLog != null)
        erc20TransferLog.remove(); 
    transaction.unusedTransferLogs = transferLogs;
    transaction.unusedERC20TransferLogs = erc20TransferLogs;
    transaction.save();
}

function createPaymentToken(id: string): bool {
    const token = new PaymentToken(id);
    if (id == NULL_ADDRESS) {
        token.name = "Ether";
        token.decimals = BigInt.fromI32(18);
        token.symbol = "ETH";
        token.save();
        return true;
    }

    const contract = ERC20.bind(Address.fromString(id));

    let symbol: ethereum.CallResult<string> = contract.try_symbol();
    let name: ethereum.CallResult<string> = contract.try_name();
    let decimals: ethereum.CallResult<i32> = contract.try_decimals();

    if (symbol.reverted || name.reverted || decimals.reverted) return false;

    token.name = name.value;
    token.symbol = symbol.value;
    token.decimals = BigInt.fromI32(decimals.value);
    token.save();
    return true;
}

function setUSDTPrice(sale: Sale, paymentTokenId: string, price: BigInt): bool {
    if (price.isZero()) {
        sale.usdtPrice = price;
        return true;
    }

    const paymentTokenAddress =
        paymentTokenId == NULL_ADDRESS
            ? WETH_ADDRESS
            : Address.fromString(paymentTokenId);

    if (paymentTokenAddress == USDT_ADDRESS) {
        sale.usdtPrice = price;
        return true;
    }

    let amounts = uniswapRouterContract.try_getAmountsOut(price, [
        paymentTokenAddress,
        USDT_ADDRESS,
    ]);

    if (amounts.reverted || amounts.value.length != 2) {
        amounts = uniswapRouterContract.try_getAmountsOut(price, [
            paymentTokenAddress,
            WETH_ADDRESS,
        ]);
        if (amounts.reverted || amounts.value.length != 2) return false;

        amounts = uniswapRouterContract.try_getAmountsOut(amounts.value[1], [
            WETH_ADDRESS,
            USDT_ADDRESS,
        ]);
    }
    if (amounts.reverted || amounts.value.length != 2) return false;

    log.debug(
        `Sale ${sale.id} getAmountsOut results: ${amounts.value[0]}, ${amounts.value[1]}`,
        []
    );

    sale.usdtPrice = amounts.value[1];
    return true;
}

function cloneArray(array: Array<string>): Array<string> {
    const clone = new Array<string>();
    for (let index = 0; index < array.length; index++) {
        clone.push(array[index]);
    }
    return clone;
}
