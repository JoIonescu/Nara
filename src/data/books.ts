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
    ageGroup: "Kids",
    coverUrl: "https://covers.openlibrary.org/b/id/11186835-M.jpg",
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
    ageGroup: "Adults",
    coverUrl: "https://covers.openlibrary.org/b/id/12833076-M.jpg",
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
    ageGroup: "Teens",
    coverUrl: "https://covers.openlibrary.org/b/id/8308253-M.jpg",
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
  },
  {
    id: "pride-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    coverColor: "from-teal-600 to-emerald-800",
    coverIcon: "Heart",
    category: "Beginner Classics",
    difficulty: "Moderate",
    reading_time: 20,
    description: "A brilliant, witty comedy of manners centered on Elizabeth Bennet and Mr. Darcy as they overcome biased first impressions in 19th-century England.",
    ageGroup: "Teens",
    coverUrl: "https://covers.openlibrary.org/b/id/12693897-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: A Truth Universally Acknowledged",
        content: [
          "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
          "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
          "'My dear Mr. Bennet,' said his lady to him one day, 'have you heard that Netherfield Park is let at last?'",
          "Mr. Bennet replied that he had not.",
          "'But it is,' returned she; 'for Mrs. Long has just been here, and she told me all about it.' Mr. Bennet made no answer."
        ]
      }
    ],
    characters: [
      {
        name: "Elizabeth Bennet",
        role: "Main Protagonist",
        relationships: "Second Bennet daughter. Highly observant and independent.",
        events: "Encountered the proud Mr. Darcy and initially formed a strong dislike towards him."
      },
      {
        name: "Mr. Darcy",
        role: "Noble Suitor",
        relationships: "Wealthy estate owner; friend of Mr. Bingley.",
        events: "Declined to dance with Elizabeth Bennet at the ball, earning her prolonged resentment."
      }
    ],
    concepts: []
  },
  {
    id: "the-secret-garden",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    coverColor: "from-green-500 to-amber-700",
    coverIcon: "Sprout",
    category: "Young Adult Classics",
    difficulty: "Easy",
    reading_time: 18,
    description: "Mary Lennox discovers a hidden, locked garden on her uncle's Yorkshire estate and unlocks healing, friendship, and wonders.",
    ageGroup: "Kids",
    coverUrl: "https://covers.openlibrary.org/b/id/10419266-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: There Is No One Left",
        content: [
          "When Mary Lennox was sent to Misselthwaite Manor to live with her uncle everybody said she was the most disagreeable-looking child ever seen.",
          "It was true, too. She had a little thin face and a little thin body, thin light hair and a sour expression.",
          "Her hair was yellow, and her face was yellow because she had been born in India and had always been ill in one way or another.",
          "Her father had held a position under the English Government and had always been busy and ill himself, and her mother had been a great beauty who cared only to go to parties.",
          "So, when she was born, she was handed over to an Ayah, who was made to understand that if she wished to please the Mem Sahib she must keep the child out of sight as much as possible."
        ]
      }
    ],
    characters: [
      {
        name: "Mary Lennox",
        role: "Protagonist",
        relationships: "Orphaned niece of Archibald Craven, initially sour and lonely.",
        events: "Survived an epidemic in India and was transported to the vast, windswept Yorkshire moors."
      }
    ],
    concepts: []
  },
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    coverColor: "from-neutral-700 to-slate-900",
    coverIcon: "Flame",
    category: "Personal Growth / Science",
    difficulty: "Challenging",
    reading_time: 30,
    description: "A brilliant young scientist, Victor Frankenstein, creates an intelligent, towering creature in an unorthodox scientific experiment, with tragic consequences.",
    ageGroup: "Adults",
    coverUrl: "https://covers.openlibrary.org/b/id/12818862-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: The Spark of Life",
        content: [
          "It was on a dreary night of November that I beheld the accomplishment of my toils.",
          "With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.",
          "It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open.",
          "It breathed hard, and a convulsive motion agitated its limbs.",
          "How can I describe my emotions at this catastrophe, or how delineate the wretch whom with such infinite pains and care I had endeavoured to form?"
        ]
      }
    ],
    characters: [
      {
        name: "Victor Frankenstein",
        role: "Obsessive Creator",
        relationships: "Scientist fascinated by natural philosophy and life's secrets.",
        events: "Spent months gathering biological components to bring a custom-made giant creature to life."
      },
      {
        name: "The Creature",
        role: "The Creation",
        relationships: "Cast out rejected creation of Victor Frankenstein, seeking human contact.",
        events: "Opened a single dull yellow eye, breathed deeply, and terrified its creator on a rainy night."
      }
    ],
    concepts: []
  },
  {
    id: "sherlock-holmes",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    coverColor: "from-blue-800 to-indigo-950",
    coverIcon: "Search",
    category: "Young Adult Classics",
    difficulty: "Moderate",
    reading_time: 22,
    description: "Super-sleuth Sherlock Holmes and Dr. Watson decode bizarre clues, dark shadows, and complex mind towers in Victorian London.",
    ageGroup: "Teens",
    coverUrl: "https://covers.openlibrary.org/b/id/12739343-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: The Red-Headed League",
        content: [
          "I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.",
          "With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.",
          "'You could not possibly have come at a better time, my dear Watson,' he said cordially.",
          "The stout gentleman half rose from his chair and gave a bob of greeting, with a quick little questioning glance from his small fat-encircled eyes."
        ]
      }
    ],
    characters: [
      {
        name: "Sherlock Holmes",
        role: "Consulting Detective",
        relationships: "Close friend and roommate of Dr. John Watson.",
        events: "Analyzed the red-headed visitor and deduced his previous history from subtle stains and symbols on his sleeve."
      },
      {
        name: "Dr. John Watson",
        role: "Biographer & Assistant",
        relationships: "Trusted colleague of Sherlock Holmes.",
        events: "Observed Holmes's investigative methods with consistent marvel and documented the cases."
      }
    ],
    concepts: []
  },
  {
    id: "peter-pan",
    title: "Peter Pan",
    author: "J. M. Barrie",
    coverColor: "from-green-600 to-teal-900",
    coverIcon: "Wind",
    category: "Beginner Classics",
    difficulty: "Easy",
    reading_time: 12,
    description: "Fly away with Peter Pan, Wendy, and Tinker Bell to Neverland, where children never grow up and adventure awaits around every corner.",
    ageGroup: "Kids",
    coverUrl: "https://covers.openlibrary.org/b/id/10543232-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: Peter Breaks Through",
        content: [
          "All children, except one, grow up. They soon know that they will grow up, and the way Wendy knew was this.",
          "One day when she was two years old she was playing in a garden, and she plucked another flower and ran with it to her mother. I suppose she must have looked rather delightful, for Mrs. Darling put her hand to her heart and cried, 'Oh, why can't you remain like this forever!'",
          "This was all that passed between them on the subject, but henceforth Wendy knew that she must grow up. You always know after you are two. Two is the beginning of the end."
        ]
      }
    ],
    characters: [
      {
        name: "Peter Pan",
        role: "The Boy Who Wouldn't Grow Up",
        relationships: "Leader of the Lost Boys; friend to Wendy and Tinker Bell.",
        events: "Flew into the Darling nursery in search of his lost shadow."
      },
      {
        name: "Wendy Darling",
        role: "Nursery Companion",
        relationships: "Eldest sister of John and Michael Darling.",
        events: "Sewed Peter Pan's shadow back onto his feet."
      }
    ],
    concepts: []
  },
  {
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    coverColor: "from-purple-800 to-violet-950",
    coverIcon: "Hourglass",
    category: "Personal Growth / Science",
    difficulty: "Challenging",
    reading_time: 20,
    description: "A Victorian inventor builds a vehicle that projects him into the year 802,701, where he discovers two strangely evolved branches of humanity.",
    ageGroup: "Adults",
    coverUrl: "https://covers.openlibrary.org/b/id/10667945-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: The Time Traveller's Machine",
        content: [
          "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.",
          "The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.",
          "'I want you to clearly understand,' he said, 'that any real body must have extension in four directions: it must have Length, Breadth, Thickness, and—Duration.'"
        ]
      }
    ],
    characters: [
      {
        name: "The Time Traveller",
        role: "Inventor & Explorer",
        relationships: "Expounder of temporal travel laws to Victorian listeners.",
        events: "Constructed a complex device of brass and ivory designed to move through time."
      }
    ],
    concepts: []
  },
  {
    id: "the-little-prince",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
    coverColor: "from-amber-400 to-orange-600",
    coverIcon: "Sun",
    category: "Beginner Classics",
    difficulty: "Easy",
    reading_time: 10,
    description: "An aviator stranded in the Sahara meets a small young prince from an asteroid who shares cosmic wisdom on things of true value.",
    ageGroup: "Kids",
    coverUrl: "https://covers.openlibrary.org/b/id/12711019-M.jpg",
    chapters: [
      {
        id: "chapter-1",
        title: "Chapter I: The Pilot and the Little Prince",
        content: [
          "Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal.",
          "I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them. But they answered: 'Frighten? Why should anyone be frightened by a hat?'",
          "My drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of the boa constrictor."
        ]
      }
    ],
    characters: [
      {
        name: "The Little Prince",
        role: "Celestial Traveler",
        relationships: "Visitor from Asteroid B-612.",
        events: "Asked the narrator to draw a sheep, displaying high curiosity."
      },
      {
        name: "The Narrator",
        role: "Stranded Aviator",
        relationships: "Friend of the Little Prince in the desert.",
        events: "Attempted to repair his airplane engine while discussing drawing and roses."
      }
    ],
    concepts: []
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
    pronunciation: "met-uh-mawr-huf-sis",
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
