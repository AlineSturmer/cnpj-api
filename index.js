const https = require('https');

const PORT = process.env.PORT || 3000;

function fetchCNPJ(cnpj) {
  return new Promise((resolve, reject) => {
    const url = `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
    https.get(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'cnpj-api/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('Erro ao parsear resposta')); }
      });
    }).on('error', reject);
  });
}

require('http').createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const match = req.url.match(/^\/cnpj\/(\d{14})$/);
  if (!match) {
    res.writeHead(400);
    res.end(JSON.stringify({ erro: 'Use /cnpj/00000000000000 (14 dígitos, sem pontuação)' }));
    return;
  }

  try {
    const { status, body } = await fetchCNPJ(match[1]);
    res.writeHead(status);
    res.end(JSON.stringify(body));
  } catch (e) {
    res.writeHead(500);
    res.end(JSON.stringify({ erro: e.message }));
  }
}).listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
