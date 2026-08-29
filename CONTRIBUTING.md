# Contributing

This repository documents HollyHR's first-party hosted MCP endpoint. It does not
contain the private application implementation.

Pull requests are welcome for factual setup corrections, clearer safe-use
guidance and machine-readable discovery metadata. Before opening one:

1. Check the current public developer guide and live Registry record.
2. Keep `server.json`, the endpoint, version and README claims aligned.
3. Explain whether a Registry update or provider-listing change is required.
4. Run `node scripts/check-metadata.mjs`.

Do not add API keys, OAuth tokens, reviewer credentials, tenant identifiers, HR
records or copied private application source. Product feature requests and API
issues belong in the repository issue tracker; security concerns follow
[SECURITY.md](./SECURITY.md).
