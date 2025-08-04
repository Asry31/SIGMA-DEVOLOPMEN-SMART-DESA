import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// =================================================================================
// TODO: GANTI DENGAN KONFIGURASI PROYEK FIREBASE ANDA
// Anda bisa mendapatkan konfigurasi ini dari Firebase Console:
// Buka Project Settings > General > Your apps > Web app > Firebase SDK snippet > Config
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAJibatMDC9psUyIY7j7_Px08cFxtpW3z4",
  authDomain: "sigma-development-smart-desa.firebaseapp.com",
  projectId: "sigma-development-smart-desa",
  storageBucket: "sigma-development-smart-desa.appspot.com",
  messagingSenderId: "719290297683",
  appId: "1:719290297683:web:665496fa13dcd4a26f85a6",
  measurementId: "G-SESCKNJ99J"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Ekspor layanan Firebase yang akan digunakan
export const auth = firebase.auth();
export const db = firebase.firestore();