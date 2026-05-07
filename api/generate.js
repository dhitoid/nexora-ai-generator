export default async function handler(req, res) {

  // CORS
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
Kamu adalah AI marketing property premium.

Buatkan output berikut dengan gaya ${tone}.

Data property:
- Lokasi: ${location}
- Tipe Rumah: ${type}
- Harga: ${price}
- Promo: ${promo}
- Target Market: ${market}

Balas hanya JSON valid tanpa markdown.

Format:
{
  "instagram": "",
  "tiktok": "",
  "metaAds": "",
  "whatsapp": ""
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
              content: 'Kamu expert marketing property Indonesia.'
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

    const text =
      data.choices?.[0]?.message?.content || '{}';

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        instagram: text,
        tiktok: '',
        metaAds: '',
        whatsapp: ''
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: 'Internal Server Error'
    });

  }

}
