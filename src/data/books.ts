import { Book } from "../types";

export const SAMPLE_BOOKS: Book[] = [
  {
    id: "alice-wonderland",
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    coverColor: "from-pink-500 to-indigo-600",
    coverIcon: "Sparkles",
    category: "Beginner Classics",
    difficulty: "Easy",
    reading_time: 15,
    description: "Follow Alice down the rabbit hole into a whimsical underworld of bizarre logic, talking animals, and mathematical riddles. Perfect for building reading confidence.",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: Down the Rabbit-Hole",
        content: [
          "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'",
          "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
          "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet.",
          "Burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.",
          "In another moment down went Alice after it, never once considering how in the world she was to get out again.",
          "The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.",
          "Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next."
        ]
      },
      {
        id: "chapter-2",
        title: "Chapter II: The Pool of Tears",
        content: [
          "'Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); 'now I'm opening out like the largest telescope that ever was! Good-bye, feet!' (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).",
          "'Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can; but I must be kind to them,' thought Alice, 'or perhaps they won't walk the way I want to go!'",
          "Just then her head struck against the roof of the hall: in fact she was now more than nine feet high, and she at once took up the little golden key and hurried off to the garden door."
        ]
      }
    ],
    characters: [
      {
        name: "Alice",
        role: "Main Protagonist",
        relationships: "Sister of the reader on the bank; companion to curious Wonderland creatures.",
        events: "Followed the White Rabbit down a deep hole, fell into Wonderland, and grew to nine feet tall."
      },
      {
        name: "White Rabbit",
        role: "Wonderland Guide",
        relationships: "A nervous helper, works in fear of the Queen of Hearts.",
        events: "Checked a waistcoat pocket watch, shouted that he was running late, and vanished down the tunnel."
      }
    ],
    concepts: []
  },
  {
    id: "the-metamorphosis",
    title: "The Metamorphosis",
    author: "Franz Kafka",
    coverColor: "from-amber-600 to-amber-950",
    coverIcon: "ShieldAlert",
    category: "Young Adult Classics",
    difficulty: "Challenging",
    reading_time: 25,
    description: "Gregor Samsa wakes up one morning to find himself transformed into a giant insect. A deeply symbolic and moving masterpiece on isolation and growth.",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: The Sudden Change",
        content: [
          "One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.",
          "The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved helplessly before his eyes.",
          "'What's happened to me?' he thought. It wasn't a dream. His room, a proper human room although a little too small, lay peacefully between its four familiar walls.",
          "A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame.",
          "Gregor then turned to look out the window at the dull weather. Drops of rain could be heard hitting the pane, which made him feel quite sad. 'How about if I sleep a little bit longer and forget all this nonsense', he thought."
        ]
      }
    ],
    characters: [
      {
        name: "Gregor Samsa",
        role: "Protagonist / Traveling Salesman",
        relationships: "Son of Mr. and Mrs. Samsa; brother of Grete.",
        events: "Woke up to find himself physically transformed into a giant insect. Struggled to get out of bed."
      },
      {
        name: "Grete Samsa",
        role: "Gregor's Sister",
        relationships: "Devoted sister who plays violin; eventually assumes caretaker duties.",
        events: "Knocked on Gregor's door to ask if he was unwell, expressing deep care and worry."
      }
    ],
    concepts: []
  },
  {
    id: "astronomy-basics",
    title: "A Simple Guide to Outer Space",
    author: "Dr. Elena Vance",
    coverColor: "from-blue-600 to-cyan-500",
    coverIcon: "Orbit",
    category: "Personal Growth / Science",
    difficulty: "Moderate",
    reading_time: 12,
    description: "An elegant, distraction-free introductory guide to the stars, explaining gravity, planetary orbits, and solar phenomena with absolute clarity.",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter 1: The Invisible Glue of Gravity",
        content: [
          "Have you ever wondered what keeps our feet firmly planted on the ground, or why the Moon doesn't drift off into the dark depths of outer space? The answer lies in a wonderful, invisible pull called gravity.",
          "Gravity is a fundamental force of attraction between objects. Everything that has mass—which means anything made of matter—has a gravitational pull. The more mass an object has, the stronger its gravitational pull is.",
          "This is why the Earth pulls on us so tightly: because the Earth is unbelievably massive! And this same force is what keeps the planets circling around the massive Sun in neat, predictable pathways called orbits.",
          "Imagine swinging a ball on a string in a circle. The string acts just like gravity, holding the ball near you so it can't fly away. Without this gravity, planets would float straight off into deep space."
        ]
      },
      {
        id: "chapter-2",
        title: "Chapter 2: The Dance of Solar Eclipses",
        content: [
          "A solar eclipse is one of the most stunning astronomical events you can witness from Earth. It occurs when the Moon, orbiting around us, passes directly between the Sun and our planet.",
          "When the Moon is positioned perfectly, it casts a shadow parts of the Earth. If you stand inside this primary dark shadow, called the umbra, the Moon blocks out the Sun completely, turning day into temporary twilight.",
          "If you are standing in the partial, outer shadow, called the penumbra, you see a crescent Sun. This cosmic alignment is a perfect demonstration of geometry in the stellar sky."
        ]
      }
    ],
    characters: [],
    concepts: [
      {
        term: "Gravity",
        definition: "The natural force that pulls objects toward each other, particularly down toward the center of a planet.",
        keyTerms: ["Force", "Attraction", "Mass", "Orbits"],
        examples: ["An apple falling from a tree.", "The Moon circling around Earth without drifting away."]
      },
      {
        term: "Solar Eclipse",
        definition: "A celestial event where the Moon passes between the Sun and Earth, blocking sunlight either partially or fully.",
        keyTerms: ["Umbra", "Penumbra", "Alignment", "Shadow"],
        examples: ["The Sun disappearing in the middle of the day, leaving a luminous violet corona around a dark disc."]
      },
      {
        term: "Orbit",
        definition: "The regular, curved path that a satellite, planet, or celestial body takes around another body in space.",
        keyTerms: ["Pathway", "Revolution", "Gravitational Hold"],
        examples: ["Earth traveling in its 365-day loop around the Sun.", "The International Space Station traveling around Earth."]
      }
    ]
  }
];

