// js/memorabilia-data.js — Add your Lamborghini memorabilia here
window.MEMORABILIA = [
  // Example entries — replace or add your own:
  {
    type: 'Books',
    name: 'Lamborghini: The Man Behind the Legend',
    desc: 'The definitive biography of Ferruccio Lamborghini.',
    emoji: '📚',
    image: null, // 'images/memo-book-ferruccio.jpg'
  },
  {
    type: 'Books',
    name: 'Lamborghini: The Official History',
    desc: 'Official Lamborghini factory publication covering the full model history.',
    emoji: '📚',
    image: null,
  },
  {
    type: 'Art & Prints',
    name: 'Aventador SVJ Print',
    desc: 'Limited edition automotive art print.',
    emoji: '🎨',
    image: null,
  },
  // Add more items:
  // { type: 'Clothing', name: '...', desc: '...', image: 'images/memo-shirt.jpg' },
  // { type: 'Branded Items', name: '...', desc: '...', emoji: '🐂' },
];

// ── MEMO DESCRIPTIONS ────────────────────────────────────────
// Key = slug: item name lowercase, spaces→hyphens
// e.g. "Tonino Lamborghini Watch" → "tonino-lamborghini-watch"
// Fields: short (shown above specs), long (shown below images), blocks (article-style, see README)
window.MEMO_DESCRIPTIONS = {
  // Example:
  // "tonino-lamborghini-watch": {
  //   "short": "A beautiful automatic watch from the Tonino Lamborghini brand.",
  //   "long": "Acquired in 2023 at the Museo Ferruccio Lamborghini..."
  // },
};
