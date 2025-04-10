import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Configuração do Firebase para seu app
const firebaseConfig = {
  apiKey: "AIzaSyAehpM3_izn93YGJpdozIZjHtMH0btw8Iw",
  authDomain: "cerberusdb-2620a.firebaseapp.com",
  projectId: "cerberusdb-2620a", // ← Este campo é essencial!
  storageBucket: "cerberusdb-2620a.appspot.com",
  messagingSenderId: "807962592023",
  appId: "1:807962592023:web:d7463997e1176361e5ed52",
  measurementId: "G-QSWZC0V65C"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
