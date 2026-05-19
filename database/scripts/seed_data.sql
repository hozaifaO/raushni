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

-- Seed public landing content
INSERT INTO landing_pages (
    slug,
    title,
    vision,
    mission,
    objectives,
    contact,
    assets,
    is_published
)
VALUES (
    'home',
    'Raushni Educational & Social Welfare Trust',
    'Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every individual, irrespective of their socio-economic background, has equal access to quality education, essential healthcare, and dignified livelihood opportunities.',
    'To empower underserved communities through quality education, healthcare access, skill development, and social welfare programs, fostering sustainable change one life at a time.',
    '[
      "Formal and digital education for underprivileged children and adults",
      "Healthcare and nutrition access for marginalized families",
      "Sustainable livelihood opportunities through vocational training and self-help groups",
      "Women and adolescent girls empowerment",
      "Environmental sustainability through tree plantation and waste management",
      "Digital and financial inclusion",
      "Emergency relief during natural disasters"
    ]'::jsonb,
    '{"address":"Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113","phone":"+91 997 3955 7600","email":"info@raushni.com"}'::jsonb,
    '{"logo":"/assets/brand/raushni-logo.png","banner":"/assets/brand/raushni-banner.png","video":"/assets/videos/raushni-community.mp4"}'::jsonb,
    true
) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    vision = EXCLUDED.vision,
    mission = EXCLUDED.mission,
    objectives = EXCLUDED.objectives,
    contact = EXCLUDED.contact,
    assets = EXCLUDED.assets,
    is_published = EXCLUDED.is_published,
    updated_at = NOW();
