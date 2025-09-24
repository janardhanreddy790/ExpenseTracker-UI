import { useEffect, useState } from "react";
import { listTransactions, deleteTransaction } from "../services/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      // ✅ Optimistic removal
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      // Call backend
      await deleteTransaction(id);

      // ✅ Reload fresh list
      await loadData();

      showToast("✅ Transaction deleted", "success");
    } catch (err) {
      showToast("❌ Failed to delete: " + err.message, "error");
      await loadData(); // fallback resync
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600">Dashboard</h2>
      <p className="mt-2 text-gray-700">Recent transactions 📊</p>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <ul className="mt-4 divide-y divide-gray-200 bg-white rounded-xl shadow-sm">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  {tx.category} → {tx.item}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.date).toLocaleDateString()} | {tx.owner} |{" "}
                  {tx.vendor}
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
          ))}
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
