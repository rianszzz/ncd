package seed

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func Run(ctx context.Context, pool *pgxpool.Pool) error {
	var count int
	err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM positions").Scan(&count)
	if err != nil {
		return fmt.Errorf("gagal memeriksa tabel positions: %w", err)
	}

	if count > 0 {
		log.Println("[SEED] Database sudah memiliki data, melewati initial seed.")
		return nil
	}

	log.Println("[SEED] Menjalankan initial seed database NCD...")

	hash, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	hashedPwd := string(hash)

	// 1. Insert Positions
	queryPositions := `
	INSERT INTO positions (id, title, level, order_priority) VALUES
		('a0000000-0000-0000-0000-000000000001', 'Chairman', 1, 1),
		('a0000000-0000-0000-0000-000000000002', 'Vice Chairman I', 1, 2),
		('a0000000-0000-0000-0000-000000000003', 'Vice Chairman II', 1, 3),
		('a0000000-0000-0000-0000-000000000004', 'Developer Lead', 1, 4),
		('a0000000-0000-0000-0000-000000000005', 'Sekretaris I', 2, 5),
		('a0000000-0000-0000-0000-000000000006', 'Sekretaris II', 2, 6),
		('a0000000-0000-0000-0000-000000000007', 'Bendahara I', 2, 7),
		('a0000000-0000-0000-0000-000000000008', 'Bendahara II', 2, 8);
	`
	if _, err := pool.Exec(ctx, queryPositions); err != nil {
		return fmt.Errorf("seed positions: %w", err)
	}

	// 2. Insert Core Users
	queryUsers := fmt.Sprintf(`
	INSERT INTO users (id, email, password_hash, role, is_active) VALUES
		('b0000000-0000-0000-0000-000000000001', 'admin@ncd.dev', '%s', 'GOD_ADMIN', true),
		('b0000000-0000-0000-0000-000000000002', 'bendahara1@ncd.dev', '%s', 'BENDAHARA_I', true),
		('b0000000-0000-0000-0000-000000000003', 'bendahara2@ncd.dev', '%s', 'BENDAHARA_II', true),
		('b0000000-0000-0000-0000-000000000004', 'rian@ncd.dev', '%s', 'SUPER_ADMIN', true);
	`, hashedPwd, hashedPwd, hashedPwd, hashedPwd)
	if _, err := pool.Exec(ctx, queryUsers); err != nil {
		return fmt.Errorf("seed users: %w", err)
	}

	// 3. Insert Members
	queryMembers := `
	INSERT INTO members (id, user_id, full_name, nickname, generation, major, university, position_id, division, skills, bio, linkedin_url, github_url, show_in_public, status) VALUES
		('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Rianszzz', 'Rian', 'Angkatan 2023', 'Informatika', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000004', 'Engineering & Infrastructure', ARRAY['Go', 'React', 'PostgreSQL', 'Docker'], 'Arsitek sistem NCD dan pengembang ekosistem teknologi komunitas.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000002', NULL, 'Mirza Danisywar Noor Wahyu', 'Mirza', 'Angkatan 2023', 'Sistem Informasi', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000001', 'Executive Committee', ARRAY['Strategic Leadership', 'Product Management'], 'Pemimpin umum NCD dalam ekspansi talenta dan kemitraan eksternal.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000003', NULL, 'Muhamad Fauzan Al Farikhi', 'Fauzan', 'Angkatan 2023', 'Informatika', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000002', 'Product & Operations', ARRAY['Product Owner', 'Agile Management'], 'Product Owner Website NCD dan koordinator operasional komunitas.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000004', NULL, 'Rayyan Fathan Addani', 'Rayyan', 'Angkatan 2023', 'Informatika', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000003', 'Content & Projects', ARRAY['Project Delivery', 'UI/UX Review'], 'Penanggung jawab kurasi proyek teknologi internal dan eksternal.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000005', NULL, 'Annisa Saskia', 'Annisa', 'Angkatan 2024', 'Sistem Informasi', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000005', 'Administration & Records', ARRAY['Documentation', 'Content Writing'], 'Pengelola arsip hukum AD/ART, notulen rapat, dan warta resmi NCD.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000006', NULL, 'Putri Aura Wening', 'Putri', 'Angkatan 2024', 'Sistem Informasi', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000006', 'Administration & Correspondence', ARRAY['Public Relations', 'Archiving'], 'Koordinator korespondensi rekrutmen dan penerbitan berkas organisasi.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'Muhammad Iqbal Fajri', 'Iqbal', 'Angkatan 2024', 'Informatika', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000007', 'Treasury & Kas Maker', ARRAY['Financial Planning', 'Budgeting'], 'Maker mutasi kas: pencatat seluruh arus kas masuk, pengeluaran, dan bukti nota.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE'),
		('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Sri Gunarti Wijiastuti', 'Sri', 'Angkatan 2024', 'Sistem Informasi', 'Universitas Gunadarma', 'a0000000-0000-0000-0000-000000000008', 'Audit & Kas Checker', ARRAY['Financial Audit', 'Reconciliation'], 'Checker mutasi kas: verifikator bukti transfer, nota belanja, dan pengesah kas.', 'https://linkedin.com', 'https://github.com', true, 'ACTIVE');
	`
	if _, err := pool.Exec(ctx, queryMembers); err != nil {
		return fmt.Errorf("seed members: %w", err)
	}

	// 4. Insert Finance Categories
	queryCategories := `
	INSERT INTO finance_categories (id, name, type) VALUES
		('d0000000-0000-0000-0000-000000000001', 'Saldo Awal & Migrasi', 'INCOME'),
		('d0000000-0000-0000-0000-000000000002', 'Iuran Anggota', 'INCOME'),
		('d0000000-0000-0000-0000-000000000003', 'Infrastruktur & Cloud', 'EXPENSE'),
		('d0000000-0000-0000-0000-000000000004', 'Operasional & Event', 'EXPENSE');
	`
	if _, err := pool.Exec(ctx, queryCategories); err != nil {
		return fmt.Errorf("seed categories: %w", err)
	}

	// 5. Insert Projects
	queryProjects := `
	INSERT INTO projects (id, title, slug, summary, description_md, tech_stack, repo_url, demo_url, status, progress_percent, is_public, pic_member_id) VALUES
		('f0000000-0000-0000-0000-000000000001', 'NCD Integrated Platform', 'ncd-integrated-platform', 'Platform resmi NCD dengan arsitektur Decoupled Go + React dan transparansi kas Maker-Checker.', 'Full-stack platform komunitas', ARRAY['Go', 'React 19', 'PostgreSQL', 'Tailwind CSS'], 'https://github.com/ncd/ncd-platform', 'https://ncd.nexatechlabs.my.id', 'ACTIVE', 85, true, 'c0000000-0000-0000-0000-000000000001'),
		('f0000000-0000-0000-0000-000000000002', 'NEXA Smart Attendance', 'nexa-smart-attendance', 'Sistem presensi kegiatan berbasis QR dinamis dengan enkripsi timestamp dan validasi geolokasi.', 'Aplikasi presensi aman', ARRAY['Go', 'WebRTC', 'Postgres', 'Redis'], 'https://github.com/ncd/smart-attendance', '', 'ACTIVE', 60, true, 'c0000000-0000-0000-0000-000000000004'),
		('f0000000-0000-0000-0000-000000000003', 'Community Competitive Programming Hub', 'cp-hub', 'Pelacak jadwal lomba hackathon dan latihan algoritma intensif untuk delegasi kompetisi.', 'Portal competitive programming', ARRAY['React', 'TypeScript', 'Python', 'FastAPI'], 'https://github.com/ncd/cp-hub', 'https://cp.nexatechlabs.my.id', 'COMPLETED', 100, true, 'c0000000-0000-0000-0000-000000000003');
	`
	if _, err := pool.Exec(ctx, queryProjects); err != nil {
		return fmt.Errorf("seed projects: %w", err)
	}

	log.Println("[SEED] Initial seed berhasil diselesaikan!")
	return nil
}
