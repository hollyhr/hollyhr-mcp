/**
 * Validate the stable first-party MCP identity and its public documentation.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const expected = {
  schema: "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
  name: "io.github.hollyhr/hollyhr",
  title: "HollyHR",
  version: "1.0.0",
  websiteUrl: "https://developers.hollyhr.com/mcp",
  endpoint: "https://app.hollyhr.com/api/mcp",
};

const [metadataText, readme] = await Promise.all([
  readFile(new URL("../server.json", import.meta.url), "utf8"),
  readFile(new URL("../README.md", import.meta.url), "utf8"),
]);
const metadata = JSON.parse(metadataText);

assert.equal(metadata.$schema, expected.schema, "server.json schema changed unexpectedly");
assert.equal(metadata.name, expected.name, "first-party Registry identity drifted");
assert.equal(metadata.title, expected.title, "server title drifted");
assert.equal(metadata.version, expected.version, "version must match the published Registry record");
assert.equal(metadata.websiteUrl, expected.websiteUrl, "developer guide URL drifted");
assert.deepEqual(metadata.remotes, [{ type: "streamable-http", url: expected.endpoint }]);

for (const required of [expected.name, expected.endpoint, expected.websiteUrl]) {
  assert.ok(readme.includes(required), `README is missing ${required}`);
}

assert.ok(
  readme.includes("https://glama.ai/mcp/connectors/io.github.hollyhr/hollyhr"),
  "README is missing the hosted Glama connector discovery link",
);

for (const [label, url] of [
  ["developer home", "https://www.hollyhr.com/developers"],
  ["GitHub organisation", "https://github.com/hollyhr"],
  ["API examples", "https://github.com/hollyhr/hollyhr-api-examples"],
  ["SDK source", "https://github.com/hollyhr/hollyhr-api-client"],
  [
    "Postman workspace",
    "https://www.postman.com/hollyhr/workspace/hollyhr-public-api~73d93b69-5cda-44a4-b491-db7062f974bd/overview",
  ],
  ["Smithery connector", "https://smithery.ai/servers/hollyhr/hollyhr"],
]) {
  assert.ok(readme.includes(url), `README is missing the ${label} link`);
}

console.log(`metadata check passed: ${expected.name}@${expected.version}`);
