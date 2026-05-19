-- Seed initial data for development
\c raushni_backend;

-- Insert admin user (password hash placeholder)
INSERT INTO users (id, email, hashed_password, name, role, is_active)
VALUES (
    gen_random_uuid(),
    'admin@raushni.com',
    '$2b$12$LQY3J5YxLQY3J5YxLQY3Ju5YxLQY3J5YxLQY3J5YxLQY3J5YxLQY3J5Y',
    'Admin User',
    'ADMIN',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default read-only guest user for demos and safe browsing
INSERT INTO users (id, email, hashed_password, name, role, is_active)
VALUES (
    gen_random_uuid(),
    'guest@raushni.com',
    '$2b$12$LQY3J5YxLQY3J5YxLQY3Ju5YxLQY3J5YxLQY3J5YxLQY3J5YxLQY3J5Y',
    'Guest User',
    'GUEST',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample member
INSERT INTO members (id, member_id, name, email, phone, address, designation, join_date, status)
VALUES (
    gen_random_uuid(),
    'RSN1001',
    'Owais Ahmad',
    'raushni.eswt@gmail.com',
    '9876543210',
    'Rauzah Appartment Ward# 14, Bhatauna Road, Marwan Khurd Muzaffarpur Bihar 843113',
    'Chairman',
    CURRENT_DATE,
    'ACTIVE'
) ON CONFLICT (email) DO NOTHING;
