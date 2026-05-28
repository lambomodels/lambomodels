// js/blog-data.js — Edit this file to add blog posts
// Add new posts to the TOP of the array (newest first)
//
// IMAGE NAMING:
// Preview image (card + homepage): images/blog-POSTID.png (or .jpg/.webp)
//
// CONTENT BLOCKS — instead of a plain 'content' string, use 'blocks' array:
// Each block is one of:
//   { type: 'text',    text: 'paragraph text here' }
//   { type: 'heading', text: 'Section Heading' }
//   { type: 'image',   src: 'images/my-photo.jpg', caption: 'Optional caption' }
//   { type: 'images',  srcs: ['img1.jpg','img2.jpg','img3.jpg'], caption: 'Optional' }
//   { type: 'quote',   text: 'A quote or highlight', author: 'Optional attribution' }
//   { type: 'divider' }
//
// You can mix blocks freely: text → image → text → images → etc.
// The old 'content' string (with \n for paragraphs) still works as a fallback.
//
window.BLOG_POSTS = [
  {
    id: 'santagata-2024',
    date: 'October 2024',
    title: 'Third Time in Sant\'Agata Bolognese',
    emoji: '🐂',
    excerpt: 'My third visit to the birthplace of Lamborghini — the factory, the museum, the 300th model milestone, and a chance encounter with Tonino Lamborghini himself.',
    // Use blocks for rich layout:
    blocks: [
      { type: 'text', text: 'My third trip to Sant\'Agata Bolognese. The town that started it all.' },
      { type: 'text', text: 'Every time I make this journey it feels different, and this time was no exception. I came back with the 299th and 300th models — a Urus from the factory shop and a Urus SE from Looksmart — and somehow ended up meeting Tonino Lamborghini at an event nearby.' },
      // { type: 'image', src: 'images/blog-santagata-2024-factory.jpg', caption: 'Outside the factory gates' },
      { type: 'text', text: 'The museum is still the best place on earth for anyone who cares about these cars. Standing in front of the original Miura P400 prototype, knowing I have eighteen Miuras in my collection back home, is a feeling I can\'t really put into words.' },
      // { type: 'images', srcs: ['images/blog-santagata-miura.jpg','images/blog-santagata-museum.jpg'], caption: 'Inside the museum' },
    ],
  },
  {
    id: 'collection-milestones',
    date: 'January 2025',
    title: '300 Models and Counting',
    emoji: '🏆',
    excerpt: 'The collection officially crossed 300 scale models. Here\'s a look back at the journey, the first model, and where the empire is heading.',
    blocks: [
      { type: 'text', text: 'Three hundred models. When I got my first Lamborghini scale model — a Bburago Diablo in yellow — I had no idea it would become this.' },
      { type: 'quote', text: 'The 300th model was a Urus SE by Looksmart, acquired in Sant\'Agata Bolognese. It felt right that the milestone happened there.' },
      { type: 'text', text: 'The collection now spans every era of Lamborghini history, from the 1963 350 GTV to the brand-new Temerario. Every category. Every scale. Every affiliated brand. The empire is very much ongoing.' },
    ],
  },
  {
    id: 'revuelto-news',
    date: 'December 2024',
    title: 'The Revuelto\'s Short Life',
    emoji: '⚡',
    excerpt: 'Credible insider info suggests the Revuelto will end production around 2027 with no Roadster variant — and a successor arriving 2028. What this means for collectors.',
    blocks: [
      { type: 'text', text: 'According to credible insider sources (Varryx), the Revuelto appears to be heading for an unusually short production lifecycle, wrapping up around 2027 with no Roadster variant planned.' },
      { type: 'text', text: 'A successor — presumably a fully hybrid or PHEV V12 replacement — is expected around 2028.' },
      { type: 'quote', text: 'A short-run flagship with no roadster means the variants are finite, and they\'re already rare by design.' },
      { type: 'text', text: 'I currently have one Revuelto in the collection (Bburago 1:24 in orange). I expect that shelf to grow.' },
    ],
  },
];

