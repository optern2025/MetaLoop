-- ╔══════════════════════════════════════════════════════════════╗
-- ║  MetaLoop VR Hackathon — FINAL Database Setup              ║
-- ║  Run this ONCE in Supabase SQL Editor                      ║
-- ║  Safe to re-run: drops everything first, then recreates    ║
-- ╚══════════════════════════════════════════════════════════════╝


-- ┌─────────────────────────────────────────┐
-- │  1. CLEAN SLATE — Drop policies/trigger │
-- └─────────────────────────────────────────┘

DO $$
DECLARE
  r RECORD;
BEGIN
  -- Drop every RLS policy on our tables
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','teams','team_members',
        'problem_statements','submissions',
        'evaluations','leaderboard','hackathon_config'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS recalculate_leaderboard() CASCADE;


-- ┌─────────────────────────────────────────┐
-- │  2. TABLES                              │
-- └─────────────────────────────────────────┘

-- Profiles (auto-created on signup via trigger)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'candidate'
                  CHECK (role IN ('candidate','jury','admin')),
  avatar_url    TEXT DEFAULT '',
  college       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  skills        TEXT[] DEFAULT '{}',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Teams
CREATE TABLE IF NOT EXISTS public.teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name     TEXT NOT NULL UNIQUE,
  leader_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invite_code   TEXT NOT NULL UNIQUE
                  DEFAULT substring(md5(random()::text) FROM 1 FOR 8),
  status        TEXT NOT NULL DEFAULT 'forming'
                  CHECK (status IN ('forming','registered','active','disqualified')),
  max_members   INT DEFAULT 4,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Team members (junction)
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('leader','member')),
  joined_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Problem statements (posted by admin)
CREATE TABLE IF NOT EXISTS public.problem_statements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  difficulty    TEXT NOT NULL DEFAULT 'medium'
                  CHECK (difficulty IN ('easy','medium','hard')),
  category      TEXT NOT NULL DEFAULT 'general',
  bootcamp_links JSONB DEFAULT '[]'::jsonb,
  material_links JSONB DEFAULT '[]'::jsonb,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Submissions (team ideas + prototypes)
CREATE TABLE IF NOT EXISTS public.submissions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id             UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  problem_id          UUID REFERENCES public.problem_statements(id) ON DELETE SET NULL,
  idea_title          TEXT NOT NULL DEFAULT '',
  idea_description    TEXT NOT NULL DEFAULT '',
  prototype_url       TEXT DEFAULT '',
  demo_video_url      TEXT DEFAULT '',
  submission_file_path TEXT DEFAULT '',
  detailed_description TEXT DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','submitted','under_review','evaluated')),
  checkpoints         JSONB DEFAULT '{"idea_submitted":false,"prototype_uploaded":false,"demo_recorded":false,"final_submitted":false}'::jsonb,
  submitted_at        TIMESTAMPTZ,
  last_updated        TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Evaluations (jury scores)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id     UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  jury_id           UUID NOT NULL REFERENCES public.profiles(id),
  innovation_score  INT DEFAULT 0 CHECK (innovation_score   BETWEEN 0 AND 10),
  feasibility_score INT DEFAULT 0 CHECK (feasibility_score  BETWEEN 0 AND 10),
  presentation_score INT DEFAULT 0 CHECK (presentation_score BETWEEN 0 AND 10),
  technical_score   INT DEFAULT 0 CHECK (technical_score    BETWEEN 0 AND 10),
  impact_score      INT DEFAULT 0 CHECK (impact_score       BETWEEN 0 AND 10),
  total_score       INT GENERATED ALWAYS AS (
    innovation_score + feasibility_score + presentation_score +
    technical_score + impact_score
  ) STORED,
  remarks           TEXT DEFAULT '',
  feedback          TEXT DEFAULT '',
  evaluated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(submission_id, jury_id)
);

-- Leaderboard (computed rankings)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  avg_score   NUMERIC(5,2) DEFAULT 0,
  rank        INT DEFAULT 0,
  badge       TEXT DEFAULT ''
                CHECK (badge IN ('','gold','silver','bronze','finalist')),
  is_winner   BOOLEAN DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Hackathon configuration (singleton)
CREATE TABLE IF NOT EXISTS public.hackathon_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_name  TEXT NOT NULL DEFAULT 'MetaLoop VR Hackathon',
  start_date      TIMESTAMPTZ,
  end_date        TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming','live','ended')),
  settings        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now()
);


