import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY;

export async function GET(request) {
  try {
    // Extract the token from the Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Authorization token is missing or invalid",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.split(" ")[1]; // Extract the token part
    let decoded;

    // Verify the token
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid or expired token",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db("database"); // Replace with your database name
    const collection = db.collection("client"); // Replace with your collection name

    // Fetch the client list
    const clients = await collection.find({}).toArray();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Client list retrieved successfully",
        clients,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
