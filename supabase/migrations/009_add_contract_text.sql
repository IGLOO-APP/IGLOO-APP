-- Adiciona coluna contract_text para armazenar o texto da minuta gerada
alter table public.contracts add column if not exists contract_text text;