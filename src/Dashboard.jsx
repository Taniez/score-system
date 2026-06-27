import { useEffect, useState } from "react";

const API =
  "https://script.google.com/macros/s/AKfycbxmrTfJ1GHilGk910Q711cqMYWwqxyk30NLlHns2cZjMFVm2k7js3Iu9Kmc_fo08rLy/exec";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [allData, setAllData] = useState({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [major, setMajor] = useState("IT");
  const [sec, setSec] = useState("1");
  const [week, setWeek] = useState(1);
  const [score, setScore] = useState("");

  // =========================
  // FETCH STUDENTS
  // =========================
  const fetchStudents = async () => {
    try {
      const res = await fetch(API);
  
      const data = await res.json();
  
      setAllData(data);
  
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);
  useEffect(() => {
    const key = `${major}-sec${sec}`;
  
    let list = allData[key] || [];
  
    const keyword = search.trim().toLowerCase();
  
    if (keyword !== "") {
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(keyword) ||
          s.name.toLowerCase().includes(keyword)
      );
    }
  
    setStudents(list);
    setSelected("");
  
  }, [major, sec, search, allData]);
  // =========================
  // SEARCH (manual)
  // =========================
  const handleSearch = () => {};
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  // =========================
  // SUBMIT SCORE
  // =========================
  const submit = async () => {
    if (!selected) {
      alert("กรุณาเลือกนักศึกษา");
      return;
    }

    if (score === "") {
      alert("กรุณากรอกคะแนน");
      return;
    }

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
      console.log("Submit error:", err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-slate-100 text-black p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-8">

      <h1 className="text-3xl font-bold text-center text-blue-700">
     ระบบกรอกคะแนนนักศึกษา
</h1>



<div className="grid grid-cols-2 gap-4 mb-6">

  {/* สาขา */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      📚 สาขา
    </label>

    <select
      value={major}
      onChange={(e) => setMajor(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    >
      <option value="IT">IT</option>
      <option value="AI">AI</option>
    </select>
  </div>

  {/* Section */}
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      👥 Section
    </label>

    <select
      value={sec}
      onChange={(e) => setSec(e.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    >
      <option value="1">Sec 1</option>
      <option value="2">Sec 2</option>
      
    </select>
    
  </div>

</div>

<div className="flex gap-2 mb-4">
  <input
    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="🔍 ค้นหาด้วยรหัสนักศึกษาหรือชื่อ"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={handleKeyDown}
  />


</div>

<div className="max-h-60 overflow-auto border rounded-xl">
  {students.length === 0 ? (
    <p className="p-4 text-center text-gray-400">
      ไม่พบข้อมูล
    </p>
  ) : (
    students.map((s) => (
      <div
        key={s.id}
        onClick={() => setSelected(s.id)}
        className={`p-4 border-b cursor-pointer transition
        ${
          selected === s.id
            ? "bg-blue-600 text-white"
            : "hover:bg-blue-50"
        }`}
      >
        <div className="font-semibold">
          {s.name}
        </div>

        <div className="text-sm opacity-80">
          {s.id}
        </div>
      </div>
    ))
  )}
</div>

<div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-4">
  <p className="text-gray-600">
    นักศึกษาที่เลือก
  </p>

  <h2 className="text-xl font-bold text-blue-700">
    {selected || "-"}
  </h2>
</div>

        {/* WEEK */}
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

        {/* SUBMIT BUTTON */}
        <button
  onClick={submit}
  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition"
>
    💾 บันทึกคะแนน
</button>
      </div>
    </div>
  );
}