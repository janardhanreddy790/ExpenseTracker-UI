import { useEffect, useState } from "react";
import {
  listTransactions,
  getSummaryByCategory,
  getTopVendors,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Wallet, Store } from "lucide-react";

// 🎨 Category color mapping
const categoryColors = {
  "Groceries & Essentials": "bg-green-100 text-green-800",
  "Household & Utilities": "bg-yellow-100 text-yellow-800",
  "Shopping & Lifestyle": "bg-pink-100 text-pink-800",
  "Travel & Transport": "bg-blue-100 text-blue-800",
  "Health & Medical": "bg-red-100 text-red-800",
  "Bills & Subscriptions": "bg-purple-100 text-purple-800",
  "Entertainment & Leisure": "bg-orange-100 text-orange-800",
  "Financial & Services": "bg-gray-200 text-gray-800",
  "Gifts, Festivals & Social": "bg-indigo-100 text-indigo-800",
  "Loans": "bg-slate-200 text-slate-800",
  "Other / Miscellaneous": "bg-gray-100 text-gray-800",
};

export default function Summary() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [topCategory, setTopCategory] = useState(null);
  const [topVendor, setTopVendor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await listTransactions();
      if (Array.isArray(data)) {
        setTransactions(data.slice(-5).reverse());
        setTotal(
          data.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
        );
      }

      const cat = await getSummaryByCategory();
      if (Array.isArray(cat) && cat.length) {
        setTopCategory(cat[0].category || cat[0][0]);
      }

      const vend = await getTopVendors();
      if (Array.isArray(vend) && vend.length) {
        setTopVendor(vend[0].vendor || vend[0][0]);
      }
    }

    load().catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Summary</h1>
      <p className="text-gray-600">Quick overview of your spending.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <Wallet className="text-indigo-600 w-8 h-8" />
          <div>
            <h2 className="font-semibold text-gray-700">Total</h2>
            <p className="text-xl font-bold text-gray-900">
              €{total.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <ShoppingCart className="text-green-600 w-8 h-8" />
          <div>
            <h2 className="font-semibold text-gray-700">Top Category</h2>
            <p className="text-xl font-bold text-gray-900">
              {topCategory || "---"}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
          <Store className="text-yellow-600 w-8 h-8" />
          <div>
            <h2 className="font-semibold text-gray-700">Top Vendor</h2>
            <p className="text-xl font-bold text-gray-900">
              {topVendor || "---"}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="font-semibold text-gray-700 mb-4">
          Recent Transactions
        </h2>
        {transactions.length ? (
          <ul className="divide-y divide-gray-200">
            {transactions.map((t) => {
              const color =
                categoryColors[t.category] ||
                "bg-gray-100 text-gray-800";
              return (
                <li
                  key={t.id}
                  className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition"
                >
                  <div>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${color}`}
                    >
                      {t.category}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {t.item}
                    </p>
                    {t.vendor && (
                      <p className="text-xs text-gray-500">
                        {t.vendor}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    €{t.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No transactions</p>
        )}
        <button
          onClick={() => navigate("/transactions")}
          className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
        >
          View all transactions →
        </button>
      </div>
    </div>
  );
}
