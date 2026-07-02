import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const QUEUE_SERVER = "https://queue-app-n3s8.onrender.com";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const socketRef               = useRef(null);
  const passwordRef             = useRef("");

  // sync password → ref ทุกครั้งที่เปลี่ยน
  useEffect(() => { passwordRef.current = password; }, [password]);

  useEffect(() => {
    const s = io(QUEUE_SERVER, { autoConnect: false });
    socketRef.current = s;

    s.on("admin-status", (data) => {
      setLoading(false);
      if (data && data.success) {
        sessionStorage.setItem("adminPass", passwordRef.current);
        sessionStorage.setItem("adminName", data.name);
        sessionStorage.setItem("adminId",   String(data.id));
        onLogin({ name: data.name, id: data.id });
      } else {
        setError("รหัสผ่านไม่ถูกต้อง");
        s.disconnect();
      }
    });

    s.on("connect_error", () => {
      setLoading(false);
      setError("เชื่อมต่อ server ไม่ได้ กรุณาลองใหม่");
      s.disconnect();
    });

    return () => s.disconnect();
  }, [onLogin]);

  const submit = () => {
    if (!password) return setError("กรุณากรอกรหัสผ่าน");
    setError("");
    setLoading(true);
    const s = socketRef.current;
    if (s.connected) {
      s.emit("check-admin", password);
    } else {
      s.connect();
      s.once("connect", () => s.emit("check-admin", password));
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login TA</h2>

        <input
          type="password"
          placeholder="กรอกรหัสผ่าน"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(""); }}
          onKeyDown={handleKey}
          disabled={loading}
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              กำลังตรวจสอบ...
            </>
          ) : "เข้าสู่ระบบ"}
        </button>
      </div>
    </div>
  );
