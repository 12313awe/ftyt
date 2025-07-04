-- SkalGPT Veritabanı Kurulum Dosyası
-- Bu dosya, tüm migrasyonları birleştirerek veritabanını sıfırdan kurar.

-- 0001_initial.sql içeriği:

-- Gerekli eklentileri etkinleştir
create extension if not exists vector with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- KULLANICI YÖNETİMİ
-- Kullanıcı profilleri için tablo (Bu tablo, daha sonra users tablosu ile birleştirilecektir)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  surname text,
  role text default 'user'
);

-- Yeni bir kullanıcı kaydolduğunda otomatik olarak bir profil oluşturan fonksiyon (Geçici).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, surname)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'surname');
  return new;
end;
$$;

-- Yukarıdaki fonksiyonu her yeni kullanıcı kaydında tetikleyen trigger (Geçici).
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- USERS tablosu (Ana kullanıcı bilgilerini tutar)
create table public.users (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  role text default 'user',
  primary key (id)
);

-- SOHBET GEÇMİŞİ
-- Sohbet oturumları için tablo
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Yeni Sohbet',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sohbet mesajları için tablo
create table public.chat_messages (
  id bigserial primary key,
  session_id uuid references public.chat_sessions on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  role text not null, -- 'user' or 'assistant'
  content text
);

-- RAG (Retrieval-Augmented Generation) SİSTEMİ
-- Vektör doküman parçaları için tablo
create table public.document_chunks (
    id bigserial primary key,
    content text,
  metadata jsonb,
    embedding vector (768)
);

-- Benzer dokümanları bulmak için fonksiyon
create or replace function match_documents (
  query_embedding vector(768),
  match_count int,
  filter jsonb
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where document_chunks.metadata @> filter
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- GÜVENLİK (RLS) ve TRIGGER'LAR
-- RLS'i etkinleştir
alter table public.profiles enable row level security;
alter table public.users enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.document_chunks enable row level security;

-- POLİTİKALAR (Başlangıç politikaları, daha sonra güncellenecek)
-- Eski politikaları düşür ve yeni politikaları oluştur
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

-- "Public profiles are viewable by everyone." politikasını düşür ve yenisini oluştur
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.users;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.users;
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage their own chat sessions" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage messages in their own sessions" ON public.chat_messages FOR ALL USING (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = chat_messages.session_id and chat_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "All authenticated users can view document chunks" ON public.document_chunks FOR SELECT TO authenticated USING (true);

-- TRIGGER'LAR
-- updated_at sütununu güncelleyen trigger fonksiyonu
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_chat_sessions_updated_at
  before update on chat_sessions
  for each row
  execute function update_updated_at();

-- İNDEKSLEME
create index chat_messages_session_id_created_at_idx on chat_messages (session_id, created_at);
create index chat_sessions_user_id_created_at_idx on chat_sessions (user_id, created_at);
create index document_chunks_embedding_idx on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 0002_features.sql içeriği:

-- Schedule a job to delete old messages every day at 3:00 AM UTC
select
  cron.schedule(
    'delete-old-messages',
    '0 3 * * *', -- Every day at 3:00 AM UTC
    $$
    delete from public.chat_messages
    where
      created_at < now() - interval '30 days' and
      user_id not in (select id from public.users where role = 'admin');
    $$
  );

-- 0003_consolidate_users.sql içeriği:

-- Adım 1: Mevcut trigger'ı geçici olarak devre dışı bırak
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created; -- Yorum satırına alındı

-- Adım 2: 'profiles' tablosundan 'users' tablosuna eksik verileri taşı
-- Not: Bu komut, 'users' tablosunda zaten var olmayan profilleri ekler.
INSERT INTO public.users (id, full_name, role)
SELECT p.id, p.name || ' ' || p.surname, p.role
FROM public.profiles p
LEFT JOIN public.users u ON p.id = u.id
WHERE u.id IS NULL;

-- Adım 3: Artık gereksiz olan 'profiles' tablosunu ve eski trigger fonksiyonunu sil
-- DROP TABLE public.profiles; -- Yorum satırına alındı
-- DROP FUNCTION public.handle_new_user; -- Yorum satırına alındı

-- Adım 4: Yeni kullanıcıları doğrudan 'users' tablosuna ekleyecek yeni bir fonksiyon oluştur
create or replace function public.handle_new_user_consolidated()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'name' || ' ' || new.raw_user_meta_data ->> 'surname', 'user');
  return new;
end;
$$;

-- Adım 5: Yeni trigger'ı 'auth.users' tablosuna bağla
create trigger on_auth_user_created_consolidated
  after insert on auth.users
  for each row execute procedure public.handle_new_user_consolidated();

-- Adım 6: Olası tutarsızlıkları önlemek için eski trigger'ı tamamen kaldır
-- Not: Bu komut, trigger'ın var olması durumunda çalışır, yoksa hata vermez.
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Yorum satırına alındı

-- 0004_private_users.sql içeriği:

-- Mevcut "herkese açık profil" politikasını daha kısıtlayıcı hale getir.
-- Bu komut, politikanın "select" (görüntüleme) kuralını sadece kullanıcının kendi ID'si ile eşleşen satırları döndürecek şekilde değiştirir.
-- ALTER POLICY "Public profiles are viewable by everyone." ON public.users
-- USING (auth.uid() = id); -- Yorum satırına alındı, çünkü yukarıda "Users can view their own profile." olarak zaten oluşturuldu.
 
-- Politikanın adını, yeni amacını yansıtacak şekilde güncelle.
-- ALTER POLICY "Public profiles are viewable by everyone." ON public.users
-- RENAME TO "Users can view their own profile."; -- Yorum satırına alındı, çünkü politikayı yeniden oluşturduk. 