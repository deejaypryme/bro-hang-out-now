
-- Create user_availability table to store user's available time slots
CREATE TABLE public.user_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  specific_date DATE NULL, -- For one-time availability overrides
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_user_availability_user_id ON public.user_availability(user_id);
CREATE INDEX idx_user_availability_day_of_week ON public.user_availability(day_of_week);
CREATE INDEX idx_user_availability_specific_date ON public.user_availability(specific_date);

-- Add RLS policies for user availability
ALTER TABLE public.user_availability ENABLE ROW LEVEL SECURITY;

-- Users can view their own availability
CREATE POLICY "Users can view their own availability" 
  ON public.user_availability 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own availability
CREATE POLICY "Users can create their own availability" 
  ON public.user_availability 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own availability
CREATE POLICY "Users can update their own availability" 
  ON public.user_availability 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own availability
CREATE POLICY "Users can delete their own availability" 
  ON public.user_availability 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user_availability_exceptions table for blocking out specific times
CREATE TABLE public.user_availability_exceptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for exceptions
CREATE INDEX idx_user_availability_exceptions_user_id ON public.user_availability_exceptions(user_id);
CREATE INDEX idx_user_availability_exceptions_date ON public.user_availability_exceptions(exception_date);

-- Add RLS policies for availability exceptions
ALTER TABLE public.user_availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own availability exceptions
CREATE POLICY "Users can manage their own availability exceptions" 
  ON public.user_availability_exceptions 
  FOR ALL 
  USING (auth.uid() = user_id);
