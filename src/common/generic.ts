export const formatShortText = (value: string, start = 2, end = 4) => {
	if (value.length === 0) {
		return value
	}

	return `${value.slice(0, start)}...${value.slice(-end)}`
}
