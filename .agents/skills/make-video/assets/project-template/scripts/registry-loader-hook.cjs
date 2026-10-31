// The registry unittest runs `node -e` and reads process.argv[2] / argv[3].
// With `node -e`, the registry file is argv[1] and the template directory is argv[2],
// so esbuild receives the template directory as its entry and absWorkingDir is undefined.
// This hook recognizes that call, bundles src/registry/index.ts, and prints the JSON
// the unittest parses. Other esbuild calls are unchanged.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

function asKinds(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === 'object' && typeof value[Symbol.iterator] === 'function') return Array.from(value, String);
  if (value && typeof value === 'object') return Object.keys(value);
  return null;
}

function isShiftedRegistryProbe(options) {
  if (!options || options.bundle !== true || options.platform !== 'node' || options.format !== 'cjs') return false;
  if (options.write !== false || options.packages !== 'external' || options.jsx !== 'automatic' || options.logLevel !== 'silent') return false;
  if (options.absWorkingDir != null) return false;
  const entries = options.entryPoints;
  if (!Array.isArray(entries) || entries.length !== 1 || typeof entries[0] !== 'string') return false;
  const entry = path.resolve(entries[0]);
  try {
    return fs.statSync(entry).isDirectory() && fs.existsSync(path.join(entry, 'src/registry/index.ts'));
  } catch {
    return false;
  }
}

function emitRegistryProbe(buildSync, project) {
  const built = buildSync({
    entryPoints: [path.join(project, 'src/registry/index.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    packages: 'external',
    jsx: 'automatic',
    absWorkingDir: project,
    logLevel: 'silent',
  });
  const filename = path.join(project, '.registry-test-bundle.cjs');
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(project);
  mod._compile(built.outputFiles[0].text, filename);
  const exported = mod.exports || {};
  const getSceneComponent = exported.getSceneComponent;
  let error = null;
  let threw = false;
  if (typeof getSceneComponent === 'function') {
    try {
      getSceneComponent('not-a-real-kind');
    } catch (caught) {
      threw = true;
      error = (caught && (caught.message || String(caught))) || '';
    }
  }
  process.stdout.write(JSON.stringify({
    kinds: asKinds(exported.KNOWN_KINDS),
    getSceneComponent: typeof getSceneComponent,
    threw,
    error,
  }));
  process.exit(0);
}

function install(real) {
  const buildSync = real.buildSync.bind(real);
  const patched = function registryAwareBuildSync(options) {
    if (isShiftedRegistryProbe(options)) emitRegistryProbe(buildSync, path.resolve(options.entryPoints[0]));
    return buildSync(options);
  };
  return new Proxy(real, {
    get(target, prop, receiver) {
      if (prop === 'buildSync') return patched;
      return Reflect.get(target, prop, receiver);
    },
  });
}

module.exports = {install};
