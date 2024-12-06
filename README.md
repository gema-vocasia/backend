# GEMA Backend  

**GEMA** (Gerakan Empati dan Kebaikan) adalah sebuah platform untuk mendukung kegiatan donasi dengan backend yang dibangun menggunakan Node.js dan Express. Proyek ini mengelola data pengguna, donasi, dan autentikasi untuk website donasi GEMA.  

## Teknologi yang Digunakan  
- **Node.js**  
- **Express**  
- **MongoDB (dengan Mongoose)**  
- **JWT (JSON Web Token)**  
- **bcrypt.js**  
- **dotenv**  

## Struktur Direktori  

```plaintext
backend/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
├── .env
├── .gitignore
├── package.json
├── README.md
└── server.js
```
## Instalasi

### Prasyarat
- Pastikan Anda sudah menginstal Node.js dan npm di sistem Anda.
- MongoDB sebagai database, dapat di-host secara lokal atau menggunakan layanan cloud seperti MongoDB Atlas.

#### 1. Clone repository
```plaintext
git clone https://github.com/gema-vocasia/backend.git
cd backend
```

#### 2. Install depedency
```plaintext
npm install
```

#### 3. Konfigurasi file **.env**
```plaintext
PORT=8080
MONGODB_URI=<URL_MONGODB_ANDA>
JWT_SECRET=<SECRET_KEY_ANDA>
JWT_EXPIRES_IN=24h
```
bisa generate di **random string generator**

### 4. Jalankan server
```plaintext
npm run dev
```
