"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal login");
      setLoading(false);
      return;
    }

    // Menggunakan window.location.href memaksa browser melakukan refresh total
    // agar layout.tsx membaca cookie terbaru dari server
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="card p-8 w-full max-w-sm">
        <h1 className="text-headline-md text-primary mb-1">Merchant Center</h1>
        <p className="text-body-sm text-ink-muted mb-stack-lg">Masuk untuk mengelola toko Anda.</p>
        
        <div className="mb-stack-md">
          <label className="block text-label-sm text-ink-muted mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <div className="mb-stack-lg">
          <label className="block text-label-sm text-ink-muted mb-1">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-4 py-2.5 bg-surface-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {error && <p className="text-danger text-body-sm mb-stack-md">{error}</p>}
        
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
