import { useState } from "react";
import Login from "./login";
import Dashboard from "./Dashboard";
import "./index.css";

export default function App() {
  const [admin, setAdmin] = useState(null); // { name, id } หรือ null

  return admin ? (
    <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
  ) : (
    <Login onLogin={(info) => setAdmin(info)} />
  );
}