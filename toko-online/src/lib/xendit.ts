// Wrapper tipis untuk Xendit Payment Request API (QRIS).
// Dokumentasi: https://developers.xendit.co/api-reference/#payment-requests

const XENDIT_API_BASE = "https://api.xendit.co";

function authHeader() {
  const secret = process.env.XENDIT_SECRET_KEY;
  if (!secret) throw new Error("XENDIT_SECRET_KEY belum diset di .env");
  // Xendit pakai HTTP Basic Auth: secret key sebagai username, password kosong
  const encoded = Buffer.from(`${secret}:`).toString("base64");
  return `Basic ${encoded}`;
}

export type CreateQrisResult = {
  id: string;
  referenceId: string;
  qrString: string;
  status: string;
  expiresAt: string | null;
};

/**
 * Membuat permintaan pembayaran QRIS ke Xendit.
 * amount dalam Rupiah (integer, tanpa desimal).
 * referenceId sebaiknya = orderNumber di sistem kita, supaya gampang dicocokkan saat webhook masuk.
 */
export async function createQrisPaymentRequest(params: {
  amount: number;
  referenceId: string;
  orderId: string;
}): Promise<CreateQrisResult> {
  const res = await fetch(`${XENDIT_API_BASE}/payment_requests`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference_id: params.referenceId,
      currency: "IDR",
      amount: params.amount,
      payment_method: {
        type: "QR_CODE",
        reusability: "ONE_TIME_USE",
        qr_code: {
          channel_code: "QRIS",
        },
      },
      metadata: {
        order_id: params.orderId,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Gagal membuat pembayaran QRIS di Xendit: ${data?.message || res.statusText}`
    );
  }

  const qrString =
    data?.payment_method?.qr_code?.qr_string ??
    data?.payment_method?.qrCode?.qrString ??
    "";

  return {
    id: data.id,
    referenceId: data.reference_id,
    qrString,
    status: data.status,
    expiresAt: data?.payment_method?.qr_code?.expires_at ?? null,
  };
}

/**
 * Verifikasi bahwa webhook benar-benar datang dari Xendit,
 * dengan mencocokkan header 'x-callback-token' dengan token di dashboard Xendit.
 * JANGAN skip langkah ini di production — tanpa ini, siapa saja bisa
 * memalsukan notifikasi "pembayaran berhasil" ke endpoint webhook Anda.
 */
export function verifyXenditWebhookToken(headerToken: string | null): boolean {
  const expected = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expected || !headerToken) return false;
  return headerToken === expected;
}
