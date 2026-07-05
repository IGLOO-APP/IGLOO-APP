import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { url: documentUrl, id: documentId } = await req.json();

    if (!documentUrl) {
      return new Response(JSON.stringify({ error: 'Missing document URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Verify existence of the file in Supabase Storage if it is a Supabase URL
    if (documentUrl.includes('/storage/v1/object/public/')) {
      try {
        const url = new URL(documentUrl);
        const pathname = url.pathname;
        const publicIndex = pathname.indexOf('/public/');

        if (publicIndex !== -1) {
          const parts = pathname.slice(publicIndex + 8).split('/');
          const bucket = parts[0];
          const path = decodeURIComponent(parts.slice(1).join('/'));

          const lastSlashIndex = path.lastIndexOf('/');
          const folder = lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : '';
          const filename = lastSlashIndex !== -1 ? path.substring(lastSlashIndex + 1) : path;

          const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
          const supabaseServiceKey =
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
          const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

          const { data: files, error: listError } = await supabaseClient.storage
            .from(bucket)
            .list(folder || undefined);

          if (listError || !files) {
            console.error('[Preview Function] Error listing storage:', listError);
            return new Response(
              JSON.stringify({ error: 'Falha ao verificar os arquivos no storage.' }),
              {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }

          const fileExists = files.some((f) => f.name === filename);
          if (!fileExists) {
            return new Response(
              JSON.stringify({
                error: 'O arquivo não existe no Storage (caminho inválido ou deletado).',
              }),
              {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        }
      } catch (err) {
        console.error('[Preview Function] Path parsing error:', err);
      }
    }

    // 2. Call ApyHub Preview API
    const APYHUB_TOKEN = Deno.env.get('APYHUB_TOKEN');
    if (!APYHUB_TOKEN) {
      console.error('[Preview Function] APYHUB_TOKEN is not configured in Supabase Secrets.');
      return new Response(
        JSON.stringify({ error: 'Serviço de pré-visualização indisponível (Token ausente).' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const outputName = documentId ? `${documentId}-preview` : `preview-${Date.now()}`;
    const response = await fetch(
      `https://api.apyhub.com/generate/preview/file?output=${outputName}&width=600&auto_orientation=true`,
      {
        method: 'POST',
        headers: {
          'apy-token': APYHUB_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: documentUrl }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Preview Function] ApyHub API Error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `ApyHub failed: ${response.statusText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ data: data.data || null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('[Preview Function] Server error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
