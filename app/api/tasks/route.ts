import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

// 🔹 SAVE TASK
export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const task = await Task.create(body);

  return Response.json({ message: "Task saved", task });
}

// 🔹 FETCH TASKS
export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

 const tasks = await Task.find({ userEmail: email }).lean();

  return Response.json({ tasks });
}