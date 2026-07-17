import React, {
	useState,
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
} from "react";
import apiClient from "../api/axios";
import { toDisplayDate } from "../utils/date";

const AIRCRAFT_OPTIONS = ["ATR", "AIRBUS_320", "BOEING_737_MAX"] as const;

type AircraftOption = (typeof AIRCRAFT_OPTIONS)[number];

interface VoucherFormState {
	crewName: string;
	crewId: string;
	flightNumber: string;
	flightDate: string;
	aircraftType: AircraftOption;
}

const INITIAL_FORM: VoucherFormState = {
	crewName: "",
	crewId: "",
	flightNumber: "",
	flightDate: "",
	aircraftType: AIRCRAFT_OPTIONS[1],
};

type FormStatus = "idle" | "loading" | "success" | "error" | "duplicate";

export default function VoucherForm() {
	const [form, setForm] = useState<VoucherFormState>(INITIAL_FORM);
	const [status, setStatus] = useState<FormStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [seats, setSeats] = useState<string[]>([]);

	function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	function validateForm(): string | null {
		if (!form.crewName.trim()) return "Crew name is required";
		if (!form.crewId.trim()) return "Crew ID is required";
		if (!form.flightNumber.trim()) return "Flight number is required";
		if (!form.flightDate) return "Date is required with format YYYY-MM-DD";
		if (!AIRCRAFT_OPTIONS.includes(form.aircraftType as any))
			return "Select an airplane from the following options";
		return null;
	}

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrorMessage("");
		setSeats([]);

		const clientError = validateForm();
		if (clientError) {
			setStatus("error");
			setErrorMessage(clientError);
			return;
		}

		setStatus("loading");

		try {
			const checkRes = await apiClient.post<{ exist: boolean }>("/check", {
				flightNumber: form.flightNumber.trim(),
				date: form.flightDate,
			});

			if (checkRes.data.exist) {
				setStatus("duplicate");
				setErrorMessage(
					`Voucher for flight ${form.flightNumber.trim()} on ${toDisplayDate(
						form.flightDate,
					)} has been created before. Please check the flight number and date.`,
				);
				return;
			}

			// if nothing, make a new voucher
			const generateRes = await apiClient.post<{ seats?: string[] }>(
				"/generate",
				{
					crewName: form.crewName.trim(),
					crewId: form.crewId.trim(),
					flightNumber: form.flightNumber.trim(),
					date: form.flightDate,
					aircraft: form.aircraftType,
				},
			);

			setSeats(generateRes.data.seats || []);
			setStatus("success");
		} catch (err: any) {
			setStatus("error");
			const apiMessage = err?.response?.data?.error?.message;
			const apiDetails = err?.response?.data?.error?.details;

			const detailedError =
				apiDetails && apiDetails.length > 0
					? `${apiMessage}: ${apiDetails.join(", ")}`
					: apiMessage;

			setErrorMessage(
				detailedError || "An unexpected error occurred. Please try again.",
			);
		}
	}

	function handleReset() {
		setForm(INITIAL_FORM);
		setStatus("idle");
		setErrorMessage("");
		setSeats([]);
	}

	const isLoading = status === "loading";

	return (
		<div className="w-full max-w-xl mx-auto">
			<form
				onSubmit={handleSubmit}
				className="bg-sky-900/60 border border-sky-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur"
			>
				<div className="mb-6">
					<h1 className="text-3xl font-semibold text-white">
						Voucher Seat Assignment
					</h1>
					<p className="text-sm text-slate-400 mt-1">
						Enter flight details & crew information to generate 3 random seats.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Field label="Crew Name" htmlFor="crewName">
						<input
							id="crewName"
							name="crewName"
							type="text"
							value={form.crewName}
							onChange={handleChange}
							placeholder="Sarah"
							required
							className="input"
						/>
					</Field>

					<Field label="Crew ID" htmlFor="crewId">
						<input
							id="crewId"
							name="crewId"
							type="text"
							value={form.crewId}
							onChange={handleChange}
							placeholder="98123"
							required
							className="input"
						/>
					</Field>

					<Field label="Flight Number" htmlFor="flightNumber">
						<input
							id="flightNumber"
							name="flightNumber"
							type="text"
							value={form.flightNumber}
							onChange={handleChange}
							placeholder="GA102"
							required
							className="input uppercase"
						/>
					</Field>

					<Field label="Flight Date" htmlFor="flightDate">
						<input
							id="flightDate"
							name="flightDate"
							type="date"
							value={form.flightDate}
							onChange={handleChange}
							required
							className="input"
						/>
					</Field>

					<Field label="Aircraft Type" htmlFor="aircraftType" full>
						<select
							id="aircraftType"
							name="aircraftType"
							value={form.aircraftType}
							onChange={handleChange}
							className="input"
						>
							{AIRCRAFT_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</Field>
				</div>

				<div className="flex items-center gap-3 mt-6">
					<button
						type="submit"
						disabled={isLoading}
						className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-sky-950 font-semibold py-2.5 rounded-lg transition-colors"
					>
						{isLoading ? "Processing..." : "Create Voucher"}
					</button>
					<button
						type="button"
						onClick={handleReset}
						className="px-4 py-2.5 rounded-lg border border-sky-700 text-slate-300 hover:bg-sky-800 transition-colors"
					>
						Reset
					</button>
				</div>
			</form>

			{/* success */}
			{status === "success" && seats.length > 0 && (
				<ResultCard type="success">
					<p className="text-sm text-emerald-300 font-medium mb-3">
						Voucher created successfully! 3 random seats for flight{" "}
						<span className="font-mono">{form.flightNumber.trim()}</span>:
					</p>
					<div className="flex gap-3">
						{seats.map((seat) => (
							<span
								key={seat}
								className="font-mono text-lg font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 rounded-lg px-4 py-2"
							>
								{seat}
							</span>
						))}
					</div>
				</ResultCard>
			)}

			{/* if duplicate */}
			{status === "duplicate" && (
				<ResultCard type="error">
					<p className="text-sm text-rose-300 font-medium">⚠ {errorMessage}</p>
				</ResultCard>
			)}

			{/* global error */}
			{status === "error" && errorMessage && (
				<ResultCard type="error">
					<p className="text-sm text-rose-300 font-medium">✕ {errorMessage}</p>
				</ResultCard>
			)}
		</div>
	);
}

interface FieldProps {
	label: string;
	htmlFor: string;
	children: ReactNode;
	full?: boolean;
}

function Field({ label, htmlFor, children, full = false }: FieldProps) {
	return (
		<div className={full ? "sm:col-span-2" : ""}>
			<label
				htmlFor={htmlFor}
				className="block text-xs font-medium text-slate-400 mb-1.5"
			>
				{label}
			</label>
			{children}
		</div>
	);
}

interface ResultCardProps {
	type: "success" | "error";
	children: ReactNode;
}

function ResultCard({ type, children }: ResultCardProps) {
	const border =
		type === "success" ? "border-emerald-500/30" : "border-rose-500/30";
	const bg = type === "success" ? "bg-emerald-500/5" : "bg-rose-500/5";
	return (
		<div className={`mt-4 rounded-xl border ${border} ${bg} p-4 sm:p-5`}>
			{children}
		</div>
	);
}
