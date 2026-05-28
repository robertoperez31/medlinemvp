-- ============================================================
-- InstaSalud — Supabase Schema
-- Ejecuta este script en: Dashboard → SQL Editor → Run
-- ============================================================

-- ─────────────────────────────────────────
-- PERFILES DE USUARIO
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  cedula TEXT UNIQUE,
  phone TEXT,
  blood_type TEXT,
  weight_kg NUMERIC(5,1),
  height_cm NUMERIC(5,1),
  default_ars TEXT,
  default_plan TEXT,
  affiliate_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────
-- CITAS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT NOT NULL,
  doctor_photo TEXT,
  specialty TEXT NOT NULL,
  hospital TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','cancelled')),
  copay INTEGER,
  confirmation_number TEXT,
  qr_code TEXT,
  ai_wait_time INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON appointments(user_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments(appointment_date);


-- ─────────────────────────────────────────
-- CONDICIONES MÉDICAS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_conditions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'activa' CHECK (status IN ('activa','inactiva')),
  diagnosis_year TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conditions_user_id_idx ON medical_conditions(user_id);


-- ─────────────────────────────────────────
-- MEDICAMENTOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,
  start_date DATE,
  instructions TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medications_user_id_idx ON medications(user_id);


-- ─────────────────────────────────────────
-- ALERGIAS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS allergies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('baja','moderada','alta')),
  reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS allergies_user_id_idx ON allergies(user_id);


-- ─────────────────────────────────────────
-- DOCUMENTOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file','scan','lab','prescription')),
  category TEXT CHECK (category IN ('sangre','radiografia','ekg','ecografia','prescripcion','vacuna','otro')),
  storage_path TEXT,
  remote_url TEXT,
  size_bytes INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_category_idx ON documents(category);


-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario solo ve y modifica su propio perfil
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- appointments
CREATE POLICY "appointments_select_own" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "appointments_insert_own" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "appointments_update_own" ON appointments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "appointments_delete_own" ON appointments FOR DELETE USING (auth.uid() = user_id);

-- medical_conditions
CREATE POLICY "conditions_select_own" ON medical_conditions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conditions_insert_own" ON medical_conditions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conditions_update_own" ON medical_conditions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "conditions_delete_own" ON medical_conditions FOR DELETE USING (auth.uid() = user_id);

-- medications
CREATE POLICY "medications_select_own" ON medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "medications_insert_own" ON medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "medications_update_own" ON medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "medications_delete_own" ON medications FOR DELETE USING (auth.uid() = user_id);

-- allergies
CREATE POLICY "allergies_select_own" ON allergies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allergies_insert_own" ON allergies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allergies_update_own" ON allergies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allergies_delete_own" ON allergies FOR DELETE USING (auth.uid() = user_id);

-- documents
CREATE POLICY "documents_select_own" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert_own" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update_own" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "documents_delete_own" ON documents FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- STORAGE BUCKET PARA DOCUMENTOS
-- ─────────────────────────────────────────
-- Ejecutar en SQL Editor (requiere permisos de admin):
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage: cada usuario solo accede a su carpeta
CREATE POLICY "documents_storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "documents_storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
