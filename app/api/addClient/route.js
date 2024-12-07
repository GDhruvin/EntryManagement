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
    const { name, email, mobileNumber, createdBy } = body;

    // Validate input
    if (!name || !email || !mobileNumber || !createdBy) {
      return NextResponse.json(
        {
          message:
            "All fields (name, email, mobileNumber, createdBy) are required",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database"); // Use your database name
    const collection = db.collection("client"); // Use your collection name

    // Check if a client with the same email or mobile number already exists
    const existingClient = await collection.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingClient) {
      return NextResponse.json(
        { message: "A client with this email or mobile number already exists" },
        { status: 409 } // Conflict status code
      );
    }

    // Create a new client document
    const newClient = {
      name,
      email,
      mobileNumber,
      createdBy,
      createdAt: new Date(),
    };

    // Insert the document into the database
    const result = await collection.insertOne(newClient);

    // Respond with the inserted document ID
    return NextResponse.json(
      { message: "Client added successfully", clientId: result.insertedId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding client:", error);
    return NextResponse.json(
      { message: "An error occurred while adding the client" },
      { status: 500 }
    );
  }
}
