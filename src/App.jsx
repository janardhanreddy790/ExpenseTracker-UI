import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddExpensePage from "./pages/AddExpensePage";
import Overview from "./pages/Overview";

console.log("✅ Loaded App.jsx with Router + Transactions API");

export default function App() {
  const linkClass =
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const activeClass = "bg-white text-indigo-600 shadow";
  const inactiveClass = "text-white hover:bg-indigo-500/70";

  return (
    <Router>
      {/* Navigation */}
      <nav className="bg-indigo-600 p-4 flex gap-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Overview
        </NavLink>
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Add Transaction
        </NavLink>
      </nav>

      {/* Routes */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddExpensePage />} />
          <Route path="/overview" element={<Overview />} />
        </Routes>
      </div>
    </Router>
  );
}
