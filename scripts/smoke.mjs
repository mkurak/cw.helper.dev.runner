#!/usr/bin/env node
import * as runner from '../dist/index.js';

if (!runner || typeof runner.DevRunner === 'undefined') {
  console.error('[cw-dev-runner] Smoke test failed: DevRunner export missing');
  process.exit(1);
}

if (typeof runner.loadConfig !== 'function' || typeof runner.resolveConfig !== 'function') {
  console.error('[cw-dev-runner] Smoke test failed: config helpers missing');
  process.exit(1);
}

console.log('[cw-dev-runner] OK: smoke test passed');
