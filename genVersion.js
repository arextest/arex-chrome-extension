import manifest from './public/manifest.json' assert { type: "json" };
import fs from 'fs'
console.log(manifest.version,'manifest')

fs.writeFileSync('./src/interceptor.ts', `(window as any).__AREX_EXTENSION_INSTALLED__ = true;
(window as any).__AREX_EXTENSION_VERSION__ = '${manifest.version}';
`, 'utf8');