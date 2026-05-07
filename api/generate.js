export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {

    const {
      location,
      type,
      price,
      promo,
      market,
      tone
    } = req.body;

    const prompt = `
Kamu adalah AI marketing property Indonesia.

Buat:
1. Caption Instagram
2. Hook TikTok
3. Meta Ads Copy
4. Follow Up WhatsApp

Data:
- Lokasi: ${location}
- Tipe: ${type}
- Harga: ${price}
- Promo: ${promo}
- Target Market: ${market}
- Tone: ${tone}

Balas dengan format JSON VALID SAJA.

JANGAN gunakan markdown.
JANGAN gunakan backtick.

Format EXACT:

{
  "instagram": "isi caption",
  "tiktok": "isi hook",
  "metaAds": "isi ads",
  "whatsapp": "isi whatsapp"
}
`;

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content:
                'Kamu expert copywriting property Indonesia.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9
        })
      }
    );

    const data = await response.json();

    const raw =
      data.choices?.[0]?.message?.content || '';

    console.log(raw);

    // Bersihkan markdown jika ada
    const cleaned = raw
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let parsed;

    try {

      parsed = JSON.parse(cleaned);

    } catch (e) {

      console.error('JSON Parse Error:', e);

      return res.status(500).json({
        error: 'AI JSON Parse Failed',
        raw: cleaned
      });

    }

    return res.status(200).json(parsed);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Internal Server Error'
    });

  }

}