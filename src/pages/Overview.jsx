import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
} from "recharts";

export default function Overview() {
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [topVendors, setTopVendors] = useState([]);

  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


  useEffect(() => {
    // Fetch transactions to calculate total
    fetch(`${BASE}/api/transactions`)
      .then((res) => res.json())
      .then((data) => {
        const totalAmount = data.reduce((sum, tx) => sum + tx.amount, 0);
        setTotal(totalAmount);
      });

    // Fetch summaries
    fetch(`${BASE}/api/transactions/summary/by-category`)
      .then((res) => res.json())
      .then((data) =>
        setCategoryData(data.map(([name, value]) => ({ name, value })))
      );

    fetch(`${BASE}/api/transactions/summary/by-month`)
      .then((res) => res.json())
      .then((data) =>
        setMonthlyData(data.map(([month, total]) => ({ month, total })))
      );

    fetch(`${BASE}/api/transactions/summary/top-items`)
      .then((res) => res.json())
      .then((data) =>
        setTopItems(data.map(([item, total]) => ({ item, total })))
      );

    fetch(`${BASE}/api/transactions/summary/top-vendors`)
      .then((res) => res.json())
      .then((data) =>
        setTopVendors(data.map(([vendor, total]) => ({ vendor, total })))
      );
  }, [BASE]);

  const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#14B8A6"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-600">€{total.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart by Category */}
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
          {categoryData.length > 0 ? (
            <PieChart width={400} height={300}>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100}>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>

        {/* Bar Chart by Month */}
        <div className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Monthly Expenses</h2>
          {monthlyData.length > 0 ? (
            <BarChart width={500} height={300} data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#6366F1" />
            </BarChart>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Top Items & Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Items</h2>
          <ul className="space-y-2">
            {topItems.map((i) => (
              <li key={i.item} className="flex justify-between">
                <span>{i.item}</span>
                <span>€{i.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Top Vendors</h2>
          <ul className="space-y-2">
            {topVendors.map((v) => (
              <li key={v.vendor} className="flex justify-between">
                <span>{v.vendor}</span>
                <span>€{v.total.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
