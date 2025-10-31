-- Phase 3: Database Cleanup - Fixed
-- Remove duplicate tables that are not being used by the application

-- Drop friend_requests table (using friend_invitations instead)
DROP TABLE IF EXISTS public.friend_requests CASCADE;

-- Drop hangout_requests table (using hangout_invitations instead)
DROP TABLE IF EXISTS public.hangout_requests CASCADE;