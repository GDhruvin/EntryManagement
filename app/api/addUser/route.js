import dbConnect from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function GET(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const db = await dbConnect();

    // Check if user already exists
    const existingUser = await db
      .collection("user")
      .findOne({ username: "Tirth_sonani" });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash("Tirth@123", 10);

    await db.collection("user").insertOne({
      username: "Tirth_sonani",
      password: hashedPassword,
    });

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Error creating user", error });
  }
}
