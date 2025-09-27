import { useState, useEffect } from "react";
import { createTransaction, getReferenceData } from "../services/api";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddExpensePage() {
  const [refData, setRefData] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Uncategorized",
    subCategory: "Other",
    item: "",
    amount: "",
    paymentMethod: "Cash",
    owner: "Janardhan",
    notes: "",
  });

  // Load reference data
  useEffect(() => {
    async function loadData() {
      const data = await getReferenceData();
      setRefData(data);
    }
    loadData();
  }, []);

  // Handle search suggestions
  useEffect(() => {
    if (!search || !refData) {
      setSuggestions([]);
      return;
    }

    const matches = [];
    Object.entries(refData.categories || {}).forEach(([cat, subs]) => {
      subs.forEach((sub) => {
        (refData.itemsBySubcategory?.[sub] || []).forEach((item) => {
          if (item.toLowerCase().includes(search.toLowerCase())) {
            matches.push({ category: cat, subCategory: sub, item });
          }
        });
      });
    });

    setSuggestions(matches.slice(0, 8)); // show top 8 matches
  }, [search, refData]);

  // Select item from search
  const handleSelectItem = (s) => {
    setForm((prev) => ({
      ...prev,
      category: s.category,
      subCategory: s.subCategory,
      item: s.item,
    }));
    setSearch(s.item);
    setSuggestions([]);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalForm = {
      ...form,
      item: form.item || search,
      category: form.category || "Uncategorized",
      subCategory: form.subCategory || "Other",
    };

    try {
      await createTransaction(finalForm);
      toast.success("✅ Expense saved!");
      setForm({
        date: new Date().toISOString().split("T")[0],
        category: "Uncategorized",
        subCategory: "Other",
        item: "",
        amount: "",
        paymentMethod: "Cash",
        owner: "Janardhan",
        notes: "",
      });
      setSearch("");
    } catch (err) {
      toast.error("❌ Failed to save expense");
    }
  };

  return (
    <div className="flex justify-center p-6">
      <Card className="w-full max-w-xl shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-xl font-bold text-indigo-600 mb-2">
            ➕ Add New Expense
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Search Item */}
            <div className="relative">
              <label className="text-sm font-medium">Search Item</label>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setForm((prev) => ({ ...prev, item: e.target.value }));
                }}
                placeholder="Type item name (e.g. milk, rice, taxi)..."
              />
              {suggestions.length > 0 && (
                <ul className="border rounded-lg mt-1 bg-white shadow absolute z-10 w-full max-w-xl">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectItem(s)}
                      className="px-3 py-2 cursor-pointer hover:bg-indigo-100"
                    >
                      {s.item}{" "}
                      <span className="text-xs text-gray-500">
                        ({s.category} → {s.subCategory})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Auto-filled Category Info */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Category</label>
                <Input value={form.category} readOnly />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Subcategory</label>
                <Input value={form.subCategory} readOnly />
              </div>
            </div>

            {/* Date & Amount */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Payment & Owner */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-2"
                >
                  {(refData?.paymentMethods || ["Cash", "Card", "UPI"]).map(
                    (pm, i) => (
                      <option key={i} value={pm}>
                        {pm}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Owner</label>
                <select
                  name="owner"
                  value={form.owner}
                  onChange={handleChange}
                  className="w-full border rounded-md px-2 py-2"
                >
                  {(refData?.owners || ["Me", "Sindhu"]).map((o, i) => (
                    <option key={i} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Eg: Bought at Rewe, Uber ride to airport..."
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full mt-4">
              Save Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
