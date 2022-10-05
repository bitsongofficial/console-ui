import { ibcMap } from "@/configs"
import { Asset } from "@chain-registry/types"
import { Coin } from "@cosmjs/proto-signing"
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

export const toViewDenomByAssets = (
	coin: Coin,
	assets: Asset[],
	decCoinExponent = 0
) => {
	const assetCoin = assets.find((asset) => asset.base === coin.denom)

	if (assetCoin) {
		const denomUnit = assetCoin.denom_units.find(
			(el) => el.denom === assetCoin.display
		)

		if (denomUnit) {
			return {
				denom: assetCoin.display,
				amount: new BigNumber(coin.amount)
					.multipliedBy(`1e-${denomUnit.exponent + decCoinExponent}`)
					.toString(),
			}
		}
	}
}

export const toViewDenom = (
	coin: Coin,
	assets: Asset[],
	decCoinExponent = 0
): Coin | undefined => {
	const newCoin = toViewDenomByAssets(coin, assets, decCoinExponent)

	if (newCoin) {
		return newCoin
	}

	const ibc = ibcMap.find((ibcEl) => {
		const assets = ibcEl.assets as Asset[]

		return assets.find((asset) => asset.base === coin.denom) !== undefined
	})

	if (ibc) {
		return toViewDenomByAssets(coin, ibc.assets, decCoinExponent)
	}

	return {
		...coin,
		amount: toMicroUnit(coin.amount, -6),
	}
}
