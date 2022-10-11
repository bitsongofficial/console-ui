export enum CollectionProvider {
	PINATA = "pinata",
	NFT_STORAGE = "nft.storage",
}

export interface NFTCreator {
	address: string
	verified: boolean
	share: number
}

export interface MasterEdition {
	maxSupply: string
	supply: string
}

export interface CreateNFT {
	uri: string
	collId: string
	sellerFeeBasisPoints: number
	primarySaleHappened: boolean
	isMutable: boolean
	creators: NFTCreator[]
	metadataAuthority: string
	mintAuthority: string
	masterEdition: MasterEdition
}
