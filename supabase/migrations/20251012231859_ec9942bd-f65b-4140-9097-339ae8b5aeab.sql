-- Add comprehensive fields to waitlist_submissions table

-- Make last_name optional (it's currently required)
ALTER TABLE public.waitlist_submissions
ALTER COLUMN last_name DROP NOT NULL;

-- Add location fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN city text,
ADD COLUMN state_region text,
ADD COLUMN country text,
ADD COLUMN zip text;

-- Add identity & preferences fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN age_range text CHECK (age_range IN ('18-24', '25-34', '35-44', '45-54', '55+')),
ADD COLUMN gender_identity text,
ADD COLUMN orientation text,
ADD COLUMN relationship_goal text CHECK (relationship_goal IN ('casual', 'dating', 'long-term', 'not sure'));

-- Add lifestyle/safety fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN drinking text CHECK (drinking IN ('no', 'social', 'regular')),
ADD COLUMN smoking text CHECK (smoking IN ('no', 'occasionally', 'yes')),
ADD COLUMN accessibility_needs text;

-- Add behavioral intent fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN weekly_energy text CHECK (weekly_energy IN ('low', 'medium', 'high')),
ADD COLUMN conversation_style text CHECK (conversation_style IN ('short', 'medium', 'long')),
ADD COLUMN crowd_tolerance text CHECK (crowd_tolerance IN ('low', 'medium', 'high')),
ADD COLUMN budget_band text CHECK (budget_band IN ('low', 'medium', 'high')),
ADD COLUMN time_window text CHECK (time_window IN ('morning', 'afternoon', 'evening', 'weekend'));

-- Add discovery & funnel fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN heard_about_us text,
ADD COLUMN willing_to_beta boolean DEFAULT false,
ADD COLUMN email_opt_in boolean DEFAULT true;

-- Add DEI optional fields
ALTER TABLE public.waitlist_submissions
ADD COLUMN lgbtq_plus boolean,
ADD COLUMN race_ethnicity text[], -- array for multi-select
ADD COLUMN other_notes text;

-- Add index on submitted_at for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_submitted_at ON public.waitlist_submissions(submitted_at DESC);