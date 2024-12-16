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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("database");
    const collection = db.collection("clothtype");

    // Query the database for entries with the specified clientId
    const clothtypes = await collection.find({}).toArray();

    if (!clothtypes || clothtypes.length === 0) {
      return NextResponse.json(
        { message: "No Cloth type found" },
        { status: 404 } // Not Found
      );
    }

    // Respond with the found entries
    return NextResponse.json(
      { message: "Clothtypes retrieved successfully", clothtypes },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving Clothtypes:", error);
    return NextResponse.json(
      { message: "An error occurred while retrieving the Clothtypes" },
      { status: 500 }
    );
  }
}
