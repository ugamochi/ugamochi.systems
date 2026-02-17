export function initServiceCards() {
  document.querySelectorAll('.service-card[data-href]').forEach((card) => {
    const href = card.getAttribute('data-href');
    if (!href) return;

    const goToService = () => {
      window.location.href = href;
    };

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, select, textarea, label')) return;
      goToService();
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        goToService();
      }
    });
  });
}
