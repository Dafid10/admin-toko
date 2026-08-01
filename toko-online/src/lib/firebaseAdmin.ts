// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Cek apakah aplikasi admin sudah terinisialisasi agar tidak error (runtime check)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Kita perlu menyertakan replace('\\n', '\n') agar format private key tersimpan benar di env
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: "isi-nama-bucket-kamu.appspot.com" // Ganti ini!
  });
}

export const adminStorage = admin.storage().bucket();