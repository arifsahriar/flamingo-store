-- =================================================================
-- FLAMINGO: SITE SETTINGS TABLE & RLS POLICIES MIGRATION
-- Supports Dynamic Footer, Trust Badges, Policies & Contact Info
-- =================================================================

-- 1. Create site_settings table if it doesn't already exist
create table if not exists public.site_settings (
  id integer primary key default 1,
  about_text text,
  support_phone text,
  support_whatsapp text,
  address text,
  facebook_url text,
  instagram_url text,
  copyright_text text,
  trust_badges jsonb default '[]'::jsonb,
  policy_delivery text,
  policy_warranty text,
  policy_exchange text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
alter table public.site_settings enable row level security;

-- 3. Configure public read and write policies
drop policy if exists "Allow public read on site_settings" on public.site_settings;
drop policy if exists "Allow public write on site_settings" on public.site_settings;
drop policy if exists "Allow public update on site_settings" on public.site_settings;
drop policy if exists "Allow public insert on site_settings" on public.site_settings;

create policy "Allow public read on site_settings" on public.site_settings for select using (true);
create policy "Allow public insert on site_settings" on public.site_settings for insert with check (true);
create policy "Allow public update on site_settings" on public.site_settings for update using (true);

-- 4. Seed initial default row if row 1 does not exist
insert into public.site_settings (
  id,
  about_text,
  support_phone,
  support_whatsapp,
  address,
  facebook_url,
  instagram_url,
  copyright_text,
  trust_badges,
  policy_delivery,
  policy_warranty,
  policy_exchange
) values (
  1,
  'খাঁটি ৯২৫ স্টার্লিং সিলভারের লাক্সারি ও মার্জিত ডিজাইনের বিশ্বস্ত ঠিকানা। সংবেদনশীল ত্বকের জন্য শতভাগ অ্যালার্জি-মুক্ত রোডিয়াম কোটিং ও সার্টিফাইড বিশুদ্ধতার অনন্য মেলবন্ধন।',
  '01700-000000 (সকাল ১০টা - রাত ১০টা)',
  '01700-000000',
  'বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  'https://facebook.com',
  'https://instagram.com',
  '© 2026 FLAMINGO. সর্বস্বত্ব সংরক্ষিত। খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি।',
  '[
    {"title": "১০০% খাঁটি ৯২৫ সিলভার", "subtitle": "আন্তর্জাতিক হলমার্ক সার্টিফিকেট"},
    {"title": "ক্যাশ অন ডেলিভারি", "subtitle": "পার্সেল চেক করে পেমেন্ট করার সুযোগ"},
    {"title": "লাইভ ওয়ারেন্টি সাপোর্ট", "subtitle": "ফ্রি পলিশিং ও অ্যান্টি-টার্নিশ কেয়ার"},
    {"title": "৭ দিনের সহজ এক্সচেঞ্জ", "subtitle": "ঝামেলাবিহীন সাইজ ও মডেল পরিবর্তন"}
  ]'::jsonb,
  '• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৳৮০ (২-৩ কার্যদিবস)।
• ঢাকা সিটির বাইরে ও সমগ্র বাংলাদেশে ডেলিভারি চার্জ ৳১৫০ (৩-৫ কার্যদিবস)।
• ক্যাশ অন ডেলিভারি প্রযোজ্য। পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে চেক করে মূল্য পরিশোধের শতভাগ নিশ্চয়তা রয়েছে।',
  '• প্রতিটি ৯২৫ সিলভার গহনার সাথে আন্তর্জাতিক হলমার্ক সার্টিফিকেট প্রদান করা হয়।
• নির্দিষ্ট মেয়াদের (৬ মাস/১ বছর) ফ্রি রিপলিশিং ও অ্যান্টি-টার্নিশ কেয়ার সাপোর্ট।
• ''অর্ডার ট্র্যাক'' পেজে গিয়ে অর্ডার আইডি বা মোবাইল নম্বর দিয়ে যেকোনো সময় ওয়ারেন্টি ক্লেইম মেমো ডাউনলোড করতে পারবেন।',
  '• পার্সেল গ্রহণের ৭ দিনের মধ্যে যেকোনো সাইজ বা মডেল পরিবর্তনের সুযোগ।
• গহনা অব্যবহৃত ও মূল গিফট বক্সে থাকতে হবে।
• কাস্টমার সাপোর্টে কল বা হোয়াটসঅ্যাপে মেসেজ দিয়ে সহজে রিটার্ন পিকআপ বুক করতে পারবেন।'
) on conflict (id) do nothing;
