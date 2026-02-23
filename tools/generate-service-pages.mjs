import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { servicePages } from '../js/data/service-pages.js';
import { renderServiceDocument } from '../js/modules/service-page-renderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const servicesRoot = path.join(projectRoot, 'services');

const entries = Object.values(servicePages).sort((a, b) => a.slug.localeCompare(b.slug));
mkdirSync(servicesRoot, { recursive: true });

for (const service of entries) {
  const serviceDir = path.join(servicesRoot, service.slug);
  const filePath = path.join(projectRoot, 'services', service.slug, 'index.html');
  mkdirSync(serviceDir, { recursive: true });
  const html = renderServiceDocument(service, {
    relativePrefix: '../../',
    baseUrl: 'https://ugamochi.systems/'
  });

  writeFileSync(filePath, `${html}\n`, 'utf8');
  console.log(`Generated: services/${service.slug}/index.html`);
}

console.log(`Done. Generated ${entries.length} service page(s).`);
