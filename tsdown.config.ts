import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    context: 'src/context/context.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  hash: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist'
});
