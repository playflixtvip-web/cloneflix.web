export default async function handler(req, res) {
    // Permite que o seu site acesse a API sem bloqueios (CORS)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL ausente" });

    try {
        const response = await fetch(decodeURIComponent(url), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': 'https://redecanaishd.space/'
            }
        });

        const html = await response.text();
        // Procura por links .m3u8 dentro do código da página
        const regex = /(https?:\/\/[^"']+\.m3u8[^"']*)/;
        const match = html.match(regex);

        if (match && match[0]) {
            const finalUrl = match[0].replace(/\\/g, '');
            res.status(200).json({ url: finalUrl });
        } else {
            res.status(404).json({ error: "Vídeo não encontrado na página." });
        }
    } catch (error) {
        res.status(500).json({ error: "Erro ao conectar com o site de origem." });
    }
}
