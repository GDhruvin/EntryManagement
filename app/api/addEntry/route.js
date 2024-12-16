import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.SECRET_KEY;

export async function POST(request) {
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

    // Parse the incoming request body
    const body = await request.json();
    const {
      clothType,
      totalMeter,
      pricePerMeter,
      totalAmount,
      dueDate,
      clientId,
      createdBy,
      status,
    } = body;

    // Validate input
    if (
      !clothType ||
      !totalMeter ||
      !pricePerMeter ||
      !totalAmount ||
      !dueDate ||
      !clientId ||
      !createdBy
    ) {
      return NextResponse.json(
        {
          message:
            "All fields (clothType, totalMeter, pricePerMeter, totalAmount, dueDate, clientId, createdBy, status) are required",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database");
    const collection = db.collection("entry");

    // Create a new entry document
    const newEntry = {
      clothType,
      totalMeter,
      pricePerMeter,
      totalAmount,
      dueDate,
      clientId,
      createdBy,
      status,
      createdAt: new Date(),
    };

    // Insert the document into the database
    const result = await collection.insertOne(newEntry);

    // Respond with the inserted document ID
    return NextResponse.json(
      { message: "Entry added successfully", entryId: result.insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding entry:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the entry" },
      { status: 500 }
    );
  }
}
