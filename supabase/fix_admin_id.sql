-- Replace 'YOUR_AUTH_USER_UID_HERE' with the User UID from the Authentication page
-- It should look like: a1b2c3d4-e5f6-7890-abcd-ef1234567890

UPDATE public.users
SET id = '5a64c938-e7b3-44a4-980e-e2539eb37458'
WHERE role = 'admin';
