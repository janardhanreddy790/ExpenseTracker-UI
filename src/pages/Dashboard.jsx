import { useEffect, useState } from "react";
import { listTransactions } from "../services/api";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    listTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-indigo-600">Dashboard</h2>
      <p className="mt-2 text-gray-700">Recent transactions 📊</p>

      {loading && <p className="mt-4 text-gray-500">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {!loading && !error && (
        <ul className="mt-4 divide-y divide-gray-200 bg-white rounded-xl shadow-sm">
          {transactions.map((tx) => (
            <li key={tx.id} className="p-4 flex justify-between">
              <div>
                <div className="font-medium">{tx.category} → {tx.item}</div>
                <div className="text-xs text-gray-500">
                  {new Date(tx.date).toLocaleDateString()} | {tx.owner} | {tx.vendor}
                </div>
                <div className="text-xs text-gray-400">{tx.notes}</div>
              </div>
              <div className="font-semibold">
                {tx.currency} {tx.amount?.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
