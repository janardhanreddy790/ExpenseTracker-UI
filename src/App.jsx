import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import Transactions from "./pages/Transactions";
import AddExpensePage from "./pages/AddExpensePage";

export default function App() {
  const linkClass = "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const activeClass = "bg-white text-indigo-600 shadow";
  const inactiveClass = "text-white hover:bg-indigo-500/70";

  return (
    <Router>
      <nav className="bg-indigo-600 p-4 flex gap-4">
        <NavLink to="/" end className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}>Summary</NavLink>
        <NavLink to="/overview" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}>Analytics</NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}>Transactions</NavLink>
        <NavLink to="/add" className={({ isActive }) => `${linkClass} ${isActive ? activeClass : inactiveClass}`}>Add Expense</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add" element={<AddExpensePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