// Helper to estimate reading difficulty level descriptions for visual stress readers
export const DIFFICULTY_SPECS = {
  Easy: {
    badgeColor: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60",
    desc: "Short sentences, simple vocabulary. Ideal for quick decodings and lower cognitive load."
  },
  Moderate: {
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
    desc: "Standard sentence variety, occasional complex details. Comfortable pacing with concept anchors."
  },
  Challenging: {
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    desc: "Longer compound sentences, deep analytical vocabulary, or metaphorical language styles."
  }
};

// Word Assistance definitions dictionary (Simulates clicked word popups without page reload)
export const WORD_DICTIONARY: Record<string, { definition: string; pronunciation: string; example: string; simple: string }> = {
  curiouser: {
    definition: "An informal, playful variation of 'more curious', representing extreme strangeness or a sense of mounting wonder.",
    pronunciation: "kyoo-ree-uh-ser",
    simple: "Extremely unusual or getting weirder.",
    example: "The strange event made Alice cry out that things were growing 'curiouser'!"
  },
  vermin: {
    definition: "Wild animals or insects that are believed to be harmful, pests, or difficult to control.",
    pronunciation: "vur-min",
    simple: "A troublesome pest or creepy-crawly bug.",
    example: "Gregor woke to find himself turned into a huge segment of vermin."
  },
  gravity: {
    definition: "The fundamental attraction force by which terrestrial bodies tend to fall toward the center of the earth.",
    pronunciation: "grav-i-tee",
    simple: "The natural pull that holds us down onto the floor.",
    example: "Gravity is what keeps the oceans from floating off into outer space."
  },
  waistcoat: {
    definition: "A sleeveless, snug garment worn over a shirt, usually having buttons down the front (often called a vest).",
    pronunciation: "wayst-koht",
    simple: "A fancy sleeveless button-up jacket.",
    example: "The frantic White Rabbit reached into his waistcoat pocket to pull out his gold watch."
  },
  eclipse: {
    definition: "An astronomical phenomenon where one celestial body moves into the shadow of another body, blocking its light.",
    pronunciation: "ih-klips",
    simple: "When the moon covers up the sun, making daytime look dark like night.",
    example: "We wore special safety glasses to watch the beautiful solar eclipse."
  },
  curiosity: {
    definition: "A strong desire to know or learn something new; an inquisitive interest about the surrounding world.",
    pronunciation: "kyoo-ree-os-i-tee",
    simple: "Being very eager to learn or discover something.",
    example: "Burning with curiosity, she rushed out to investigate where the rabbit had gone."
  },
  metamorphosis: {
    definition: "A biological or physical transformation from an immature form to an adult form, or a major change in appearance and character.",
    pronunciation: "met-uh-mawr-fuh-sis",
    simple: "A complete physical change from one form into another, like a caterpillar turning into a butterfly.",
    example: "Gregor Samsa experienced a terrifying metamorphosis overnight."
  },
  fundamental: {
    definition: "Forming a necessary base, core rule, or central foundation of immense importance.",
    pronunciation: "fuhn-duh-men-tl",
    simple: "The most basic and important building block of something.",
    example: "Strong reading comprehension is a fundamental life skill."
  }
};
