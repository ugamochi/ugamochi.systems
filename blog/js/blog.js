import { initNav } from '../../js/modules/nav.js';
import { initTheme } from '../../js/modules/theme.js';
import { initFaq } from '../../js/modules/faq.js';
import { runInitializers } from '../../js/modules/bootstrap.js';

runInitializers([
  { name: 'nav', initializer: initNav },
  { name: 'theme', initializer: initTheme },
  { name: 'faq', initializer: initFaq }
]);
