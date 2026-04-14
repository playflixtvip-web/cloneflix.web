export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL ausente" });

    try {
        const decodedUrl = decodeURIComponent(url);
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = await response.text();
        
        // 1. Tenta achar o link .m3u8 direto (caso já esteja na página)
        let regex = /(https?:\/\/[^"']+\.m3u8[^"']*)/i;
        let match = html.match(regex);

        // 2. Se não achou, procura por links de iFrame (as Opções de player)
        if (!match) {
            const iframeRegex = /<iframe[^>]+src="([^"]+)"/i;
            const iframeMatch = html.match(iframeRegex);
            if (iframeMatch) {
                // Se achou um iframe, tenta buscar o vídeo dentro dele
                const innerResp = await fetch(iframeMatch[1]);
                const innerHtml = await innerResp.text();
                match = innerHtml.match(regex);
            }
        }

        if (match && match[0]) {
            res.status(200).json({ url: match[0].replace(/\\/g, '') });
        } else {
            res.status(404).json({ error: "Vídeo não encontrado. Tente outra opção no site original." });
        }
    } catch (e) {
        res.status(500).json({ error: "Erro ao acessar o site." });
    }
}
