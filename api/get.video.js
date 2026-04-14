export default async function handler(req, res) {
    // 1. Pega a URL que o seu App enviou (a página do filme)
    const { url } = req.query;

    if (!url) {
        return res.status(400).send("Nenhuma URL foi fornecida.");
    }

    try {
        // 2. O servidor acessa o site do filme fingindo ser um navegador Chrome
        const response = await fetch(decodeURIComponent(url), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });

        const html = await response.text();

        // 3. O "robô" varre o código do site em busca de um link que termine em .m3u8
        // Ele ignora o resto e pega apenas o endereço do vídeo
        const regex = /https?:\/\/[^"']+\.m3u8[^"']*/;
        const match = html.match(regex);

        if (match && match[0]) {
            // 4. Se ele achar o link, ele redireciona o seu player para lá na hora
            res.redirect(302, match[0]);
        } else {
            res.status(404).send("Não foi possível encontrar o arquivo de vídeo (.m3u8) nesta página.");
        }
    } catch (error) {
        console.error("Erro na API:", error);
        res.status(500).send("Erro interno ao tentar capturar o vídeo.");
    }
}

