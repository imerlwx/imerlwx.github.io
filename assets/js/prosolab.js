// A scripted visual demonstration. No microphone, audio processing, or TTS.
(() => {
  'use strict';
  document.querySelectorAll('[data-proso-demo]').forEach((demo) => {
    const speak = demo.querySelector('[data-proso-speak]');
    const utterance = demo.querySelector('[data-proso-utterance]');
    const originalQuote = utterance.innerHTML;
    const words = utterance.textContent.split(' ');
    const status = demo.querySelector('[data-proso-status]');
    const canvas = demo.querySelector('[data-proso-canvas]');
    const features = [...demo.querySelectorAll('[data-proso-feature]')];
    let timers = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const setFeature = (feature, extracted) => {
      feature.classList.toggle('is-extracted', extracted);
      feature.querySelector('.proso-trend').textContent = extracted ? feature.dataset.prosoTrend : '—';
      const description = extracted ? feature.dataset.prosoChange : 'unchanged';
      feature.querySelector('[data-proso-trend-description]').textContent = `: ${description}`;
      feature.title = `${feature.firstChild.textContent.trim()}: ${description}`;
    };
    const setStage = (stage) => {
      demo.dataset.stage = stage;
      features.forEach((feature) => setFeature(feature, ['proposed', 'applied'].includes(stage)));
      canvas.setAttribute('aria-label', stage === 'applied'
        ? 'Updated speech canvas: easier has higher pitch, stronger emphasis, a longer duration, and wider spacing between words'
        : stage === 'proposed' ? 'Extracted pitch, emphasis, and rhythm shown as a proposed delivery'
        : 'Speech canvas showing the original delivery');
    };
    const finish = () => {
      clearTimers();
      utterance.innerHTML = originalQuote;
      utterance.removeAttribute('aria-hidden');
      setStage('applied');
      speak.disabled = false;
      speak.setAttribute('aria-label', 'Replay speech input in ProsoLab');
      speak.title = 'Replay speech input';
      status.textContent = 'Speech captured. Pitch, emphasis, and rhythm extracted and applied. Easier has higher pitch, stronger emphasis, and a longer duration. The words are spaced farther apart.';
    };
    speak.disabled = false;
    speak.addEventListener('click', () => {
      if (speak.disabled) return;
      clearTimers();
      speak.disabled = true;
      setStage('speaking');
      utterance.textContent = '';
      utterance.setAttribute('aria-hidden', 'true');
      status.textContent = 'Speaking the example.';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
      words.forEach((word, index) => {
        timers.push(setTimeout(() => { utterance.textContent = words.slice(0, index + 1).join(' '); }, index * 105));
      });
      const spoken = words.length * 105 + 250;
      timers.push(setTimeout(() => {
        utterance.innerHTML = originalQuote;
        utterance.removeAttribute('aria-hidden');
        setStage('extracting');
        status.textContent = 'Extracting pitch, emphasis, and rhythm.';
      }, spoken));
      features.forEach((feature, index) => {
        timers.push(setTimeout(() => setFeature(feature, true), spoken + 160 * (index + 1)));
      });
      timers.push(setTimeout(() => { setStage('proposed'); }, spoken + 650));
      timers.push(setTimeout(finish, spoken + 1150));
    });
    window.addEventListener('pagehide', () => {
      clearTimers();
      utterance.innerHTML = originalQuote;
      utterance.removeAttribute('aria-hidden');
      speak.disabled = false;
      speak.setAttribute('aria-label', 'Simulate speech input in ProsoLab');
      speak.title = 'Run the speech example';
      status.textContent = '';
      setStage('idle');
    });
    setStage('idle');
  });
})();
