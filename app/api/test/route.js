// app/api/test/route.js

export async function GET(request) {
  return new Response("Test API is working!", {
    status: 200,
  });
}
