CREATE TYPE public.service_request_status AS ENUM ('queue','processing','completed','failed','cancelled');
CREATE TYPE public.service_request_priority AS ENUM ('low','medium','high','urgent');

CREATE TABLE public.service_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference text NOT NULL DEFAULT ('SR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  title text NOT NULL,
  description text,
  customer_name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  priority public.service_request_priority NOT NULL DEFAULT 'medium',
  status public.service_request_status NOT NULL DEFAULT 'queue',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.service_request_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_label text,
  from_status public.service_request_status,
  to_status public.service_request_status,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
GRANT SELECT, INSERT ON public.service_request_events TO authenticated;
GRANT ALL ON public.service_request_events TO service_role;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_request_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_select_service_requests" ON public.service_requests FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_service_requests" ON public.service_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_service_requests" ON public.service_requests FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_service_requests" ON public.service_requests FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_select_service_request_events" ON public.service_request_events FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_service_request_events" ON public.service_request_events FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.touch_service_request() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_touch_service_request BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.touch_service_request();

CREATE OR REPLACE FUNCTION public.log_service_request_status() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.service_request_events (request_id, actor_id, from_status, to_status, note)
    VALUES (NEW.id, NEW.created_by, NULL, NEW.status, 'Request created');
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.service_request_events (request_id, actor_id, from_status, to_status, note)
    VALUES (NEW.id, auth.uid(), OLD.status, NEW.status, 'Status changed');
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_log_service_request AFTER INSERT OR UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.log_service_request_status();

CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_request_events_request ON public.service_request_events(request_id, created_at DESC);

ALTER TABLE public.service_requests REPLICA IDENTITY FULL;
ALTER TABLE public.service_request_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_request_events;