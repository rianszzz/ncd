# NCD Web Engineering Standards & Architecture Checklist

Dokumen ini mendokumentasikan standar arsitektur perangkat lunak, keamanan, kualitas kode, dan pertimbangan desain sistem yang harus diperhatikan pada setiap pembuatan modul atau proyek web baru.

---

## 1. Prinsip Anti-Overengineering (YAGNI & Prudence)

### A. Evaluasi Kebutuhan Redis
- **Prinsip**: Jangan memasang Redis pada fase awal jika kebutuhan masih dapat diselesaikan secara *stateless* atau *native in-memory*.
- **Solusi Standar**:
  - **Autentikasi**: Gunakan Stateless JWT (`golang-jwt/jwt/v5`). Verifikasi token menggunakan secret HMAC di memori tanpa perlu query DB/Redis di setiap request.
  - **Rate Limiting**: Gunakan native in-memory token bucket ([security.go](file:///Users/rian/Documents/NCD/backend/internal/middleware/security.go)) atau edge WAF.
  - **Caching Data Publik**: Manfaatkan HTTP Cache Headers (`Cache-Control: public, max-age=60, stale-while-revalidate=120`) dan CDN edge caching.
- **Kapan Redis Baru Diperlukan**:
  - Asynchronous background job queue yang berat (misal antrean convert video, bulk email blast ribuan pengguna via broker `asynq`).
  - Sistem real-time WebSockets multi-server yang membutuhkan Redis Pub/Sub.
  - Skala traffic mencapai ratusan ribu RPS di mana query PostgreSQL mulai mengalami bottleneck.

### B. Evaluasi Database Sharding
- **Prinsip**: Hindari database sharding secara prematur. Sharding memecah integritas relasional, merusak operasi SQL JOIN, dan mempersulit transaksi ACID.
- **Solusi Standar**:
  - **B-Tree Indexes**: Tambahkan composite/single index pada kolom `WHERE`, `ORDER BY`, dan `JOIN` ([db.go](file:///Users/rian/Documents/NCD/backend/internal/handler/db.go#L101-L113)).
  - **Connection Pooling**: Gunakan PgBouncer transaction mode pooler ([main.go](file:///Users/rian/Documents/NCD/backend/cmd/api/main.go#L32-L48)).
  - **Standardized Pagination**: Batasi query menggunakan pagination ([pagination.go](file:///Users/rian/Documents/NCD/backend/internal/pagination/pagination.go)).
- **Kapan Sharding Baru Diperlukan**:
  - Ukuran data mencapai ratusan gigabyte / terabyte dengan jutaan transaksi harian yang melampaui kapasitas fisik node server tunggal.

---

## 2. Clean Architecture & Anti-Entanglement (Untangling Codebase)

1. **Centralized Storage Engine**:
   - Jangan menduplikasi path fallback (`os.Stat` 4 cabang) atau serialization boilerplate (`json.MarshalIndent`, `os.WriteFile`) di banyak file handler.
   - Gunakan paket terpusat generic: [internal/storage](file:///Users/rian/Documents/NCD/backend/internal/storage/storage.go) (`ResolveDataPath`, `LoadJSON[T]`, `SaveJSON[T]`).

2. **Standardized Pagination**:
   - Jangan menulis ulang logika `strconv.Atoi(page)`, clamping limit, dan penulisan header `X-Total-Count` di setiap endpoint.
   - Gunakan paket terpusat generic: [internal/pagination](file:///Users/rian/Documents/NCD/backend/internal/pagination/pagination.go) (`Parse`, `Slice[T]`, `SetHeaders`).

3. **Frontend Auth Normalization**:
   - Dilarang menyebar string literal mentah seperti `localStorage.getItem('ncd_jwt')` di komponen UI.
   - Sentralisasikan semua akses session di service layer: [api.ts](file:///Users/rian/Documents/NCD/frontend/src/services/api.ts) (`getAuthToken`, `getAuthUser`, `setAuthSession`, `clearAuthSession`, `isAuthenticated`).

---

## 3. Keamanan & Defensive Coding (Vibe Security Standard)

1. **Input Sanitization & Open Redirect**:
   - Validasi parameter URL redirect pasca-login secara ketat di [Login.tsx](file:///Users/rian/Documents/NCD/frontend/src/pages/Login.tsx):  
     `redirect.startsWith('/') && !redirect.startsWith('//')`. Cegah phishing redirect ke domain penyerang.
2. **Error Masking pada Public Healthcheck**:
   - Jangan pernah mengekspos raw error database (`err.Error()`) ke publik melalui endpoint `/health` ([health.go](file:///Users/rian/Documents/NCD/backend/internal/handler/health.go)). Gunakan status umum `"unreachable"`.
3. **CORS & CSRF Environment Isolation**:
   - Origin `localhost` dan port development lokal **HANYA** boleh diizinkan jika `cfg.Environment != "production"` ([main.go](file:///Users/rian/Documents/NCD/backend/cmd/api/main.go) dan [security.go](file:///Users/rian/Documents/NCD/backend/internal/middleware/security.go)).
4. **Security Headers Wajib**:
   - Pasang CSP, HSTS, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy, dan Permissions-Policy.

---

## 4. Pengujian & Higienitas Kode (Test & Code Hygiene)

1. **Isolasi & Idempotensi Pengujian**:
   - Pengujian unit dan integrasi tidak boleh mengotori file database/JSON data.
   - Gunakan `t.Cleanup` untuk rollback state memori ([learning_session_test.go](file:///Users/rian/Documents/NCD/backend/internal/handler/learning_session_test.go), [finance_test.go](file:///Users/rian/Documents/NCD/backend/internal/handler/finance_test.go)).
   - Hindari penggunaan goroutine `time.Sleep` di dalam fungsi `init()`; inisialisasi package harus sinkron dan deterministik.
2. **Dead Code Elimination**:
   - Hapus fungsi, komponen skeleton, dan tipe interface yang tidak pernah dipanggil (`go deadcode`, AST scanner).
3. **Higienitas Komentar**:
   - Hapus komentar AI yang hanya mengulang kode (*restating comments*).
   - Pertahankan komentar alasan arsitektural (*rationale comments*, Maker-Checker segregation of duties, monotonic sequence number guarantee).

---

## 5. Day-1 CI/CD Pipeline

Setiap repositori baru wajib memiliki pipeline GitHub Actions sejak awal: [.github/workflows/ci.yml](file:///Users/rian/Documents/NCD/.github/workflows/ci.yml):
- **Backend Job**: Setup Go runtime, download dependencies ter-cache, jalankan `go test -v ./...`, dan verifikasi kompilasi build `go build ./cmd/api`.
- **Frontend Job**: Setup Node runtime, instalasi `npm ci` ter-cache, typecheck dan build bundle `npm run build`.
- **Concurrency Control**: Batalkan eksekusi workflow lama saat ada push baru (`cancel-in-progress: true`).
