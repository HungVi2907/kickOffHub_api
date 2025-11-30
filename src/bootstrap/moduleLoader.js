import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const modulesDir = path.resolve(currentDir, '..', 'modules');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

function normalizeModuleManifest(input = {}, fallbackName) {
  const {
    name = fallbackName,
    routes = null,
    publicRoutes = null,
    privateRoutes = null,
    basePath = '/',
    publicApi = {},
    tasks = [],
  } = input;

  return { name, routes, publicRoutes, privateRoutes, basePath, publicApi, tasks };
}

export default async function loadModules(container, options = {}) {
  const directory = options.modulesPath ?? modulesDir;
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const manifests = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const moduleRoot = path.join(directory, entry.name);
    const indexFile = path.join(moduleRoot, 'index.js');
    if (!(await fileExists(indexFile))) {
      continue;
    }

    try {
      const moduleUrl = pathToFileURL(indexFile).href;
      const imported = await import(moduleUrl);
      const register = imported.default ?? imported.register;
      if (typeof register !== 'function') {
        continue;
      }
      const manifest = await register({ container });
      manifests.push(normalizeModuleManifest(manifest, entry.name));
    } catch (err) {
      const logger = container.has('logger') ? container.get('logger') : console;
      logger.error({ module: entry.name, err }, 'Failed to load module');
    }
  }

  return manifests;
}
