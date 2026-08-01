"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="flex items-center gap-3 text-ink-muted hover:text-danger px-4 py-3 rounded-xl hover:bg-surface-highest transition-all text-label-md w-full"
    >
      <span className="material-symbols-outlined">logout</span>
      Keluar
    </button>
  );
}
