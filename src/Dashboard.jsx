import { useEffect, useState, useMemo } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbyKB5Ue8MLyIvK1x0zZLgQ_YNKowjoRBlJj8IeqRH3F5yQUaUwujxXlZO64MdojNu_8/exec";

const CACHE_KEY = "student_data";
const CACHE_TTL = 5 * 60 * 1000;

export default function Dashboard({ admin, onLogout }) {
  const [allData, setAllData]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState(null); // 'success' | 'error' | null
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState("");
  const [major, setMajor]           = useState("IT");
  const [sec, setSec]               = useState("1");
  const [week, setWeek]             = useState(1);
  const [score, setScore]           = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            setAllData(data);
            setLoading(false);
            return;
          }
        }
      } catch (_) {}

      try {
        const res  = await fetch(API);
        const data = await res.json();
        setAllData(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const students = useMemo(() => {
    const key     = `${major}-sec${sec}`;
    const list    = allData[key] || [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(
      (s) =>
        s.id.toLowerCase().includes(keyword) ||
        s.name.toLowerCase().includes(keyword)
    );
  }, [major, sec, search, allData]);

  useEffect(() => {
    setSelected("");
  }, [major, sec]);

  const submit = async () => {
    if (!selected) return alert("กรุณาเลือกนักศึกษา");
    if (score === "") return alert("กรุณากรอกคะแนน");
  
    setSubmitting(true);
    setResult(null);
    try {
      await fetch(API, {
        method: "POST",
        body: JSON.stringify({
          major, sec, id: selected,
          week: Number(week), score: Number(score),
        }),
      });
      setResult("success");
      setScore("");
  
   // ✅ ส่ง adminPass ไปด้วยผ่าน URL
   const last4     = selected.slice(-4);
   const adminPass = sessionStorage.getItem("adminPass") || "";
   const queueUrl  = `https://queue-app-n3s8.onrender.com?search=${last4}&ap=${encodeURIComponent(adminPass)}`;
   setTimeout(() => { window.location.href = queueUrl; }, 800);
  
    } catch (err) {
      console.error("Submit error:", err);
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPass");
    sessionStorage.removeItem("adminName");
    sessionStorage.removeItem("adminId");
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-black p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        {/* Header + logout */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            ระบบกรอกคะแนนนักศึกษา
          </h1>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-gray-500">👤 {admin?.name || "TA"}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">สาขา</label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="IT">IT</option>
              <option value="AI">AI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
            <select
              value={sec}
              onChange={(e) => setSec(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="1">Sec 1</option>
              <option value="2">Sec 2</option>
              <option value="3">Sec 3</option>
              <option value="4">Sec 4</option>
            </select>
          </div>
        </div>

        <input
          className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="🔍 ค้นหาด้วยรหัสนักศึกษาหรือชื่อ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="max-h-60 overflow-auto border rounded-xl mb-4">
          {loading ? (
            <p className="p-4 text-center text-blue-400 animate-pulse">กำลังโหลดข้อมูล...</p>
          ) : students.length === 0 ? (
            <p className="p-4 text-center text-gray-400">ไม่พบข้อมูล</p>
          ) : (
            students.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`p-4 border-b cursor-pointer transition ${
                  selected === s.id ? "bg-blue-600 text-white" : "hover:bg-blue-50"
                }`}
              >
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm opacity-80">{s.id}</div>
              </div>
            ))
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-4">
          <p className="text-gray-600">นักศึกษาที่เลือก</p>
          <h2 className="text-xl font-bold text-blue-700">{selected || "-"}</h2>
        </div>

        <select
          className="border p-2 rounded mb-2 w-full"
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
        >
          {[...Array(11)].map((_, i) => (
            <option key={i} value={i + 1}>
              สัปดาห์ {i + 1}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          max="100"
          className="w-full border rounded-xl px-4 py-3 mb-4"
          placeholder="กรอกคะแนน"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            "บันทึกคะแนน"
          )}
        </button>

        {result === "success" && (
          <p className="mt-3 text-center text-green-600 font-semibold"> บันทึกสำเร็จ</p>
        )}
        {result === "error" && (
          <p className="mt-3 text-center text-red-500 font-semibold">
             เกิดข้อผิดพลาด กรุณาลองใหม่
          </p>
        )}
      </div>
    </div>
  );
}