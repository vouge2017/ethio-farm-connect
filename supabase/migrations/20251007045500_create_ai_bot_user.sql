-- Create a dedicated user for the AI Answer Bot
INSERT INTO public.users (id, email, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'ai-bot@farmconnect.com', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (user_id, display_name, phone_number, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'FarmConnect AI Assistant', '+10000000000', 'admin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;