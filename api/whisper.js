export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const form = await req.formData();
  const file = form.get('file');           // Blob z przeglądarki (webm/wav)
  if (!file) return new Response(JSON.stringify({ error: 'no_file' }), { status: 400 });

  const out = new FormData();
  out.append('file', file, 'clip.webm');   // Whisper akceptuje webm
  out.append('model', 'whisper-1');
  out.append('language', 'pl');            // szybciej i czytelniej

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: out
  });

  const data = await resp.json();
  return new Response(JSON.stringify({ text: data.text || '' }), {
    headers: { 'content-type': 'application/json' }
  });
}
