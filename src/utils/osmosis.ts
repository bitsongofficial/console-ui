export enum LockQueryType {
	ByDuration = 0,
	ByTime = 1,
	UNRECOGNIZED = -1,
}

export enum LockQueryTypeSDKType {
	ByDuration = 0,
	ByTime = 1,
	UNRECOGNIZED = -1,
}

export function lockQueryTypeFromJSON(object: any): LockQueryType {
	switch (object) {
		case 0:
		case "ByDuration":
			return LockQueryType.ByDuration

		case 1:
		case "ByTime":
			return LockQueryType.ByTime

		case -1:
		case "UNRECOGNIZED":
		default:
			return LockQueryType.UNRECOGNIZED
	}
}
