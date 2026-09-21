/**
 * Validate the credential-free Cursor and Grok Bot package for the hosted MCP.
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const expected = Object.freeze({
  pluginName: "hollyhr",
  displayName: "HollyHR",
  pluginVersion: "1.0.0",
  repository: "https://github.com/hollyhr/hollyhr-mcp",
  homepage: "https://www.hollyhr.com",
  endpoint: "https://app.hollyhr.com/api/mcp",
  transport: "http",
  clientId: "SqegLqGcSRdPiiQGMMEYNsFzRJKeLjnW",
  scopes: [
    "organisation:read",
    "people:read",
    "reference:read",
    "time_off:read",
    "time_off:write",
    "mcp:write",
    "offline_access",
  ],
});

const manifestKeys = new Set([
  "name",
  "displayName",
  "description",
  "version",
  "author",
  "publisher",
  "homepage",
  "repository",
  "license",
  "logo",
  "keywords",
  "category",
  "tags",
  "mcpServers",
]);

const plainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sorted = (values) => [...values].sort();

const safeRelativePath = (value) =>
  typeof value === "string" &&
  value.length > 0 &&
  !path.isAbsolute(value) &&
  !value.split(/[\\/]/u).includes("..");

const parseJson = (text, label, errors) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return undefined;
  }
};

const readRequired = async (filePath, label, errors) => {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    errors.push(`${label} cannot be read: ${error.code ?? error.message}`);
    return undefined;
  }
};

const expectEqual = (actual, wanted, label, errors) => {
  if (actual !== wanted) {
    errors.push(`${label} must be ${JSON.stringify(wanted)}`);
  }
};

export async function validateCursorPlugin(repoRoot) {
  const errors = [];
  const manifestPath = path.join(repoRoot, ".cursor-plugin", "plugin.json");
  const mcpPath = path.join(repoRoot, "mcp.json");

  const [manifestText, mcpText, readme, changelog, license] = await Promise.all(
    [
      readRequired(manifestPath, "Cursor manifest", errors),
      readRequired(mcpPath, "MCP configuration", errors),
      readRequired(path.join(repoRoot, "README.md"), "README", errors),
      readRequired(path.join(repoRoot, "CHANGELOG.md"), "changelog", errors),
      readRequired(path.join(repoRoot, "LICENSE"), "license", errors),
    ],
  );

  const manifest = manifestText
    ? parseJson(manifestText, "Cursor manifest", errors)
    : undefined;
  const mcp = mcpText
    ? parseJson(mcpText, "MCP configuration", errors)
    : undefined;

  if (plainObject(manifest)) {
    const unknownManifestKeys = Object.keys(manifest).filter(
      (key) => !manifestKeys.has(key),
    );
    if (unknownManifestKeys.length > 0) {
      errors.push(
        `Cursor manifest has unsupported fields: ${sorted(unknownManifestKeys).join(", ")}`,
      );
    }

    expectEqual(manifest.name, expected.pluginName, "plugin name", errors);
    expectEqual(
      manifest.displayName,
      expected.displayName,
      "display name",
      errors,
    );
    expectEqual(
      manifest.version,
      expected.pluginVersion,
      "plugin version",
      errors,
    );
    expectEqual(manifest.publisher, "HollyHR", "publisher", errors);
    expectEqual(manifest.homepage, expected.homepage, "homepage", errors);
    expectEqual(manifest.repository, expected.repository, "repository", errors);
    expectEqual(manifest.license, "MIT", "license identifier", errors);
    expectEqual(manifest.category, "integrations", "category", errors);
    expectEqual(
      manifest.mcpServers,
      "./mcp.json",
      "MCP file reference",
      errors,
    );

    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/u.test(manifest.name ?? "")) {
      errors.push("plugin name must be a lowercase Cursor identifier");
    }
    if (
      !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.test(
        manifest.version ?? "",
      )
    ) {
      errors.push("plugin version must be strict X.Y.Z semantic versioning");
    }
    if (
      typeof manifest.description !== "string" ||
      manifest.description.length < 40
    ) {
      errors.push("plugin description must explain the integration clearly");
    }
    if (
      !plainObject(manifest.author) ||
      manifest.author.name !== "HollyHR" ||
      manifest.author.email !== "support@hollyhr.com" ||
      Object.keys(manifest.author).some(
        (key) => !["name", "email"].includes(key),
      )
    ) {
      errors.push("author must be the named HollyHR support identity only");
    }
    if (
      !Array.isArray(manifest.keywords) ||
      manifest.keywords.length < 4 ||
      new Set(manifest.keywords).size !== manifest.keywords.length ||
      manifest.keywords.some((keyword) => !/^[a-z0-9-]+$/u.test(keyword))
    ) {
      errors.push("keywords must be unique lowercase discovery terms");
    }
    if (
      !Array.isArray(manifest.tags) ||
      manifest.tags.length < 3 ||
      new Set(manifest.tags).size !== manifest.tags.length ||
      manifest.tags.some((tag) => !/^[a-z0-9-]+$/u.test(tag))
    ) {
      errors.push("tags must be unique lowercase discovery terms");
    }

    for (const [label, relativePath] of [
      ["logo", manifest.logo],
      ["MCP file", manifest.mcpServers],
    ]) {
      if (!safeRelativePath(relativePath)) {
        errors.push(`${label} must use a safe relative path`);
        continue;
      }
      try {
        await access(path.resolve(repoRoot, relativePath));
      } catch {
        errors.push(`${label} does not exist at ${relativePath}`);
      }
    }
  } else if (manifest !== undefined) {
    errors.push("Cursor manifest must be a JSON object");
  }

  if (plainObject(mcp)) {
    const topKeys = Object.keys(mcp);
    if (topKeys.length !== 1 || topKeys[0] !== "mcpServers") {
      errors.push("MCP configuration may contain only mcpServers");
    }

    const serverNames = plainObject(mcp.mcpServers)
      ? Object.keys(mcp.mcpServers)
      : [];
    if (serverNames.length !== 1 || serverNames[0] !== expected.pluginName) {
      errors.push("MCP configuration must define only the hollyhr server");
    }

    const server = mcp.mcpServers?.[expected.pluginName];
    if (!plainObject(server)) {
      errors.push("hollyhr MCP server configuration must be an object");
    } else {
      const serverKeys = Object.keys(server);
      if (
        serverKeys.length !== 3 ||
        !serverKeys.includes("type") ||
        !serverKeys.includes("url") ||
        !serverKeys.includes("auth")
      ) {
        errors.push("hollyhr MCP server may contain only type, url and auth");
      }
      expectEqual(server.type, expected.transport, "MCP transport", errors);
      expectEqual(server.url, expected.endpoint, "MCP endpoint", errors);

      const auth = server.auth;
      if (!plainObject(auth)) {
        errors.push("Cursor OAuth configuration must be an object");
      } else {
        const authKeys = Object.keys(auth);
        if (
          authKeys.length !== 2 ||
          !authKeys.includes("CLIENT_ID") ||
          !authKeys.includes("scopes")
        ) {
          errors.push(
            "Cursor OAuth configuration may contain only CLIENT_ID and scopes",
          );
        }
        expectEqual(
          auth.CLIENT_ID,
          expected.clientId,
          "Cursor public client ID",
          errors,
        );
        if (
          !Array.isArray(auth.scopes) ||
          JSON.stringify(auth.scopes) !== JSON.stringify(expected.scopes)
        ) {
          errors.push(
            "Cursor OAuth scopes must match the reviewed least-authority profile",
          );
        }
      }
    }

    const serialized = JSON.stringify(mcp);
    if (
      /(?:authorization|bearer|api[_-]?key|client[_-]?secret|password|headers|env)/iu.test(
        serialized,
      ) ||
      /\$\{[^}]+\}/u.test(serialized)
    ) {
      errors.push("MCP configuration must not embed credentials or variables");
    }
  } else if (mcp !== undefined) {
    errors.push("MCP configuration must be a JSON object");
  }

  if (readme) {
    for (const fragment of [
      "Cursor and Grok Bot",
      expected.endpoint,
      "There are no API keys to paste",
      "prepare_api_write",
      "commit_api_write",
      "System Admin",
    ]) {
      if (!readme.includes(fragment)) {
        errors.push(`README is missing ${JSON.stringify(fragment)}`);
      }
    }
  }

  if (
    changelog &&
    !changelog.includes(`## ${expected.pluginVersion} - 2026-09-21`)
  ) {
    errors.push(
      `changelog is missing plugin version ${expected.pluginVersion}`,
    );
  }
  if (license && !license.includes("MIT License")) {
    errors.push("LICENSE must retain the MIT license text");
  }

  return errors;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const errors = await validateCursorPlugin(repoRoot);
  if (errors.length > 0) {
    console.error("Cursor plugin validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Cursor plugin check passed: ${expected.pluginName}@${expected.pluginVersion} -> ${expected.endpoint}`,
    );
  }
}
