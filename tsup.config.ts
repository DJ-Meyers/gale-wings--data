import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'constants/index': 'src/constants/index.ts',
    dex: 'src/dex.ts',
    schemas: 'src/schemas/index.ts',
    'types/index': 'src/types/index.ts',
    'aliases/index': 'src/aliases/index.ts',
    'sprites/index': 'src/sprites/index.ts',
  },
  format: ['esm'],
  dts: { tsconfig: 'tsconfig.build.json' },
  clean: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: 'tsconfig.build.json',
})
