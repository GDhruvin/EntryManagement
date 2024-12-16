import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.SECRET_KEY;

export async function GET(request) {
  try {
    // Extract the token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header missing or invalid" },
        { status: 401 } // Unauthorized
      );
    }

    const token = authHeader.split(" ")[1]; // Extract the token part

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 } // Unauthorized
      );
    }

    // Extract the query parameter for clientId
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { message: "clientId query parameter is required" },
        { status: 400 } // Bad Request
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database");
    const collection = db.collection("entry");

    // Query the database for entries with the specified clientId
    const entries = await collection.find({ clientId }).toArray();

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { message: "No entries found for the specified clientId" },
        { status: 404 } // Not Found
      );
    }

    // Respond with the found entries
    return NextResponse.json(
      { message: "Entries retrieved successfully", entries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving entries:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the entries" },
      { status: 500 }
    );
  }
}
