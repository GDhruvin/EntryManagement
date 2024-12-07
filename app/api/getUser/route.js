import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db("database"); // Replace with your database name
    const collection = db.collection("user"); // Replace with your collection name

    // Fetch data from the 'user' collection
    const users = await collection.find({}).toArray();

    // Return the data as a JSON response
    return new Response(JSON.stringify({ success: true, users }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
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
