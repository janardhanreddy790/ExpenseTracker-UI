import { useEffect, useState } from "react";
import { listTransactions, getSummaryByCategory, getTopVendors } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
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
        setTotal(data.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0));
      }
      const cat = await getSummaryByCategory();
      if (Array.isArray(cat) && cat.length) setTopCategory(cat[0][0]);
      const vend = await getTopVendors();
      if (Array.isArray(vend) && vend.length) setTopVendor(vend[0][0]);
    }
    load().catch(console.error);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Summary</h1>
      <p className="text-gray-600">Quick overview of your spending.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow"><h2>Total</h2><p>€{total.toFixed(2)}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow"><h2>Top Category</h2><p>{topCategory||"---"}</p></div>
        <div className="bg-white p-6 rounded-2xl shadow"><h2>Top Vendor</h2><p>{topVendor||"---"}</p></div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2>Recent Transactions</h2>
        {transactions.length? <ul>{transactions.map((t)=><li key={t.id}>{t.category} → {t.item} : €{t.amount}</li>)}</ul>:<p>No transactions</p>}
      </div>
    </div>
  );
}
