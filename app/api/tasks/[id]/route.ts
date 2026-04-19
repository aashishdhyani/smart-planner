import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";



// ✅ MARK TASK COMPLETE
export async function PUT(
  req: Request,
  context: any
) {
  const { id } = await context.params;

  await connectDB();

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { $set: { completed: true } },
    { new: true }
  );

  return Response.json({ message: "Updated", updatedTask });
}

// ✅ DELETE TASK
export async function DELETE(
  req: Request,
  context: any
) {
  const { id } = await context.params;

  await connectDB();

  console.log("Deleting:", id);

  const deletedTask = await Task.findByIdAndDelete(id);

  if (!deletedTask) {
    return Response.json({ message: "Task not found" }, { status: 404 });
  }

  return Response.json({ message: "Deleted successfully" });
}