import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userEmail: String, // link task to user
  subject: String,
  hours: String,
  studyDate: String,
  deadline: String,
  priority: String,
  difficulty: String,
  notes: String,
  completed: { type: Boolean, default: false }
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);