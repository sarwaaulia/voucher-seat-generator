import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { generateRandomSeats } from "../services/seat.service";
import {
	CheckPayload,
	GeneratePayloads,
	validateCheckPayload,
    validateGeneratePayload,
} from "../services/validate.service";
import { AircraftType } from "@prisma/client";

function sendError(
	res: Response,
	statusCode: number,
	message: string,
	details: string[] | null = null,
): Response {
	return res.status(statusCode).json({
		success: false,
		error: {
			message,
			...(details ? { details } : {}),
		},
	});
}

export async function checkVoucher(
	req: Request,
	res: Response,
): Promise<Response> {
	try {
		const body = req.body as CheckPayload;
		const errors = validateCheckPayload(body);

		if (errors.length > 0) {
			return sendError(res, 400, "Invalid input", errors);
		}

		const flightNumber = (body.flightNumber as string).trim();
		const date = body.date as string;

		const isExist = await prisma.voucher.findUnique({
			where: {
				flightNumber_flightDate: {
					flightNumber: flightNumber,
					flightDate: date,
				},
			},
		});
		return res.status(200).json({ exist: Boolean(isExist) });
	} catch (error) {
		console.error("[checkVoucher] error:", error);
		return sendError(res, 500, "Something went wrong");
	}
}

export async function generateVoucher(
	req: Request,
	res: Response,
): Promise<Response> {
	try {
		const body = req.body as GeneratePayloads;
		const errors = validateGeneratePayload(body);

		if (errors.length > 0) {
			return sendError(res, 400, "Invalid input", errors);
		}

		const crewName = (body.crewName as string).trim();
		const crewId = (body.crewId as string).trim();
		const flightNumber = (body.flightNumber as string).trim();
		const date = body.date as string;
		const aircraft = body.aircraft as AircraftType;

		const existing = await prisma.voucher.findUnique({
			where: {
				flightNumber_flightDate: {
					flightNumber: flightNumber,
					flightDate: date,
				},
			},
		});

		if (existing) {
			return sendError(
				res,
				409,
				`Voucher for flight ${flightNumber} on ${date} has already been created.`,
			);
		}

		const seats = generateRandomSeats(aircraft, 3);

		const voucher = await prisma.voucher.create({
			data: {
				crewName: crewName,
				crewId: crewId,
				flightNumber: flightNumber,
				flightDate: date,
				aircraftType: aircraft,
				seat1: seats[0],
				seat2: seats[1],
				seat3: seats[2],
				createdAt: new Date().toISOString(),
			},
		});

		return res.status(201).json({
			success: true,
			seats: [voucher.seat1, voucher.seat2, voucher.seat3],
		});
	} catch (err: any) {
		if (err && err.code === "P2002") {
			return sendError(
				res,
				409,
				"Voucher for this flight and date has already been created",
			);
		}

		console.error("[generateVoucher] error:", err);
		return sendError(
			res,
			500,
			"Something went wrong",
		);
	}
}