(() => {
  'use strict';

  document.querySelectorAll('.speech-hint').forEach((hint) => {
    const button = hint.closest('button');
    button.addEventListener('click', () => button.classList.add('has-spoken'), { once: true });
  });

  // A scripted illustration, not a live AI system or microphone recording.
  const thoughts = [
    { node: 'A place to think', quote: '“I want a place to think out loud.”' },
    { node: 'Keep my own words', quote: '“I want to keep my own words while I’m figuring things out.”' },
    { node: 'Find a direction', quote: '“Seeing how these ideas connect could help me find a direction.”' }
  ];
  document.querySelectorAll('[data-thought-demo]').forEach((demo) => {
    const button = demo.querySelector('[data-thought-speak]');
    const utterance = demo.querySelector('[data-utterance]');
    const status = demo.querySelector('[data-demo-step]');
    const canvas = demo.querySelector('[data-thought-canvas]');
    const nodes = [...demo.querySelectorAll('[data-node]')];
    const connectors = [...demo.querySelectorAll('[data-thought-connector]')];
    let step = -1;
    let timers = [];
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const renderCanvas = () => {
      demo.dataset.step = String(step);
      nodes.forEach((node, index) => { node.hidden = index > step; });
      connectors.forEach((connector) => { connector.toggleAttribute('hidden', Number(connector.dataset.thoughtConnector) > step); });
      canvas.setAttribute('aria-label', step < 0 ? 'An empty canvas waiting for a spoken thought'
        : `${step + 1} ${step === 0 ? 'idea' : 'connected ideas'} on the canvas`);
    };
    const settle = () => {
      clearTimers();
      renderCanvas();
      utterance.textContent = thoughts[step].quote;
      utterance.removeAttribute('aria-hidden');
      status.textContent = `${thoughts[step].quote} Added ${thoughts[step].node}. ${step + 1} of 3 ideas.`;
      demo.classList.remove('is-dictating');
      button.disabled = false;
      button.title = step === 2 ? 'Start a new thought map' : 'Speak the next thought';
      button.querySelector('.speech-cue').textContent = step === 2 ? '↻' : '→';
    };
    button.disabled = false;
    renderCanvas();
    button.addEventListener('click', () => {
      if (button.disabled) return;
      clearTimers();
      step = (step + 1) % thoughts.length;
      if (step === 0) {
        nodes.forEach((node) => { node.hidden = true; });
        connectors.forEach((connector) => { connector.setAttribute('hidden', ''); });
        canvas.setAttribute('aria-label', 'An empty canvas waiting for a spoken thought');
      }
      const thought = thoughts[step];
      button.disabled = true;
      utterance.textContent = '';
      utterance.setAttribute('aria-hidden', 'true');
      demo.classList.add('is-dictating');
      status.textContent = 'Speaking the next thought.';
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { settle(); return; }
      const words = thought.quote.split(' ');
      words.forEach((word, index) => {
        timers.push(setTimeout(() => { utterance.textContent = words.slice(0, index + 1).join(' '); }, index * 75));
      });
      timers.push(setTimeout(settle, words.length * 75 + 250));
    });
    window.addEventListener('pagehide', () => {
      clearTimers();
      step = -1;
      renderCanvas();
      utterance.textContent = thoughts[0].quote;
      utterance.removeAttribute('aria-hidden');
      status.textContent = '';
      demo.classList.remove('is-dictating');
      button.disabled = false;
      button.title = 'Speak a thought';
      button.querySelector('.speech-cue').textContent = '→';
    });
  });

  // Two concise learning moves based on Tutorly's guided-practice workflow.
  document.querySelectorAll('[data-tutor-chat]').forEach((chat) => {
    const blank = chat.querySelector('[data-chat-blank]');
    const functions = chat.querySelector('[data-chat-functions]');
    const followup = chat.querySelector('[data-chat-followup]');
    const answers = [...chat.querySelectorAll('[data-chat-answer]')];
    const replay = chat.querySelector('[data-chat-replay]');
    const feedback = chat.querySelector('[data-chat-feedback]');
    let complete = false;
    functions.hidden = false;

    functions.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        replay.hidden = false;
        if (button.dataset.chatFunction !== 'geom_boxplot') {
          button.dataset.result = 'retry';
          feedback.textContent = button.dataset.chatFunction === 'geom_point'
            ? 'Points show individual values. Try a function that summarizes each group.'
            : 'Lines show a sequence. Here, we want to compare groups.';
          return;
        }
        blank.textContent = 'geom_boxplot';
        blank.classList.add('is-filled');
        functions.hidden = true;
        followup.hidden = false;
        feedback.textContent = '';
        answers[0].focus({ preventScroll: true });
      });
    });

    answers.forEach((button) => {
      button.addEventListener('click', () => {
        if (complete) return;
        if (button.dataset.chatAnswer !== 'spread') {
          button.dataset.result = 'retry';
          feedback.textContent = button.dataset.chatAnswer === 'trend'
            ? 'A line chart is useful for trends. Think about the box and its middle line.'
            : 'The plot summarizes each group, rather than showing every observation.';
          return;
        }
        complete = true;
        button.dataset.result = 'correct';
        answers.forEach((answer) => { if (answer !== button) answer.hidden = true; });
        feedback.textContent = 'Right—the median, spread, and potential outliers within each group.';
      });
    });

    replay.addEventListener('click', () => {
      complete = false;
      blank.textContent = '____';
      blank.classList.remove('is-filled');
      followup.hidden = true;
      functions.hidden = false;
      feedback.textContent = '';
      replay.hidden = true;
      chat.querySelectorAll('[data-result]').forEach((button) => button.removeAttribute('data-result'));
      answers.forEach((button) => { button.hidden = false; });
      functions.querySelector('button').focus({ preventScroll: true });
    });
  });

})();
