import { useEffect, useState } from "react";
import { listTransactions, deleteTransaction } from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const vendorFilter = params.get("vendor");
  const itemFilter = params.get("item");
  const categoryFilter = params.get("category");
  const monthFilter = params.get("month"); // YYYY-MM

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await listTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ open: true, message, type });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(
      () => setToast((t) => ({ ...t, open: false })),
      2500
    );
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      // Optimistic removal
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await deleteTransaction(id);
      await loadData();
      showToast("✅ Transaction deleted", "success");
    } catch (err) {
      showToast("❌ Failed to delete: " + err.message, "error");
      await loadData(); // fallback refresh
    } finally {
      setDeletingId(null);
    }
  }

  // 🔹 Apply filters
  const filteredTransactions = transactions.filter((t) => {
    if (vendorFilter && t.vendor !== vendorFilter) return false;
    if (itemFilter && t.item !== itemFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (monthFilter && !t.date.startsWith(monthFilter)) return false;
    return true;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-indigo-600">Transactions</h2>
      <p className="mt-2 text-gray-700">Full list of expenses 📋</p>

      {/* Active Filters */}
      {(vendorFilter || itemFilter || categoryFilter || monthFilter) && (
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600">Active filter:</span>
          {vendorFilter && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
              Vendor: {vendorFilter}
            </span>
          )}
          {itemFilter && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
              Item: {itemFilter}
            </span>
          )}
          {categoryFilter && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
              Category: {categoryFilter}
            </span>
          )}
          {monthFilter && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
              Month: {monthFilter}
            </span>
          )}
          <button
            onClick={() => navigate("/transactions")}
            className="ml-2 px-3 py-1.5 text-sm bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      )}

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <ul className="mt-4 divide-y divide-gray-200 bg-white rounded-xl shadow-sm">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <li key={tx.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{tx.category} → {tx.item}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.date).toLocaleDateString()} | {tx.owner} | {tx.vendor}
                  </div>
                  <div className="text-xs text-gray-400">{tx.notes}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold">
                    {tx.currency} {tx.amount?.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      deletingId === tx.id
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    {deletingId === tx.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-gray-500 text-center">No transactions found</li>
          )}
        </ul>
      )}

      {/* Toast Notification */}
      {toast.open && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
