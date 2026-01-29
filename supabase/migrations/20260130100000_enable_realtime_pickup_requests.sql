-- Enable realtime for pickup_requests table
-- This allows INSERT, UPDATE, DELETE events to be broadcast to subscribed clients
ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;
