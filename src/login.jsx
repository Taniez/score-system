import { useState, useEffect } from "react";
import { io } from "socket.io-client";

// สร้าง socket ครั้งเดียว ไม่สร้างใหม่ทุก render
const socket = io();

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // รับผลจาก server
    socket.on("admin-status", (data) => {
      setLoading(false);

      if (data && data.success) {
        // ส่ง socket + ข้อมูล admin กลับไปให้ parent ใช้ต่อ
        onLogin({ socket, admin: data, resumeIds: data.resumeIds });
      } else {
        alert("รหัสผ่านไม่ถูกต้อง");
      }
    });

    return () => socket.off("admin-status");
  }, [onLogin]);

  const submit = () => {
    if (!password.trim()) return;
    setLoading(true);
    socket.emit("check-admin", password); // ส่งให้ server ตรวจ
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit();
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
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
        </button>

      </div>
    </div>
  );
}