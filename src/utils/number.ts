import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { Asset } from "@chain-registry/types"
import { BigNumber } from "bignumber.js"

export const gtCoin = (coin: Coin, compareAmount: string | number) => {
	return new BigNumber(coin.amount).gt(compareAmount)
}

export const gteCoin = (coin: Coin, compareAmount: string | number) => {
	return new BigNumber(coin.amount).gte(compareAmount)
}

export const sumCoins = (left: Coin, right: Coin, asset: Asset): Coin => {
	const leftAmount = new BigNumber(left.amount)
	const rightAmount = new BigNumber(right.amount)

	return {
		$type: Coin.$type,
		denom: asset.base,
		amount: leftAmount.plus(rightAmount).toString(),
	}
}

export const fromBaseToDenom = (
	coin: Coin,
	asset: Asset,
	toDenom: string,
	toUnit: string,
	scalar: number = -1
): Coin => {
	const denomUnit = asset.denom_units.find((unit) => unit.denom === toDenom)

	if (denomUnit) {
		return {
			$type: "cosmos.base.v1beta1.Coin",
			denom: toUnit,
			amount: new BigNumber(coin.amount)
				.multipliedBy(`1e${denomUnit.exponent * scalar}`)
				.toString(),
		}
	}

	return coin
}

export const fromBaseToDisplay = (coin: Coin, asset: Asset) => {
	return fromBaseToDenom(coin, asset, asset.display, asset.display)
}

export const fromDisplayToBase = (coin: Coin, asset: Asset) => {
	return fromBaseToDenom(coin, asset, asset.display, asset.base, 1)
}
