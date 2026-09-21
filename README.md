# HollyHR MCP

The official hosted Model Context Protocol server for HollyHR.

[![Validate discovery metadata](https://github.com/hollyhr/hollyhr-mcp/actions/workflows/check.yml/badge.svg)](https://github.com/hollyhr/hollyhr-mcp/actions/workflows/check.yml)

HollyHR gives UK small and medium-sized organisations a dependable HR record
that approved AI assistants and agents can read and update safely. API, MCP and
Ask Holly are normal product capabilities rather than enterprise add-ons.

## Connect

Use this remote MCP URL in any client that supports Streamable HTTP and OAuth:

```text
https://app.hollyhr.com/api/mcp
```

Your client opens HollyHR in a browser so a System Admin can sign in and approve
the requested scopes. There are no API keys to paste into the MCP client.

### Cursor and Grok Bot

Install **HollyHR** from the Cursor Marketplace at user or project level. The
same marketplace plugin is available to Cursor's Grok Bot. On first use, choose
**Authenticate**, sign in to HollyHR in the browser window and approve access
to the intended organisation.

For local verification before a Marketplace release, clone this repository
inside `~/.cursor/plugins/local/hollyhr`, reload Cursor and confirm that the
HollyHR MCP server appears in **Customize**. The plugin contains no executable
runtime, API key or stored HollyHR credential: it points the client to the
first-party hosted endpoint below, where OAuth and normal HollyHR permissions
remain authoritative.

- [MCP setup guide](https://developers.hollyhr.com/mcp)
- [Developer home](https://www.hollyhr.com/developers)
- [Developer documentation](https://developers.hollyhr.com)
- [REST API reference](https://developers.hollyhr.com/reference)
- [Status](https://status.hollyhr.com)
- [HollyHR](https://www.hollyhr.com)

Runnable API, webhook and MCP examples live in
[`hollyhr-api-examples`](https://github.com/hollyhr/hollyhr-api-examples). The
generated TypeScript client and versioned OpenAPI contract live in
[`hollyhr-api-client`](https://github.com/hollyhr/hollyhr-api-client). You can
also explore the API through HollyHR's
[public Postman workspace](https://www.postman.com/hollyhr/workspace/hollyhr-public-api~73d93b69-5cda-44a4-b491-db7062f974bd/overview).

## What agents can do

The deliberately curated MCP surface supports:

- discovering available HollyHR API operations;
- finding people through approved directory fields;
- reading individual employment and organisation context;
- checking time off, balances and reference data;
- preparing supported writes without changing data; and
- committing an unchanged prepared write after explicit human confirmation.

Reads are available on every plan. Governed writes are included on Standard and
Plus. A System Admin must explicitly grant `mcp:write` and every underlying
write scope. Free workspaces remain read-only.

## Write safety

MCP does not turn an AI assistant into an unrestricted administrator.

Every supported write retains HollyHR's normal organisation, plan, scope and
permission checks. The server then uses a two-step protocol:

1. `prepare_api_write` validates the request and freezes the exact payload
   without changing HR data.
2. A confirmation-capable client shows that action to a human.
3. `commit_api_write` accepts only the matching, unexpired preparation and
   records the outcome with request, audit and idempotency evidence.

HollyHR can remove write tools and advertised write scopes through an emergency
switch without disabling read access.

## Data boundaries

- The authenticated principal selects one organisation. Callers cannot provide
  an organisation identifier to cross tenant boundaries.
- Tools return positive, allowlisted projections rather than raw database rows.
- High-sensitivity compensation, banking, tax, government identifier, medical
  detail and document-file data are not part of the standard MCP projection.
- Request limits and HR-row ceilings apply in addition to product permissions.

See the [MCP security model](https://developers.hollyhr.com/mcp#security-and-write-confirmation)
for the current contract.

## Discovery

HollyHR is published under the verified first-party namespace
`io.github.hollyhr/hollyhr` in the
[official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=hollyhr).
The canonical machine-readable metadata is checked in as [`server.json`](./server.json).

The Cursor package is described by
[`/.cursor-plugin/plugin.json`](./.cursor-plugin/plugin.json) and
[`/mcp.json`](./mcp.json). Cursor and Grok Bot use the same first-party hosted
endpoint, OAuth grant and tool catalogue; the package does not proxy or copy HR
data.

Glama also auto-ingests the official Registry record as a
[hosted HollyHR connector](https://glama.ai/mcp/connectors/io.github.hollyhr/hollyhr).
That external profile is a discovery route; its current verification and test
state are controlled by Glama and should be read on the profile itself.

HollyHR also maintains the
[HollyHR connector on Smithery](https://smithery.ai/servers/hollyhr/hollyhr)
under its claimed `hollyhr` namespace. The hosted endpoint and first-party
Registry identity above remain the canonical connection contract.

## Maintenance and contributions

Paul Gould (`@paulgould`) is the accountable maintainer. See
[MAINTENANCE.md](./MAINTENANCE.md) for the review and versioning policy and
[CONTRIBUTING.md](./CONTRIBUTING.md) before proposing a documentation or
discovery-metadata change.

## Support and security

- Product and integration help: [HollyHR contact](https://www.hollyhr.com/contact)
- Security disclosures: [SECURITY.md](./SECURITY.md)
- Privacy: [HollyHR privacy policy](https://www.hollyhr.com/privacy)

This repository contains public discovery documentation and examples. The
hosted HollyHR service remains the implementation and source of product truth.
See the [HollyHR GitHub organisation](https://github.com/hollyhr) for the other
maintained public projects.
