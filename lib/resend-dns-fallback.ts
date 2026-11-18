import dns from 'node:dns';
import https from 'node:https';

export async function sendViaHttps(
  apiKey: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<{ ok: boolean; status: number; body: { id?: string; message?: string } }> {
  return new Promise((resolve, reject) => {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    const customLookup: https.RequestOptions['lookup'] = (hostname, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts;
        opts = {};
      }
      dns.resolve4(hostname, (err, addrs) => {
        if (err || !addrs || addrs.length === 0) {
          dns.lookup(hostname, opts as dns.LookupOneOptions, cb);
        } else {
          if (opts && (opts as dns.LookupAllOptions).all) {
            (cb as (err: Error | null, addresses: dns.LookupAddress[]) => void)(
              null,
              addrs.map((a) => ({ address: a, family: 4 }))
            );
          } else {
            cb(null, addrs[0], 4);
          }
        }
      });
    };

    const data = JSON.stringify(payload);
    const req = https.request(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        lookup: customLookup,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'resend-node:6.34.1',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(respData);
            resolve({ ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300, status: res.statusCode || 500, body: parsed });
          } catch {
            resolve({ ok: false, status: res.statusCode || 500, body: { message: respData } });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
