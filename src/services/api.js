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

// ----------------- Transactions -----------------
export function listTransactions() {
  return http("/api/transactions");
}

export function createTransaction(tx) {
  return http("/api/transactions", { method: "POST", body: tx });
}

export function deleteTransaction(id) {
  return http(`/api/transactions/${id}`, { method: "DELETE" });
}

export async function getPagedTransactions(
  page = 0,
  size = 10,
  sortBy = "date",
  sortDir = "desc"
) {
  return http(
    `/api/transactions/paged?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
  );
}

export async function updateTransaction(id, data) {
  return http(`/api/transactions/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteBulk(ids) {
  return http(`/api/transactions/bulk`, {
    method: "DELETE",
    body: ids,
  });
}

// ----------------- Reference Data -----------------
export function getReferenceData() {
  return http("/api/reference-data");
}

// ----------------- Analytics / Summary -----------------
export function getSummaryByCategory() {
  return http("/api/analytics/categories");
}

// ❌ Temporarily disabled until backend is fixed
// export function getSummaryByMonth() {
//   return http("/api/analytics/months");
// }

export function getTopItems() {
  return http("/api/analytics/items");
}

export function getTopVendors() {
  return http("/api/analytics/vendors");
}
