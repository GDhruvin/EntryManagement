import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.SECRET_KEY;

export async function PUT(request) {
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
    const { entryId, clothType, totalMeter, pricePerMeter, totalAmount } = body;

    // Validate input
    if (
      !entryId ||
      !clothType ||
      !totalMeter ||
      !pricePerMeter ||
      !totalAmount
    ) {
      return NextResponse.json(
        {
          message:
            "All fields (entryId, clothType, totalMeter, pricePerMeter, totalAmount) are required",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database");
    const collection = db.collection("entry");

    // Update the specified fields of the entry
    const result = await collection.updateOne(
      { _id: new ObjectId(entryId) },
      {
        $set: {
          clothType,
          totalMeter,
          pricePerMeter,
          totalAmount,
        },
      }
    );

    // Check if an entry was modified
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Entry not found or no changes made" },
        { status: 404 } // Not Found
      );
    }

    return NextResponse.json(
      { message: "Entry updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the entry" },
      { status: 500 }
    );
  }
}
