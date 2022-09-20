import { Coin } from "@bitsongjs/client/dist/codec/cosmos/base/v1beta1/coin"
import { Asset } from "@chain-registry/types"
import { BigNumber } from "bignumber.js"

export const isNegative = (amount: string): boolean => {
	const number = new BigNumber(amount)

	return number.isNegative()
}

export const isNaN = (amount: string): boolean => {
	const number = new BigNumber(amount)

	return number.isNaN()
}

export const gtnZero = (amount: string): boolean => {
	const number = new BigNumber(amount)

	return number.gt(0)
}

export const gteCompare = (amount: string, compare: string): boolean => {
	const number = new BigNumber(amount)

	return number.gte(new BigNumber(compare))
}

export const compareBalance = (amount: string, compare: string): boolean => {
	const number = new BigNumber(amount)
	const compareNumber = new BigNumber(compare)

	return number.lte(compareNumber)
}

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

export const toMicroUnit = (amount: string | number, exponent = 6) => {
	return new BigNumber(amount).multipliedBy(`1e${exponent}`).toString()
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
