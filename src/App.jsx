import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Summary from "./pages/Summary";
import Transactions from "./pages/Transactions";
import AddExpensePage from "./pages/AddExpensePage";
import Analytics from "./pages/Analytics";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const linkClass = "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const activeClass = "bg-white text-indigo-600 shadow";
  const inactiveClass = "text-white hover:bg-indigo-500/70";

  return (
    <Router>
      {/* Navigation bar */}
      <nav className="bg-indigo-600 p-4 flex gap-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Summary
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Transactions
        </NavLink>
        <NavLink
          to="/add-expense"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : inactiveClass}`
          }
        >
          Add Expense
        </NavLink>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Summary />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add-expense" element={<AddExpensePage />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>

      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}
