import { useEffect, useState } from "react";
import {
  getSummaryByCategory,
  getSummaryByMonth,
  getTopVendors,
  listTransactions,
} from "../services/api";
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
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#14B8A6"];

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const tx = await listTransactions();
        const cat = await getSummaryByCategory();
        const mon = await getSummaryByMonth();
        const ven = await getTopVendors();

        const safeTx = Array.isArray(tx) ? tx : [];
        setTransactions(safeTx);

        // Safe reduce with full guard
        const sum = safeTx.reduce((acc, t) => {
          const val = Number(t?.amount);
          return acc + (Number.isFinite(val) ? val : 0);
        }, 0);
        setTotal(sum);

        setCategoryData(Array.isArray(cat) ? cat : []);
        setMonthData(Array.isArray(mon) ? mon : []);
        setVendors(Array.isArray(ven) ? ven : []);
      } catch (err) {
        console.error("Error loading overview data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Summary</h1>
        <p className="text-gray-500">Quick overview of your spending</p>
        <hr className="mt-2" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl text-xl">💰</div>
          <div>
            <h3 className="text-sm text-gray-500">Total</h3>
            <p className="text-2xl font-bold">
              €{Number.isFinite(total) ? total.toFixed(2) : "0.00"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl text-xl">📊</div>
          <div>
            <h3 className="text-sm text-gray-500">Top Category</h3>
            <p className="text-2xl font-bold">
              {categoryData?.length ? categoryData[0].category : "—"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl text-xl">🛒</div>
          <div>
            <h3 className="text-sm text-gray-500">Top Vendor</h3>
            <p className="text-2xl font-bold">
              {vendors?.length ? vendors[0].vendor : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-80">
          <h3 className="text-lg font-semibold mb-4">By Category</h3>
          {categoryData?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total"
                  nameKey="category"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 mt-16">
              No category data 🚀
            </div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm h-80">
          <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
          {monthData?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 mt-16">
              No monthly trend 🚀
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {transactions?.length ? (
          <ul className="divide-y divide-gray-200">
            {transactions.slice(0, 5).map((tx, idx) => {
              const amt = Number(tx?.amount);
              return (
                <li key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      {tx?.category || "Unknown"} → {tx?.item || "—"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx?.date ? new Date(tx.date).toLocaleDateString() : ""}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                    €{Number.isFinite(amt) ? amt.toFixed(2) : "0.00"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center text-gray-500">No transactions yet 🚀</div>
        )}
      </div>
    </div>
  );
}
