-- Enable realtime for subscriptions table
ALTER TABLE public.subscriptions REPLICA IDENTITY FULL;

-- Add subscriptions table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;