-- ┌─────────────────────────────────────────┐
-- │  3. ENABLE ROW LEVEL SECURITY           │
-- └─────────────────────────────────────────┘

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_config   ENABLE ROW LEVEL SECURITY;


-- ┌─────────────────────────────────────────┐
-- │  4. RLS POLICIES                        │
-- └─────────────────────────────────────────┘

-- ── profiles ──
CREATE POLICY "p_ins" ON public.profiles FOR INSERT
  WITH CHECK (true);                              -- trigger inserts via SECURITY DEFINER
CREATE POLICY "p_sel" ON public.profiles FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "p_upd" ON public.profiles FOR UPDATE
  TO authenticated USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── teams ──
CREATE POLICY "t_sel" ON public.teams FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "t_ins" ON public.teams FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'candidate')
  );
CREATE POLICY "t_upd" ON public.teams FOR UPDATE
  TO authenticated USING (leader_id = auth.uid());
CREATE POLICY "t_all" ON public.teams FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── team_members ──
CREATE POLICY "tm_sel" ON public.team_members FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "tm_ins" ON public.team_members FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "tm_del" ON public.team_members FOR DELETE
  TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tm_all" ON public.team_members FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── problem_statements ──
CREATE POLICY "ps_sel" ON public.problem_statements FOR SELECT
  TO authenticated USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "ps_all" ON public.problem_statements FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── submissions ──
CREATE POLICY "s_sel" ON public.submissions FOR SELECT
  TO authenticated USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('jury','admin'))
  );
CREATE POLICY "s_ins" ON public.submissions FOR INSERT
  TO authenticated WITH CHECK (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );
CREATE POLICY "s_upd" ON public.submissions FOR UPDATE
  TO authenticated USING (
    team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );
CREATE POLICY "s_all" ON public.submissions FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── evaluations ──
CREATE POLICY "e_sel" ON public.evaluations FOR SELECT
  TO authenticated USING (
    jury_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.team_members tm ON tm.team_id = s.team_id
      WHERE tm.user_id = auth.uid()
    )
  );
CREATE POLICY "e_ins" ON public.evaluations FOR INSERT
  TO authenticated WITH CHECK (
    jury_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'jury')
  );
CREATE POLICY "e_upd" ON public.evaluations FOR UPDATE
  TO authenticated USING (jury_id = auth.uid());
CREATE POLICY "e_all" ON public.evaluations FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── leaderboard ──
CREATE POLICY "lb_sel" ON public.leaderboard FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "lb_all" ON public.leaderboard FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── hackathon_config ──
CREATE POLICY "hc_sel" ON public.hackathon_config FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "hc_all" ON public.hackathon_config FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ┌─────────────────────────────────────────┐
-- │  5. TRIGGER: auto-create profile        │
-- └─────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public          -- prevents search_path hijack
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'candidate')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- profile already exists (re-run safety)
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;          -- never block signup
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ┌─────────────────────────────────────────┐
-- │  6. FUNCTION: recalculate leaderboard   │
-- └─────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION public.recalculate_leaderboard()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.leaderboard;

  INSERT INTO public.leaderboard (team_id, avg_score, rank, updated_at)
  SELECT
    s.team_id,
    ROUND(AVG(e.total_score)::numeric, 2),
    ROW_NUMBER() OVER (ORDER BY AVG(e.total_score) DESC),
    now()
  FROM public.submissions s
  JOIN public.evaluations e ON e.submission_id = s.id
  WHERE s.status = 'evaluated'
  GROUP BY s.team_id;

  UPDATE public.leaderboard SET badge = 'gold',   is_winner = TRUE  WHERE rank = 1;
  UPDATE public.leaderboard SET badge = 'silver'                     WHERE rank = 2;
  UPDATE public.leaderboard SET badge = 'bronze'                     WHERE rank = 3;
  UPDATE public.leaderboard SET badge = 'finalist'                   WHERE rank BETWEEN 4 AND 10;
END;
$$;


-- ┌─────────────────────────────────────────┐
-- │  7. PERMISSIONS & SEED DATA             │
-- └─────────────────────────────────────────┘

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Default hackathon entry
INSERT INTO public.hackathon_config (hackathon_name, status)
VALUES ('MetaLoop VR Hackathon 2026', 'upcoming')
ON CONFLICT DO NOTHING;
