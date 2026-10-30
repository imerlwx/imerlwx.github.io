// A local, scripted illustration of Rambler's gist-based editing interaction.
// The source tool is Lin et al., CHI 2024; this portfolio row is its diary study.
(() => {
  'use strict';
  const ideas = [
    [
      'I get my best ideas when I’m walking. Without a blank page in front of me, I can say what I’m thinking before I worry about the wording.',
      'Walking helps me find ideas and talk them through before I worry about the wording.',
      'Walking helps me think without editing.',
      'Ideas from walking.'
    ],
    [
      'When I’m back, I want to keep the ideas that matter and connect them. That gives me something to work with instead of an empty document.',
      'Back at my desk, I keep the useful ideas and connect them into a draft.',
      'Connect the useful ideas into a draft.',
      'Shape a draft.'
    ]
  ];
  const mergedIdea = [
    'Walking helps me find ideas and talk them through without worrying about the wording. Back at my desk, I pick out what matters and connect those thoughts into a draft, so I can start writing from ideas rather than a blank page.',
    'I explore ideas while walking, then connect the useful thoughts into a draft when I’m back at my desk.',
    'Speak freely on a walk, then connect the ideas into a draft.',
    'From ideas to draft.'
  ];
  const zoomNames = ['Full transcripts', 'Short summaries', 'Concise gists', 'Core ideas'];
  const spokenIdea = 'And, um, back at my desk, I want to connect the useful ideas into a draft.';

  document.querySelectorAll('[data-rambler-demo]').forEach((demo) => {
    const container = demo.querySelector('[data-ramble-ideas]');
    const controls = demo.querySelector('[data-ramble-controls]');
    const zoom = demo.querySelector('[data-ramble-zoom]');
    const merge = demo.querySelector('[data-ramble-merge]');
    const reset = demo.querySelector('[data-ramble-reset]');
    const status = demo.querySelector('[data-ramble-status]');
    const speak = demo.querySelector('[data-ramble-speak]');
    const speakLabel = demo.querySelector('[data-ramble-speak-label]');
    const utterance = demo.querySelector('[data-ramble-utterance]');
    let level = 1;
    let merged = false;
    let selected = new Set([0]);
    let changed = false;
    let dictated = false;
    let dictating = false;
    let dictationTimers = [];
    const clearDictation = () => {
      dictationTimers.forEach(clearTimeout);
      dictationTimers = [];
      dictating = false;
      demo.classList.remove('is-dictating');
      speak.disabled = false;
      speakLabel.textContent = dictated ? 'Replay' : 'Speak an idea';
      utterance.removeAttribute('aria-hidden');
    };

    const addText = (element, text) => {
      const pieces = text.split(/\b(walking|ideas|draft|wording)\b/gi);
      pieces.forEach((piece, index) => {
        if (index % 2 === 0) element.append(document.createTextNode(piece));
        else {
          const keyword = document.createElement('mark');
          keyword.textContent = piece;
          element.append(keyword);
        }
      });
    };
    const updateControls = () => {
      merge.disabled = dictating || (!merged && (!dictated || selected.size !== 2));
      merge.innerHTML = merged ? 'Split ideas <span aria-hidden="true">↙</span>' : 'Merge ideas <span aria-hidden="true">↗</span>';
      reset.hidden = !changed;
      demo.dataset.merged = String(merged);
      demo.dataset.zoom = String(level);
      demo.dataset.dictated = String(dictated);
      zoom.value = String(level);
      zoom.disabled = dictating;
      zoom.setAttribute('aria-valuetext', zoomNames[level]);
      container.querySelectorAll('input').forEach((checkbox) => { checkbox.disabled = dictating; });
    };
    const render = () => {
      container.replaceChildren();
      const texts = merged ? [mergedIdea[level]] : ideas.slice(0, dictated ? 2 : 1).map((versions) => versions[level]);
      texts.forEach((text, index) => {
        const card = document.createElement(merged ? 'div' : 'label');
        card.className = `ramble-card${merged ? ' is-merged' : selected.has(index) ? ' is-selected' : ''}`;
        if (!merged) {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = selected.has(index);
          checkbox.setAttribute('aria-label', `Select ${index === 0 ? 'first' : 'second'} idea`);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) selected.add(index);
            else selected.delete(index);
            changed = true;
            card.classList.toggle('is-selected', checkbox.checked);
            status.textContent = !dictated ? 'Use the speech input to add another idea.' : selected.size === 2 ? 'Both ideas selected. Ready to merge.' : 'Select both ideas to merge them.';
            updateControls();
          });
          card.append(checkbox);
        }
        const paragraph = document.createElement('p');
        addText(paragraph, text);
        card.append(paragraph);
        container.append(card);
      });
      updateControls();
    };
    zoom.addEventListener('input', () => {
      level = Number(zoom.value);
      changed = true;
      render();
      status.textContent = `${zoomNames[level]}. ${merged ? 'One merged idea.' : 'Two separate ideas.'}`;
    });
    merge.addEventListener('click', () => {
      if (dictating || (!merged && (!dictated || selected.size !== 2))) return;
      merged = !merged;
      changed = true;
      if (!merged) selected = new Set([0, 1]);
      render();
      status.textContent = merged ? 'The two ideas are connected into one passage.' : 'The passage is split back into two ideas.';
    });
    reset.addEventListener('click', () => {
      clearDictation();
      level = 1; merged = false; selected = new Set([0]); changed = false; dictated = false;
      utterance.hidden = true; utterance.textContent = ''; utterance.removeAttribute('aria-hidden');
      speakLabel.textContent = 'Speak an idea';
      render();
      status.textContent = 'Writing example restarted.';
      speak.focus({ preventScroll: true });
    });
    speak.addEventListener('click', () => {
      clearDictation();
      dictating = true; changed = true;
      speak.disabled = true; speakLabel.textContent = 'Speaking…';
      utterance.hidden = false; utterance.textContent = ''; utterance.setAttribute('aria-hidden', 'true');
      demo.classList.add('is-dictating');
      status.textContent = 'A spoken idea is being dictated.';
      updateControls();
      const finish = () => {
        clearDictation();
        utterance.textContent = `“${spokenIdea}”`;
        utterance.removeAttribute('aria-hidden');
        if (!dictated) { dictated = true; selected.add(1); }
        speakLabel.textContent = 'Replay';
        render();
        status.textContent = 'Speech captured and cleaned into an idea. Select both ideas to merge them, or use the slider to change the level of detail.';
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
      const words = spokenIdea.split(' ');
      words.forEach((word, index) => {
        dictationTimers.push(setTimeout(() => {
          utterance.textContent = `“${words.slice(0, index + 1).join(' ')}”`;
        }, index * 75));
      });
      dictationTimers.push(setTimeout(finish, words.length * 75 + 250));
    });
    window.addEventListener('pagehide', () => { clearDictation(); updateControls(); });
    demo.querySelector('[data-ramble-speech]').hidden = false;
    controls.hidden = false;
    render();
  });
})();
