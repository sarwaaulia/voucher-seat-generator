-- CreateTable
CREATE TABLE "vouchers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "crew_name" TEXT NOT NULL,
    "crew_id" TEXT NOT NULL,
    "flight_number" TEXT NOT NULL,
    "flight_date" TEXT NOT NULL,
    "aircraftType" TEXT NOT NULL,
    "seat1" TEXT NOT NULL,
    "seat2" TEXT NOT NULL,
    "seat3" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_flight_number_flight_date_key" ON "vouchers"("flight_number", "flight_date");
