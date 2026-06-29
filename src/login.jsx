import { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");

  const submit = () => {
    if (password === "43210") {
      onLogin();
    } else {
      alert("รหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold text-center mb-6">
          Login TA
        </h2>

        <input
          type="password"
          placeholder="กรอกรหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={submit}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          เข้าสู่ระบบ
        </button>

      </div>
    </div>
  );
}