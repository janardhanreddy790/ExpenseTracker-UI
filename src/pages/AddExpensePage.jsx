import { useState, useEffect } from "react";
import { createTransaction, getReferenceData } from "../services/api";
import { toast } from "react-toastify";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export default function AddExpensePage() {
  const [refData, setRefData] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "",
    subcategory: "",
    item: "",
    amount: "",
    vendor: "",
    paymentMethod: "",
    unit: "pcs",
    owner: "Janardhan",
    notes: "",
  });

  useEffect(() => {
    getReferenceData().then(setRefData).catch(console.error);
  }, []);

  // 🔎 Search handler
  function handleSearchChange(value) {
    setSearch(value);
    if (!refData || !value.trim()) {
      setSuggestions([]);
      return;
    }

    const lower = value.toLowerCase();
    const matches = [];

    Object.entries(refData.itemsBySubcategory).forEach(([subcategory, items]) => {
      items.forEach((item) => {
        if (item.toLowerCase().includes(lower)) {
          matches.push({ subcategory, item });
        }
      });
    });

    setSuggestions(matches);
  }

  // ✅ Select item (auto or fallback)
  function handleSelectItem(value) {
    let found = false;

    if (refData) {
      for (const [subcategory, items] of Object.entries(refData.itemsBySubcategory)) {
        if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
          const category = Object.keys(refData.categories).find((cat) =>
            refData.categories[cat].includes(subcategory)
          );

          setForm((prev) => ({
            ...prev,
            category,
            subcategory,
            item: value, // exact matched item
          }));
          found = true;
          break;
        }
      }
    }

    if (!found) {
      setForm((prev) => ({
        ...prev,
        category: "Other / Miscellaneous",
        subcategory: "Other",
        item: value, // 👈 preserve user input if not found
      }));
    }

    setSearch("");
    setSuggestions([]);
  }

  // 📝 Generic field handler
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // 🚀 Submit
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createTransaction(form);
      toast.success("Expense added!");
      setForm((prev) => ({
        ...prev,
        amount: "",
        vendor: "",
        notes: "",
        item: "",
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">Add Expense</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            {/* 🔎 Item Search */}
            <div>
              <label className="block text-sm font-medium mb-1">Search Item</label>
              <Input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type to search or add new..."
              />
              {suggestions.length > 0 && (
                <ul className="border rounded bg-white shadow mt-1 max-h-40 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectItem(s.item)}
                    >
                      {s.item} <span className="text-gray-500">({s.subcategory})</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* If nothing found, allow direct entry */}
              {search && suggestions.length === 0 && (
                <div
                  className="px-3 py-2 border rounded bg-gray-50 mt-1 cursor-pointer"
                  onClick={() => handleSelectItem(search)}
                >
                  Add "{search}" as new item
                </div>
              )}
            </div>

            {/* Auto-selected fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input value={form.category} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subcategory</label>
                <Input value={form.subcategory} disabled />
              </div>
            </div>

            {/* Item */}
            <div>
              <label className="block text-sm font-medium mb-1">Item</label>
              <Input
                value={form.item}
                onChange={(e) => handleChange("item", e.target.value)}
                placeholder="Enter item name"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">Amount (€)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <Input
                value={form.vendor}
                onChange={(e) => handleChange("vendor", e.target.value)}
                placeholder="Vendor / Shop"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">Select</option>
                {refData?.paymentMethods?.map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Optional notes..."
              />
            </div>

            <Button type="submit" className="w-full">
              Add Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
