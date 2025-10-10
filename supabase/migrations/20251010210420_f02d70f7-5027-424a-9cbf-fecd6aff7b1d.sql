-- Add INSERT policy for profiles table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Harden handle_new_user() with input validation and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  full_name_value TEXT;
  first_name_value TEXT;
BEGIN
  -- Safely read full_name from user metadata
  full_name_value := NEW.raw_user_meta_data->>'full_name';

  IF full_name_value IS NOT NULL THEN
    -- Trim whitespace and limit length to prevent abuse
    full_name_value := btrim(full_name_value);
    IF length(full_name_value) > 200 THEN
      full_name_value := substr(full_name_value, 1, 200);
    END IF;
    -- Extract first name and limit its length
    first_name_value := substr(SPLIT_PART(full_name_value, ' ', 1), 1, 100);
  END IF;

  -- Insert profile with protection against failures
  BEGIN
    INSERT INTO public.profiles (id, full_name, first_name)
    VALUES (NEW.id, full_name_value, first_name_value);
  EXCEPTION WHEN OTHERS THEN
    -- Do not block auth user creation; log a warning instead
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;