const https = require('https');

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const cnpj = req.query.cnpj;
  if (!cnpj || !/^\d{14}$/.test(cnpj)) {
    res.status(400).json({ erro: 'Informe o CNPJ com 14 dígitos. Ex: /api/cnpj?cnpj=07593518000125' });
    return;
  }

  try {
    const { status, body } = await fetchCNPJ(cnpj);
    res.status(status).json(body);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
};
