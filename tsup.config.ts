import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    schemas: 'src/schemas/index.ts',
    'types/index': 'src/types/index.ts',
    router: 'src/router.ts',
  },
  format: ['esm'],
  dts: { tsconfig: 'tsconfig.build.json' },
  clean: true,
  sourcemap: true,
  target: 'es2022',
  tsconfig: 'tsconfig.build.json',
})
