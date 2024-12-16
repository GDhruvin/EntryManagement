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
    const { entryId } = body;

    // Validate input
    if (!entryId) {
      return NextResponse.json(
        { message: "The 'entryId' field is required" },
        { status: 400 } // Bad Request
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database");
    const collection = db.collection("entry");

    // Update the status to 1 for the specified entry
    const result = await collection.updateOne(
      { _id: new ObjectId(entryId) },
      { $set: { status: "done" } }
    );

    // Check if the document was updated
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "No entry found with the provided ID" },
        { status: 404 } // Not Found
      );
    }

    return NextResponse.json(
      { message: "Entry status updated successfully" },
      { status: 200 } // OK
    );
  } catch (error) {
    console.error("Error updating entry status:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the entry status" },
      { status: 500 } // Internal Server Error
    );
  }
}
