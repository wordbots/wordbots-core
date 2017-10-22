export class CardTextExampleStore {
  modes = ['event', 'object'];
  examples = {
    event: [],
    object: []
  };

  getExample = (mode) => {
    const examples = this.examples[mode];
    const idx = random(0, examples.length - 1);
    const example = pullAt(examples, idx)[0];
    return `${example}.`;
  }

  loadExamples = (sentences, numToTry) => {
    const candidates = shuffle(sentences).map(capitalize).slice(0, numToTry);

    let i = 0, interval = null;

    const tryNext = () => {
      if (i >= candidates.length) {
        clearInterval(interval);
      } else {
        const candidate = candidates[i];
        if (candidate && !candidate.startsWith('"')) {
          ['event', 'object'].forEach(mode => {
            parse([candidate], mode, (idx, s, json) => {
              if (!json.error) {
                this.examples[mode].push(candidate);
              }
            }, false);
          });
        }
      }

      i++;
    };

    times(5, tryNext);
    interval = setInterval(tryNext, EXAMPLE_LOOKUP_INTERVAL_MS);
  }
}