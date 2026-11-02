/* =========================================================
   PWA — instalação no celular e jogo offline
   Android/Chrome: botão "Instalar" (beforeinstallprompt)
   iPhone/Safari: instrução "Adicionar à Tela de Início"
   ========================================================= */
(function () {
  const $ = (s) => document.querySelector(s);

  let deferred = null;
  let ready = false;

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function isIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function reveal() {
    if (!ready || isStandalone()) return;
    const btn = $('#install-btn');
    const hint = $('#install-hint');
    if (deferred && btn) {
      btn.hidden = false;
      if (hint) hint.hidden = true;
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    reveal();
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    const btn = $('#install-btn');
    const hint = $('#install-hint');
    if (btn) btn.hidden = true;
    if (hint) hint.hidden = true;
    if (OP.UI && OP.UI.toast) OP.UI.toast('App instalado — abra pelo ícone na tela inicial.');
  });

  document.addEventListener('DOMContentLoaded', () => {
    ready = true;
    const btn = $('#install-btn');
    const hint = $('#install-hint');
    if (isStandalone()) return;

    if (isIOS() && hint) {
      hint.hidden = false;
      hint.innerHTML = 'Para jogar em tela cheia no iPhone: toque em <b>Compartilhar</b> ' +
        'e depois em <b>Adicionar à Tela de Início</b>.';
    }

    if (btn) {
      btn.addEventListener('click', async () => {
        if (!deferred) return;
        deferred.prompt();
        try {
          const choice = await deferred.userChoice;
          if (choice && choice.outcome === 'accepted') {
            btn.hidden = true;
            if (hint) hint.hidden = true;
          }
        } catch (err) { /* prompt já usado */ }
        deferred = null;
      });
    }

    reveal();
  });

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
