import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    context: 'src/context/context.ts',
    'event-tracker': 'src/event-tracker/index.ts',
    'error-reporter': 'src/error-reporter/index.ts',
    logger: 'src/logger/index.ts',
    metrics: 'src/metrics/index.ts',
    tracer: 'src/tracer/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  hash: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist'
});
