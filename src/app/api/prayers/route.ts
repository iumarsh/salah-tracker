import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Prayer from "@/model/Prayer";

// 📌 Create a new prayer entry (POST)
export async function POST(req: Request) {
    try {
        const headers = new Headers(req.headers);
        const userId = headers.get("X-User-Id"); // Get user ID from middleware

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { prayer, status, date } = await req.json();

        await dbConnect();
        const newPrayer = await Prayer.create({ userId, prayer, status, date });

        return NextResponse.json(newPrayer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log prayer" }, { status: 500 });
    }
}

// 📌 Get all prayers for the logged-in user (GET)
    export async function GET(req: Request) {
        try {
            const headers = new Headers(req.headers);
            const userId = headers.get("X-User-Id"); // Get user ID from middleware
            if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

            await dbConnect();

            // ✅ Extract query parameters
            const { searchParams } = new URL(req.url);
            const filter = searchParams.get("filter") || "daily"; // Default to daily

            // ✅ Get current date
            const now = new Date();
            let startDate: Date, endDate: Date;

            switch (filter) {
                case "weekly":
                    startDate = new Date();
                    startDate.setDate(now.getDate() - 7);
                    break;
                case "monthly":
                    startDate = new Date();
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case "yearly":
                    startDate = new Date();
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default: // Daily
                    startDate = new Date(now.setHours(0, 0, 0, 0));
            }

            endDate = new Date(); // Now

            // ✅ Fetch prayers within the filtered range
            const prayers = await Prayer.find({
                userId,
                date: { $gte: startDate.toISOString().split("T")[0], $lte: endDate.toISOString().split("T")[0] },
            });

            // ✅ Initialize stats
            let stats = {
                total: 0,
                masjid: 0,
                home: 0,
                qaza: 0,
                missed: 0,
            };

            // ✅ Aggregate prayer statuses
            prayers.forEach((prayer) => {
                ["fajr", "zuhr", "asr", "maghrib", "isha"].forEach((prayerKey) => {
                    stats.total += 1;
                    if (prayer[prayerKey] === "masjid") stats.masjid += 1;
                    else if (prayer[prayerKey] === "home") stats.home += 1;
                    else if (prayer[prayerKey] === "qaza") stats.qaza += 1;
                    else if (prayer[prayerKey] === "missed") stats.missed += 1;
                });
            });

            return NextResponse.json({ prayers, stats }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: "Failed to fetch prayers" }, { status: 500 });
        }
    }