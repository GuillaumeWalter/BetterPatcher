-- Easy Patch | Expand patch note tone options
-- Run in Supabase → SQL Editor (existing projects)

alter table public.patch_notes
  drop constraint if exists patch_notes_tone_check;

alter table public.patch_notes
  add constraint patch_notes_tone_check
  check (
    tone in (
      'technical',
      'marketing',
      'gaming',
      'steam',
      'discord',
      'minimal'
    )
  );
