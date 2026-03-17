import { initNav } from './modules/nav.js';
import { initTheme } from './modules/theme.js';
import { initForm } from './modules/form.js';
import { initFaq } from './modules/faq.js';
import { initServicePageEnhancements } from './modules/service-page-enhancements.js';
import { initServicePageAnimations } from './modules/service-page-animations.js';
import { renderServicePage } from './modules/service-page-renderer.js';
import { runInitializers } from './modules/bootstrap.js';

runInitializers([
  { name: 'service-renderer', initializer: renderServicePage },
  { name: 'nav', initializer: initNav },
  { name: 'theme', initializer: initTheme },
  { name: 'form', initializer: initForm },
  { name: 'faq', initializer: initFaq },
  { name: 'service-enhancements', initializer: initServicePageEnhancements },
  { name: 'service-animations', initializer: initServicePageAnimations }
]);
