export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('dns');
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);

    // Pre-warm MongoDB connection at server start so the first login request
    // doesn't have to wait for the TLS handshake to Atlas.
    const { connectDB } = await import('./lib/mongodb');
    connectDB().then(() => {
      console.log('[instrumentation] MongoDB pre-warm OK');
    }).catch((err: Error) => {
      console.error('[instrumentation] MongoDB pre-warm failed:', err.message);
    });
  }
}
