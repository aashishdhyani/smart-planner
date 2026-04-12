"use client";

import { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

const handleSubmit = async (e: any) => {
  e.preventDefault();

  const url = isLogin ? "/api/login" : "/api/register";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    alert("Server error");
    return;
  }

  if (isLogin) {
    if (data.message === "Login successful") {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } else {
      alert(data.message);
    }
  } else {
    alert(data.message);
  }
};


  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">

        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          {!isLogin && (
            <input
              placeholder="Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          )}

          <input
            placeholder="Email"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <button className="w-full bg-blue-500 text-white p-2 rounded">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            className="text-blue-500 cursor-pointer ml-1"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

      </div>
    </div>
  );
}