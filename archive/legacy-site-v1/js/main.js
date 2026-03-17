import { initNav } from './modules/nav.js';
import { initTheme } from './modules/theme.js';
import { initAnimations } from './modules/animations.js';
import { initForm } from './modules/form.js';
import { initServiceCards } from './modules/service-cards.js';
import { initFaq } from './modules/faq.js';
import { runInitializers } from './modules/bootstrap.js';

runInitializers([
  { name: 'nav', initializer: initNav },
  { name: 'theme', initializer: initTheme },
  { name: 'form', initializer: initForm },
  { name: 'animations', initializer: initAnimations },
  { name: 'service-cards', initializer: initServiceCards },
  { name: 'faq', initializer: initFaq }
]);
