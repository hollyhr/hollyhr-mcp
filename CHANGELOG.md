# Changelog

All notable changes to the public HollyHR MCP discovery package are recorded
here. This repository follows [Semantic Versioning](https://semver.org/) for
the Cursor plugin package.

## 1.0.0 - 2026-09-21

- Add the first-party HollyHR Cursor plugin manifest.
- Configure the existing hosted Streamable HTTP MCP endpoint for Cursor and
  Grok Bot.
- Use one public, PKCE-only OAuth client for Cursor's documented web and desktop
  callbacks, with no client secret or shared bearer credential.
- Document browser-based OAuth and HollyHR's confirmed-write safety model.
