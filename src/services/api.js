// Real API connector for Spring Boot backend
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function http(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return {};
}

export function listTransactions() {
  return http("/api/transactions");
}

export function createTransaction(tx) {
  return http("/api/transactions", { method: "POST", body: tx });
}

export function deleteTransaction(id) {
  return http(`/api/transactions/${id}`, { method: "DELETE" });
}

export function getSummaryByCategory() {
  return http("/api/transactions/summary/by-category");
}

export function getSummaryByMonth() {
  return http("/api/transactions/summary/by-month");
}

export function getTopItems() {
  return http("/api/transactions/summary/top-items");
}

export function getTopVendors() {
  return http("/api/transactions/summary/top-vendors");
}

export function getReferenceData() {
  return http("/api/reference-data");
}
