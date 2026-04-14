export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL ausente" });

    try {
        const targetUrl = decodeURIComponent(url);
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://redecanaishd.space/'
            }
        });

        const html = await response.text();
        
        // Tenta encontrar links .m3u8, .mp4 ou links de players conhecidos (Vidmoly, Abyss, etc)
        const regexVideo = /(https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)/i;
        const regexEmbed = /https?:\/\/(?:vidmoly|abyss|redecanais|embed)[^"']+/i;

        let match = html.match(regexVideo) || html.match(regexEmbed);

        if (match && match[0]) {
            let finalUrl = match[0].replace(/\\/g, '');
            
            // Se o robô achou um link de embed em vez do vídeo direto, mandamos esse para o player
            res.status(200).json({ url: finalUrl });
        } else {
            res.status(404).json({ error: "Não foi possível encontrar o player automaticamente." });
        }
    } catch (e) {
        res.status(500).json({ error: "Erro de conexão com o servidor." });
    }
}
