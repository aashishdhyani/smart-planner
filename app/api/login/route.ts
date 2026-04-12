import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  await connectDB();

  const { email, password } = await req.json();

  const user = await User.findOne({ email });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 400 });
  }

  // 🔥 COMPARE HASHED PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return Response.json({ message: "Invalid password" }, { status: 400 });
  }

  return Response.json({
    message: "Login successful",
    user: {
      name: user.name,
      email: user.email,
    },
  });
}