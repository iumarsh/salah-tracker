import dbConnect from "@/lib/dbConnect";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {email, password, name } = await req.json();
        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) return NextResponse.json({ error: "User already exists" }, { status: 400 });

        const newUser = await User.create({ name, email, password, provider: "credentials" });

        return NextResponse.json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
