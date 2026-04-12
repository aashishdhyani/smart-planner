import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  await Task.findByIdAndDelete(params.id);
  console.log("API HIT:", params.id);

  const updatedTask = await Task.findByIdAndUpdate(
    params.id,
    { $set: { completed: true } },
    { new: true }
  );

  return Response.json({ message: "Updated", updatedTask });
}
