-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PostGIS is optional (image may not ship the control file for every Postgres build).
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'postgis extension unavailable; continuing without it';
END $$;

-- Create databases
CREATE DATABASE raushni_backend;
CREATE DATABASE raushni_cms;

-- Create users
CREATE USER raushni_user WITH PASSWORD 'raushni_password';
CREATE USER strapi_user WITH PASSWORD 'strapi_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE raushni_backend TO raushni_user;
GRANT ALL PRIVILEGES ON DATABASE raushni_cms TO strapi_user;

-- Connect to raushni_backend and create schemas
\c raushni_backend
CREATE SCHEMA IF NOT EXISTS raushni;
GRANT ALL ON SCHEMA raushni TO raushni_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA raushni GRANT ALL ON TABLES TO raushni_user;

-- Connect to raushni_cms and create schemas
\c raushni_cms
CREATE SCHEMA IF NOT EXISTS strapi;
GRANT ALL ON SCHEMA strapi TO strapi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA strapi GRANT ALL ON TABLES TO strapi_user;

-- Create backup user for automated backups
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE raushni_backend TO backup_user;
GRANT CONNECT ON DATABASE raushni_cms TO backup_user;

-- Enable monitoring extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Optional performance indexes (create only when target tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='members') THEN
    CREATE INDEX IF NOT EXISTS idx_member_email ON members(email);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='donations') THEN
    CREATE INDEX IF NOT EXISTS idx_donation_date ON donations(created_at);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='projects') THEN
    CREATE INDEX IF NOT EXISTS idx_project_status ON projects(status);
  END IF;
END $$;

-- Optional dashboard view (create only when dependencies exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='members')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='donations')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='projects') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW dashboard_stats AS
      SELECT
        (SELECT COUNT(*) FROM members WHERE status = ''ACTIVE'') AS total_members,
        (SELECT COUNT(*) FROM donations WHERE status = ''COMPLETED'') AS total_donations,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = ''COMPLETED'') AS total_amount,
        (SELECT COUNT(*) FROM projects WHERE status = ''ACTIVE'') AS active_projects
    ';
  END IF;
END $$;
