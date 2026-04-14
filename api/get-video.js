export default async function handler(req, res) {
    // Libera o acesso para o seu site não ser bloqueado
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL ausente" });

    try {
        const targetUrl = decodeURIComponent(url);
        
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': new URL(targetUrl).origin
            }
        });

        const html = await response.text();
        
        // Esta regex é mais poderosa para achar links .m3u8 escondidos
        const regex = /(https?:\/\/[^"']+\.m3u8[^"']*|https?:\/\/[^"']+\.mp4[^"']*)/i;
        const match = html.match(regex);

        if (match && match[0]) {
            // Limpa o link de barras invertidas que alguns sites usam para enganar robôs
            const cleanUrl = match[0].replace(/\\/g, '');
            return res.status(200).json({ url: cleanUrl });
        } else {
            return res.status(404).json({ error: "O robô não achou o vídeo nesta página." });
        }
    } catch (error) {
        return res.status(500).json({ error: "Erro ao acessar a página do filme." });
    }
}
