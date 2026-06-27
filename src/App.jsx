import { useState, useEffect } from "react";
import Login from "./login";
import Dashboard from "./Dashboard";
import "./index.css";
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <Dashboard />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}