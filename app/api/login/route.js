import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.SECRET_KEY;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Check if username and password are provided
    if (!username || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Username and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db("database"); // Replace with your database name
    const collection = db.collection("user"); // Replace with your collection name

    // Find the user by username
    const user = await collection.findOne({ username });

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: "User not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time (e.g., 1 hour)
    );

    // Set the cookie
    const authData = {
      token,
      username: user.username,
      email: user.email,
      id: user._id,
    };
    const cookie = serialize("authData", JSON.stringify(authData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Login successful",
        user: { username: user.username, email: user.email, id: user._id },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
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
