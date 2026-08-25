import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
export type ServiceRequestEvent = Database['public']['Tables']['service_request_events']['Row'];
export type RequestStatus = Database['public']['Enums']['service_request_status'];
export type RequestPriority = Database['public']['Enums']['service_request_priority'];

export const STATUSES: RequestStatus[] = ['queue', 'processing', 'completed', 'failed', 'cancelled'];
export const PRIORITIES: RequestPriority[] = ['low', 'medium', 'high', 'urgent'];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  queue: 'Queue',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

/**
 * Live service-request feed.
 *
 * Data is loaded once over HTTP, then kept in sync through a realtime
 * WebSocket channel — every insert/update/delete from any browser tab,
 * operator, supervisor or automation (MCP tools) lands here immediately.
 */
export function useServiceRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [events, setEvents] = useState<ServiceRequestEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    const [{ data: reqs }, { data: evts }] = await Promise.all([
      supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
      supabase
        .from('service_request_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    if (!mounted.current) return;
    setRequests(reqs ?? []);
    setEvents(evts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    load();

    const channel = supabase
      .channel('service-requests-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        (payload) => {
          setLastUpdate(new Date());
          setRequests((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as ServiceRequest;
              return prev.some((r) => r.id === row.id) ? prev : [row, ...prev];
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as ServiceRequest;
              return prev.map((r) => (r.id === row.id ? row : r));
            }
            const old = payload.old as ServiceRequest;
            return prev.filter((r) => r.id !== old.id);
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_request_events' },
        (payload) => {
          setLastUpdate(new Date());
          setEvents((prev) => [payload.new as ServiceRequestEvent, ...prev].slice(0, 50));
        },
      )
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [load]);

  const createRequest = useCallback(
    async (input: {
      title: string;
      customer_name: string;
      description?: string;
      category?: string;
      priority?: RequestPriority;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      const { error } = await supabase.from('service_requests').insert({
        ...input,
        created_by: session.session?.user.id ?? null,
      });
      return error?.message ?? null;
    },
    [],
  );

  const updateStatus = useCallback(async (id: string, status: RequestStatus) => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
    return error?.message ?? null;
  }, []);

  const assignToMe = useCallback(async (id: string) => {
    const { data: session } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('service_requests')
      .update({ assigned_to: session.session?.user.id ?? null })
      .eq('id', id);
    return error?.message ?? null;
  }, []);

  const deleteRequest = useCallback(async (id: string) => {
    const { error } = await supabase.from('service_requests').delete().eq('id', id);
    return error?.message ?? null;
  }, []);

  return {
    requests,
    events,
    loading,
    live,
    lastUpdate,
    reload: load,
    createRequest,
    updateStatus,
    assignToMe,
    deleteRequest,
  };
}
