-- Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for support_requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own support requests
CREATE POLICY "Users can insert their own support requests" 
ON public.support_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own support requests
CREATE POLICY "Users can view their own support requests" 
ON public.support_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'bug', 'feature', 'other')),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback" 
ON public.feedback FOR SELECT 
USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX support_requests_user_id_idx ON public.support_requests(user_id);
CREATE INDEX support_requests_status_idx ON public.support_requests(status);
CREATE INDEX feedback_user_id_idx ON public.feedback(user_id);
CREATE INDEX feedback_type_idx ON public.feedback(type);

-- Add function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on support_requests
CREATE TRIGGER update_support_requests_updated_at
BEFORE UPDATE ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.support_requests TO authenticated;
GRANT SELECT, INSERT ON public.feedback TO authenticated; 