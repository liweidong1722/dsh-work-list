import type { UserConfig } from 'tsdown'

const ID = 'dsh-work-list'
const CLIENT_EXTERNALS = ['react', 'react/jsx-runtime']

export default [
  {
    name: `${ID}/host`,
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2023',
    dts: false,
    clean: false,
    outputOptions: { entryFileNames: 'index.js' },
  },
  {
    name: `${ID}/client`,
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2023',
    dts: false,
    clean: false,
    deps: { neverBundle: CLIENT_EXTERNALS },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      codeSplitting: false,
    },
  },
] satisfies UserConfig[]
