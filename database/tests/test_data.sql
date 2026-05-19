\set ON_ERROR_STOP on
\c raushni_backend;

-- Test 5: seeded admin account exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@raushni.com'
  ) THEN
    RAISE EXCEPTION 'seeded admin user not found';
  END IF;
END $$;

-- Test 6: sample member exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'guest@raushni.com' AND role = 'GUEST'
  ) THEN
    RAISE EXCEPTION 'seeded guest user not found';
  END IF;
END $$;

-- Test 7: sample member exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM members WHERE member_id = 'RSN1001'
  ) THEN
    RAISE EXCEPTION 'seeded sample member not found';
  END IF;
END $$;

SELECT 'data tests passed' AS result;
