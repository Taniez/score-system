import { useEffect, useState, useMemo } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbyKB5Ue8MLyIvK1x0zZLgQ_YNKowjoRBlJj8IeqRH3F5yQUaUwujxXlZO64MdojNu_8/exec";

const CACHE_KEY = "student_data";
const CACHE_TTL = 5 * 60 * 1000; // 5 นาที

export default function Dashboard() {
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [major, setMajor] = useState("IT");
  const [sec, setSec] = useState("1");
  const [week, setWeek] = useState(1);
  const [score, setScore] = useState("");

  // =========================
  // FETCH WITH CACHE
  // =========================
  useEffect(() => {
    const loadData = async () => {
      // ลองอ่าน cache ก่อน
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            setAllData(data);
            setLoading(false);
            return; // ใช้ cache ได้เลย ไม่ต้องยิง API
          }
        }
      } catch (_) {}

      // ไม่มี cache หรือหมดอายุ → fetch จริง
      try {
        const res = await fetch(API);
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

  // =========================
  // FILTER ด้วย useMemo (ไม่ re-render ฟรี)
  // =========================
  const students = useMemo(() => {
    const key = `${major}-sec${sec}`;
    let list = allData[key] || [];
    const keyword = search.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(
      (s) =>
        s.id.toLowerCase().includes(keyword) ||
        s.name.toLowerCase().includes(keyword)
    );
  }, [major, sec, search, allData]);

  // reset selected เมื่อ list เปลี่ยน
  useEffect(() => {
    setSelected("");
  }, [major, sec]);

  // =========================
  // SUBMIT SCORE
  // =========================
  const submit = async () => {
    if (!selected) return alert("กรุณาเลือกนักศึกษา");
    if (score === "") return alert("กรุณากรอกคะแนน");

    try {
      await fetch(API, {
        method: "POST",
        body: JSON.stringify({
          major,
          sec,
          id: selected,
          week: Number(week),
          score: Number(score),
        }),
      });
      alert("บันทึกสำเร็จ");
      setScore("");
    } catch (err) {
      console.error("Submit error:", err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-100 text-black p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          ระบบกรอกคะแนนนักศึกษา
        </h1>

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
            <option key={i} value={i + 1}>สัปดาห์ {i + 1}</option>
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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
        >
          บันทึกคะแนน
        </button>
      </div>
    </div>
  );
}