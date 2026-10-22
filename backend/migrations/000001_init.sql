-- ============================================================================
-- NCD Database Initial Migration (000001_init.sql)
-- Target Database: PostgreSQL 16 (Supabase)
-- ============================================================================

-- 1. Custom Types & Enumerations
CREATE TYPE user_role AS ENUM (
  'GOD_ADMIN',
  'SUPER_ADMIN',
  'ADMIN_KONTEN_PROYEK',
  'SEKRETARIS',
  'BENDAHARA_I',
  'BENDAHARA_II',
  'MEMBER'
);

CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI');
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE transaction_status AS ENUM ('DRAFT_PENDING', 'VERIFIED', 'VOID');
CREATE TYPE dues_status AS ENUM ('UNPAID', 'PENDING_CONFIRMATION', 'PAID');
CREATE TYPE project_status AS ENUM ('IDEA', 'ACTIVE', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');
CREATE TYPE competition_status AS ENUM ('PLANNING', 'REGISTERED', 'ONGOING', 'COMPLETED');
CREATE TYPE application_status AS ENUM ('NEW', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED');

-- 2. Positions Table (Struktur Organisasi)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  level INT NOT NULL,
  order_priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Users Table (Kredensial & Autentikasi)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'MEMBER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by UUID REFERENCES users(id),
  invite_token VARCHAR(255),
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Members Table (Profil Detail 35 Anggota)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  full_name VARCHAR(150) NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  generation VARCHAR(20) NOT NULL,
  major VARCHAR(100),
  university VARCHAR(100) DEFAULT 'Universitas Gunadarma',
  position_id UUID REFERENCES positions(id),
  division VARCHAR(50),
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  phone_number VARCHAR(30),
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  show_in_public BOOLEAN NOT NULL DEFAULT TRUE,
  status member_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Finance Categories Table
CREATE TABLE finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type transaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Finance Transactions (Maker-Checker & Immutability)
CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) NOT NULL UNIQUE,
  type transaction_type NOT NULL,
  category_id UUID NOT NULL REFERENCES finance_categories(id),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  person_in_charge VARCHAR(150) NOT NULL,
  receipt_url TEXT NOT NULL,
  status transaction_status NOT NULL DEFAULT 'DRAFT_PENDING',
  transaction_date DATE NOT NULL,
  maker_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verifier_id UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  void_by_id UUID REFERENCES users(id),
  void_reason TEXT,
  void_at TIMESTAMPTZ,
  CONSTRAINT chk_maker_not_verifier CHECK (maker_id != verifier_id)
);

-- 7. Dues Records (Rekap Iuran Anggota)
CREATE TABLE dues_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status dues_status NOT NULL DEFAULT 'UNPAID',
  paid_at TIMESTAMPTZ,
  transaction_id UUID REFERENCES finance_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, period_month, period_year)
);

-- 8. Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description_md TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  repo_url TEXT,
  demo_url TEXT,
  status project_status NOT NULL DEFAULT 'ACTIVE',
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  pic_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Project Members Relational
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role_in_project VARCHAR(100) DEFAULT 'Developer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, member_id)
);

-- 10. Competitions Table
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  organizer VARCHAR(150) NOT NULL,
  registration_deadline TIMESTAMPTZ,
  submission_deadline TIMESTAMPTZ,
  status competition_status NOT NULL DEFAULT 'PLANNING',
  achievement_level VARCHAR(50),
  result_notes TEXT,
  file_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  event_name VARCHAR(200) NOT NULL,
  tier VARCHAR(50) NOT NULL,
  award_date DATE NOT NULL,
  certificate_url TEXT,
  photo_url TEXT,
  competition_id UUID REFERENCES competitions(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Posts Table (Warta & Berita)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(250) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  summary TEXT,
  content_md TEXT NOT NULL,
  cover_image_url TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_internal_only BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. History Events Table
CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Rules Table
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  effective_date DATE NOT NULL,
  summary TEXT,
  document_url TEXT NOT NULL,
  is_public_summary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  access_role user_role[] DEFAULT '{MEMBER}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Applications Table (Pendaftar Rekrutmen)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_whatsapp VARCHAR(30) NOT NULL,
  university VARCHAR(100) NOT NULL,
  major VARCHAR(100) NOT NULL,
  generation VARCHAR(20) NOT NULL,
  skills_interest TEXT NOT NULL,
  motivation TEXT NOT NULL,
  portfolio_links TEXT,
  status application_status NOT NULL DEFAULT 'NEW',
  internal_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  target_id UUID,
  previous_state JSONB,
  new_state JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Settings Table
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_position_id ON members(position_id);
CREATE INDEX idx_finance_status ON finance_transactions(status);
CREATE INDEX idx_finance_date ON finance_transactions(transaction_date);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_is_public ON projects(is_public);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published ON posts(is_published, is_internal_only);
