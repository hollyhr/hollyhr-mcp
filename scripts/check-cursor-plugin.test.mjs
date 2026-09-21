/**
 * Regression tests for the Cursor plugin package validator.
 */

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { fileURLToPath } from "node:url";

import { validateCursorPlugin } from "./check-cursor-plugin.mjs";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "hollyhr-cursor-plugin-"));
  temporaryRoots.push(root);
  await mkdir(path.join(root, ".cursor-plugin"), { recursive: true });
  await mkdir(path.join(root, "assets"), { recursive: true });

  for (const relativePath of [
    ".cursor-plugin/plugin.json",
    "mcp.json",
    "assets/logo.svg",
    "README.md",
    "CHANGELOG.md",
    "LICENSE",
  ]) {
    const contents = await readFile(
      path.join(sourceRoot, relativePath),
      "utf8",
    );
    await writeFile(path.join(root, relativePath), contents);
  }
  return root;
}

async function mutateJson(root, relativePath, mutation) {
  const filePath = path.join(root, relativePath);
  const value = JSON.parse(await readFile(filePath, "utf8"));
  mutation(value);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

test("accepts the reviewed first-party package", async () => {
  const root = await fixture();
  assert.deepEqual(await validateCursorPlugin(root), []);
});

test("rejects credential-bearing MCP configuration", async () => {
  const root = await fixture();
  await mutateJson(root, "mcp.json", (value) => {
    value.mcpServers.hollyhr.headers = { Authorization: "Bearer example" };
  });
  const errors = await validateCursorPlugin(root);
  assert.ok(errors.some((error) => error.includes("only type, url and auth")));
  assert.ok(
    errors.some((error) => error.includes("must not embed credentials")),
  );
});

test("rejects public OAuth client drift", async () => {
  const root = await fixture();
  await mutateJson(root, "mcp.json", (value) => {
    value.mcpServers.hollyhr.auth.CLIENT_ID = "different-client";
  });
  assert.ok(
    (await validateCursorPlugin(root)).some((error) =>
      error.includes("Cursor public client ID"),
    ),
  );
});

test("rejects endpoint drift", async () => {
  const root = await fixture();
  await mutateJson(root, "mcp.json", (value) => {
    value.mcpServers.hollyhr.url = "https://example.com/mcp";
  });
  assert.ok(
    (await validateCursorPlugin(root)).some((error) =>
      error.includes("MCP endpoint"),
    ),
  );
});

test("rejects unsupported manifest fields", async () => {
  const root = await fixture();
  await mutateJson(root, ".cursor-plugin/plugin.json", (value) => {
    value.unreviewedCapability = true;
  });
  assert.ok(
    (await validateCursorPlugin(root)).some((error) =>
      error.includes("unsupported fields"),
    ),
  );
});

test("rejects unsafe referenced paths", async () => {
  const root = await fixture();
  await mutateJson(root, ".cursor-plugin/plugin.json", (value) => {
    value.logo = "../logo.svg";
  });
  assert.ok(
    (await validateCursorPlugin(root)).some((error) =>
      error.includes("logo must use a safe relative path"),
    ),
  );
});
