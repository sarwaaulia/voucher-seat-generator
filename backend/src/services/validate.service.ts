import { checkAircraftType, VALID_AIRCRAFT_TYPES } from "./seat.service";

export interface CheckPayload {
	flightNumber?: unknown;
	date?: unknown;
}

export interface GeneratePayloads {
	crewName?: unknown;
	crewId?: unknown;
	flightNumber?: unknown;
	date?: unknown;
	aircraft?: unknown;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateCheckPayload(
	body: CheckPayload | null | undefined,
): string[] {
	const errors: string[] = [];
	const { flightNumber, date } = body || {};

	if (
		!flightNumber ||
		typeof flightNumber !== "string" ||
		!flightNumber.trim()
	) {
		errors.push("Flight number is required");
	}

	if (!date || typeof date !== "string" || !ISO_DATE_REGEX.test(date)) {
		errors.push("Date is required with format YY-MM-DD");
	}
	return errors;
}

export function validateGeneratePayload(
	body: GeneratePayloads | null | undefined,
): string[] {
	const errors: string[] = [];
	const { crewName, crewId, flightNumber, date, aircraft } = body || {};

	if (!crewName || typeof crewName !== "string" || !crewName.trim()) {
		errors.push("Crew name is required");
	}

	if (!crewId || typeof crewId !== "string" || !crewId.trim()) {
		errors.push("Crew ID is required");
	}

	if (
		!flightNumber ||
		typeof flightNumber !== "string" ||
		!flightNumber.trim()
	) {
		errors.push("Flight number is required");
	}

	if (!date || typeof date !== "string" || !ISO_DATE_REGEX.test(date)) {
		errors.push("Date is required with format YYYY-MM-DD.");
	}

	if (
		!aircraft ||
		typeof aircraft !== "string" ||
		!checkAircraftType(aircraft)
	) {
		errors.push(
			`Select an airplane from the following options: ${VALID_AIRCRAFT_TYPES.join(", ")}.`,
		);
	}
	return errors;
}
