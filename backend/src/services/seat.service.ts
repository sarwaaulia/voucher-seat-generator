import { AircraftType } from "@prisma/client";

export const AIRCRAFT_LAYOUTS = {
	ATR: {
		rows: { min: 1, max: 18 },
		columns: ["A", "C", "D", "F"],
	},
	"Airbus 320": {
		rows: { min: 1, max: 32 },
		columns: ["A", "B", "C", "D", "E", "F"],
	},
	"Boeing 737 Max": {
		rows: { min: 1, max: 32 },
		columns: ["A", "B", "C", "D", "E", "F"],
	},
} as const;

const MAP_PRISMA_TO_LAYOUT: Record<AircraftType, keyof typeof AIRCRAFT_LAYOUTS> = {
    ATR: "ATR",
    AIRBUS_320: "Airbus 320",
    BOEING_737_MAX: "Boeing 737 Max"
};

export const VALID_AIRCRAFT_TYPES = Object.keys(MAP_PRISMA_TO_LAYOUT) as AircraftType[];

export function checkAircraftType(
	aircraftType: string,
): aircraftType is AircraftType {
	return VALID_AIRCRAFT_TYPES.includes(aircraftType as AircraftType);
}

// form all seats combinations
export function buildSeatMap(aircraftType: AircraftType): string[] {
	const layoutKey = MAP_PRISMA_TO_LAYOUT[aircraftType]
	const layout = AIRCRAFT_LAYOUTS[layoutKey];

	const seats: string[] = [];
	for (let row = layout.rows.min; row <= layout.rows.max; row++) {
		for (const col of layout.columns) {
			seats.push(`${row}${col}`);
		}
	}
	return seats;
}

function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function generateRandomSeats(
	aircraftType: AircraftType,
	count: number = 3,
): string[] {
	if (!checkAircraftType(aircraftType)) {
		throw new Error(`Aircraft type not found: ${aircraftType}`);
	}

	const allSeats = buildSeatMap(aircraftType);

	if (allSeats.length < count) {
		throw new Error(
			`Number of seats on the: ${aircraftType} is insufficient to generate ${count} unnique seats.`,
		);
	}

	const shuffled = shuffle(allSeats);
	return shuffled.slice(0, count);
}
