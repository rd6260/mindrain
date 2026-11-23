// Blog posts migrated from the old Mind Rain website (mindrain.org/blog).
// Text, dates, categories, tags and media are kept as originally published.

export type BlogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type BlogPost = {
  slug: string;
  title: string;
  /** ISO date of original publication */
  date: string;
  categories: string[];
  tags: string[];
  /** Images shown above the text, in original order */
  topImages: BlogImage[];
  /** Plain text; wrap a phrase in *asterisks* for italics */
  paragraphs: string[];
  /** Closing credit line, rendered with links */
  credit: { text: string; links: { label: string; href: string }[] };
  /** Images shown after the text */
  bottomImages: BlogImage[];
};

const CDN = 'https://cdn.jsdelivr.net/gh/mindrain-assets/blog-assets@main';
const MEDIA = `${CDN}/on-beauty-meaning-and-identification`;

export const blogPosts: BlogPost[] = [
  {
    slug: 'on-beauty-meaning-and-identification',
    title: 'On Beauty, meaning and identification',
    date: '2016-09-14',
    categories: ['Architecture and Design', 'Uncategorized'],
    tags: [
      'aesthetics', 'Architecture', 'Architecture student', 'art and design', 'Calatrava',
      'Concept', 'Design Concept', 'Design discussion', 'design principles', 'Design students',
      'forms', 'Fran O’ Gehry', 'harmony', 'meaning in design', 'Meaningful design', 'Mind Rain',
      'music', 'Patterns', 'Philosophical design', 'Rahul Saini', 'rhythm', 'shapes',
      'shapes and forms', 'symmetry', 'tatti', 'Tatti design', 'unity',
    ],
    topImages: [
      { src: `${MEDIA}/giphy.gif`, alt: 'giphy', width: 300, height: 300 },
      {
        src: `${MEDIA}/metatrons-cube.jpg`,
        alt: 'stock-vector-metatrons-cube-platonic-solids-flower-of-life-150955103',
        width: 1200,
        height: 1280,
      },
    ],
    paragraphs: [
      'There students of design and architecture frequently suffer from this basic tiff – what is concept and meaning in design? And what does meaning really has to do with aesthetics and design? There are various ways to explain this idea but here I am only going to explain it from a very visual point of view, limiting the explanation to shapes and forms.',
      'May it be colours, sounds or shapes, human mind is intrinsically trained to perceive, analyze and ‘understand’ what it is subjected it. Colours and differentiated and ‘distincted’ and an image is formed. If it is music, various single or overlapping sounds are perceived. Patterns and rhythms are identified and ‘understood’.  I hope I am being able to make it clear here what I mean by ‘indentified’ and ‘understood’. If there is a pattern, a rhythm being followed, our brain and identify it, follow it and in turn, enjoy it. If you listen to any piece of music, may it be pop, rock or classical, you would notice this idea. (A good study or demonstration would be to pick up any song and listen to it keeping these points in mind, trying to ‘identify’ the music.)',
      'When it comes to shapes and forms, which is directly related to architecture and design, the mind follows a similar pattern of ‘understanding’ the ‘meaning’ of the form. (Please note that we are not discussion the philosophical ideas of the relationship of form and meaning here. That would be a completely different discussion.) Humans are primarily visual beings. We see and identify before we hear and understand. Whether formally trained to understand geometry or not, human mind, with its exposure to the physical environment, analyzes, understands and identifies shapes and forms – triangular – similar to the shape of a mountain, circular – similar to the shape of the sun, linear – similar to the shape of the trunk of a tree and so on. Now whenever an architect or a designer (or even an artist creating a painting or a sculpture) creates an object or a building, the human brain automatically, instinctively, starts to analyze, identify and understand it i.e. forms, shapes and proportions and identified and understood. And once that shape is ‘understood’ by the brain, it starts to make sense to it because it can identify those shapes – the shapes mean something to the brain. If the brain can not identify the shapes and the proportions of a form, it does not have meaning for the brain and therefore the form begins to appear strange or unpleasant. This, I believe, is the main reason why so many times teachers trash students’ work and in sheer irritation call it trash, garbage, useless, ugly or in our local dialect here, call it ‘totally tatti’. So when you sit down to design a form next time, I am sure you will be able to design a more aesthetically pleasing form if you keep these ideas in mind.',
      'Before I sign off, I must mention and you, as a student, must never limit yourself with this idea and follow it blindly. Along with ‘indentifying’ and ‘understanding’, human mind is also trained to evolve. Just like we enjoy listening and seeing harmony and rhythm, humans also enjoy learning. If we are always subjected to stimuli which will always give us successful identifications and predictions, then these identifications and predictions that come so easily will not really give us any pleasure but will only appear boring. Therefore, subjecting the brain to ‘novelty’, exposing it to new forms and patterns must also be encouraged. Otherwise how would Fran O’ Gehry and Santiago Calatrava have ever created the marvels they did.',
    ],
    credit: {
      text: 'This blog entry has been written for Mind Rain by Rahul Saini. To know more about him you can visit his website',
      links: [
        { label: 'www.rahul-saini.com', href: 'https://www.rahul-saini.com/' },
        { label: 'https://en.wikipedia.org/wiki/Rahul_Saini', href: 'https://en.wikipedia.org/wiki/Rahul_Saini' },
      ],
    },
    bottomImages: [{ src: `${MEDIA}/a1a.jpg`, alt: 'a1a', width: 437, height: 558 }],
  },
  {
    slug: 'on-concept-and-design-principles',
    title: 'ON CONCEPT AND DESIGN PRINCIPLES',
    date: '2016-08-30',
    categories: ['Architecture and Design'],
    tags: [
      'Architecture',
      'Architecture students',
      'art and design',
      'built environment',
      'Camera treatment',
      'Concept',
      'D.K. Ching',
      'Design Concept',
      'Design discussion',
      'design principles',
      'Film Making',
      'harmony',
      'Meaningful design',
      'Mind Rain',
      'Nil Battey Sannata',
      'Philosophical design',
      'Rahul Saini',
      'rhythm',
      'symmetry',
      'unity',
    ],
    topImages: [
      {
        src: `${CDN}/on-concept-and-design-principles/principles-of-design.jpg`,
        alt: 'Principles-of-Design-Grey-2880px',
        width: 1200,
        height: 750,
      },
    ],
    paragraphs: [
      'First year students always struggle massively with this huge enemy of theirs called, ‘THE CONCEPT’. As a teacher and a studio director, over the years, along with some exceptionally good concepts and ideas by some exceptional students, I have also been subjected to many funny, ridiculous and at times, downright irritating concepts. How a design teacher is supposed to react when a student, during a design concept submission says, “My concept for a hospital is an apple as ‘an apple a day keeps the doctor away’ means that an apple is good for health so I want to make the plan of my hospital in the shape of an apple.” But the majority of the class is smarter – they choose various design principles as their concept to play safe – unity, harmony, rhythm, symmetry, and so on. After all, all design teachers worship D.K. Ching!',
      'Using design principles is a good idea if you cannot generate a ‘philosophical’ or a ‘meaningful’ concept for your design. But one must understand what that particular design principle does to their design. They need to ask themselves is it suitable for their project? What effect does it create? And what kind of built environment does it generate? Not all design principles fit all projects. I don’t believe in giving examples in any design discussion because I feel that it gives a strong image to students and it becomes very difficult for them to break away from it. But I am going to throw a hazy example here just to make this idea clear – a museum of ‘deconstructivism’ would not speak honestly if the building is designed in perfect symmetrical harmony. (This can be one school of thought. Another can be the exact opposite of it.)',
      'Design principles are tools and the right tool should be used for the right task (read project).',
      'I will pick up an example from the field of film making to elaborate on this (as in India, we only worship Gods and Film stars). If you have seen *Nil Battey Sannata*, you must have noticed that in some scenes, it had a quite interesting visual treatment. Most of the scenes that were shot inside the house of Chanda and Apeksha, were filmed using a hand held camera. It was done so to portray the instability in their household – the father was dead, the mother was trying her best to get her daughter to study well and get good education and the daughter, a rebel, never wanted to follow what her mother wanted for her. On the other hand, most the scenes at Dr Deewan’s (Ratna Pathak Shah’s) house were shot with fixed camera portraying the stability persistent there. The camera treatment was given a serious thought in the presentation.',
      'The film makers did not use the treatments they used because they knew about them or what effects it can generate; they used them because they found them suitable for the situation and the story. And I think this understanding is crucial for all art and design students.',
    ],
    credit: {
      text: 'This blog entry has been written for Mind Rain by Rahul Saini. To know more about him you can visit his website',
      links: [{ label: 'www.rahul-saini.com', href: 'https://www.rahul-saini.com/' }],
    },
    bottomImages: [
      { src: `${CDN}/on-concept-and-design-principles/a1a.jpg`, alt: 'a1a', width: 437, height: 558 },
    ],
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

export const formatBlogDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
