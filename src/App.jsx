import { useState } from "react";
import Login from "./login";
import Dashboard from "./Dashboard";
import "./index.css";

export default function App() {
  const [admin, setAdmin] = useState(() => {
    const name = sessionStorage.getItem("adminName");
    const id   = sessionStorage.getItem("adminId");
    if (name && id) return { name, id };
    return null;
  });

  return admin ? (
    <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
  ) : (
    <Login onLogin={(info) => setAdmin(info)} />
  );
}