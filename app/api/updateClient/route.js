import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.SECRET_KEY;

export async function PUT(request) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Authorization token is missing or invalid",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET);

    const { id, name, email, mobileNumber } = await request.json();

    // Validate input
    if (!id || (!name && !email && !mobileNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid input data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db("database"); // Replace with your database name
    const collection = db.collection("client");

    // Update the client
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, email, mobileNumber } }
    );

    if (updateResult.matchedCount === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Client not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Client updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
