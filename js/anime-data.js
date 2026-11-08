/**
 * ANIMEVERSE — Curated Collection Data
 * Organised across the Dualistic Spectrum: Eclipse (Abyss) -> Twilight (Liminal) -> Elysium (Sunrise)
 */
const ANIME_COLLECTION = [
  {
    id: "aot",
    title: "Attack on Titan",
    japaneseTitle: "進撃の巨人",
    romaji: "Shingeki no Kyojin",
    spectrum: "eclipse",
    darknessScore: 98,
    rating: 9.9,
    rank: 1,
    year: "2013–2023",
    studio: "WIT Studio / MAPPA",
    episodes: "89 Episodes + Specials",
    genres: ["Dark Fantasy", "Psychological", "Military", "Action", "Mystery"],
    poster: "assets/images/posters/aot.jpg",
    banner: "assets/images/eren_yeager.jpg",
    tagline: "The devastating weight of freedom and deterministic sacrifice.",
    synopsis: "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide behind enormous concentric walls. Eren Yeager, driven by personal tragedy and an unyielding desire for freedom, vows to eradicate every Titan — only to discover that the greatest enemy may lie within human nature itself.",
    philosophy: "Is true freedom attainable without sacrificing humanity? Eren Yeager embodies the extreme paradox of determinism: a warrior chained by his own future memories, waging apocalyptic warfare in a tragic pursuit of absolute liberation.",
    quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win. Tatakae.",
    quoteAuthor: "Eren Yeager",
    scores: {
      tragedy: 99,
      hope: 25,
      psychology: 96,
      philosophy: 98
    },
    characters: [
      { name: "Eren Yeager", role: "Protagonist / Attack Titan", quote: "I will keep moving forward until my enemies are destroyed." },
      { name: "Levi Ackerman", role: "Captain / Humanity's Strongest", quote: "Give up on your dreams and die for us." },
      { name: "Armin Arlert", role: "Commander / Colossal Titan", quote: "Someone who cannot abandon anything cannot achieve anything." }
    ]
  },
  {
    id: "deathnote",
    title: "Death Note",
    japaneseTitle: "デスノート",
    romaji: "Desu Nōto",
    spectrum: "eclipse",
    darknessScore: 92,
    rating: 9.7,
    rank: 4,
    year: "2006–2007",
    studio: "Madhouse",
    episodes: "37 Episodes",
    genres: ["Psychological", "Supernatural", "Thriller", "Mystery"],
    poster: "assets/images/posters/deathnote.jpg",
    banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    tagline: "The intoxicating descent from righteous justice to god-complex tyranny.",
    synopsis: "Light Yagami, an exceptionally brilliant high school student, stumbles upon a notebook dropped by a Shinigami named Ryuk. Any person whose name is written in it dies. Light embarks on a crusade to eliminate criminals and rule as the god of a pristine new world, instigating a cat-and-mouse mental duel with the enigmatic detective L.",
    philosophy: "Does supreme moral authority inevitably corrupt? Death Note dissects utilitarian justice, moral relativism, and the seductive danger of an individual playing arbiter of life and death.",
    quote: "I am the God of the New World.",
    quoteAuthor: "Light Yagami",
    scores: {
      tragedy: 88,
      hope: 20,
      psychology: 99,
      philosophy: 94
    },
    characters: [
      { name: "Light Yagami", role: "Kira", quote: "In this world, there are very few people who actually trust each other." },
      { name: "L Lawliet", role: "World's Greatest Detective", quote: "No matter how gifted you are... you alone cannot change the world." },
      { name: "Ryuk", role: "Shinigami", quote: "Humans are so interesting!" }
    ]
  },
  {
    id: "parasyte",
    title: "Parasyte: The Maxim",
    japaneseTitle: "寄生獣 セイの格率",
    romaji: "Kiseijū: Sei no Kakuritsu",
    spectrum: "eclipse",
    darknessScore: 86,
    rating: 9.5,
    rank: 6,
    year: "2014–2015",
    studio: "Madhouse",
    episodes: "24 Episodes",
    genres: ["Sci-Fi", "Body Horror", "Psychological", "Action"],
    poster: "assets/images/posters/parasyte.jpg",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    tagline: "A visceral inquiry into human empathy and biological survival.",
    synopsis: "When alien parasitic organisms invade Earth, burrowing into human skulls to take over minds and flesh, 17-year-old Shinichi Izumi wakes up to find a parasite failed to take his brain and instead matured into his right hand, calling itself Migi. Together, human and parasite must survive hostile fellow predators while Shinichi struggles not to lose his humanity.",
    philosophy: "What truly defines humanity? Through the cold, objective logic of Migi juxtaposed with Shinichi's grief, Parasyte investigates whether humans are fundamentally different from parasitic monsters or simply another organism consuming the biosphere.",
    quote: "Upon researching the concept of demons, I believe that, among all life, humans are the closest thing to it.",
    quoteAuthor: "Migi",
    scores: {
      tragedy: 85,
      hope: 45,
      psychology: 93,
      philosophy: 95
    },
    characters: [
      { name: "Shinichi Izumi", role: "Host / High Schooler", quote: "We are all born here... we just live and we die." },
      { name: "Migi", role: "Right-hand Parasite", quote: "Shinichi, upon investigating the concept of sadness, I found it illogical." },
      { name: "Reiko Tamura", role: "Philosopher Parasite", quote: "Humans and parasites are one family. We are the children of mankind." }
    ]
  },
  {
    id: "jjk",
    title: "Jujutsu Kaisen",
    japaneseTitle: "呪術廻戦",
    romaji: "Jujutsu Kaisen",
    spectrum: "eclipse",
    darknessScore: 80,
    rating: 9.4,
    rank: 7,
    year: "2020–Present",
    studio: "MAPPA",
    episodes: "47 Episodes + Movie",
    genres: ["Supernatural", "Dark Fantasy", "Action", "Shonen"],
    poster: "assets/images/posters/jjk.jpg",
    banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
    tagline: "Negative emotions given physical form, and the burden of proper death.",
    synopsis: "Unleashing the ancient King of Curses Ryomen Sukuna by swallowing a rotting talisman finger, high schooler Yuji Itadori enters Tokyo Jujutsu High. Bound to sorcery, he enters an unforgiving world where negative human malice manifests as deadly cursed spirits.",
    philosophy: "What is a 'proper death'? Jujutsu Kaisen explores the toll of self-sacrifice, existential nihilism, and the heavy price of bearing curses for others without expectation of salvation.",
    quote: "Throughout heaven and earth, I alone am the honored one.",
    quoteAuthor: "Satoru Gojo",
    scores: {
      tragedy: 82,
      hope: 48,
      psychology: 85,
      philosophy: 84
    },
    characters: [
      { name: "Yuji Itadori", role: "Vessel of Sukuna", quote: "I don't want to regret the way I lived." },
      { name: "Satoru Gojo", role: "Special Grade Sorcerer", quote: "Dying to win and risking death to win are completely different." },
      { name: "Ryomen Sukuna", role: "King of Curses", quote: "Stand proud. You are strong." }
    ]
  },
  {
    id: "codegeass",
    title: "Code Geass: Lelouch of the Rebellion",
    japaneseTitle: "コードギアス 反逆のルルーシュ",
    romaji: "Kōdo Giasu",
    spectrum: "twilight",
    darknessScore: 65,
    rating: 9.8,
    rank: 3,
    year: "2006–2008",
    studio: "Sunrise",
    episodes: "50 Episodes + Movies",
    genres: ["Mecha", "Military", "Psychological", "Sci-Fi", "Drama"],
    poster: "assets/images/posters/codegeass.jpg",
    banner: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    tagline: "The Machiavellian sacrifice: turning oneself into the world's hatred.",
    synopsis: "In an alternate timeline where the Holy Britannian Empire conquered Japan (renamed Area 11), exiled Britannian prince Lelouch vi Britannia obtains 'Geass' — the power of absolute obedience. Donning the mask of Zero, he orchestrates a revolution that culminates in the legendary Zero Requiem.",
    philosophy: "Can ends justify sinister means? Lelouch personifies the ultimate tragic martyr: a strategist who becomes the villain so the entire world can unite and walk into a peaceful dawn.",
    quote: "The only ones who should kill are those who are prepared to be killed.",
    quoteAuthor: "Lelouch vi Britannia",
    scores: {
      tragedy: 80,
      hope: 78,
      psychology: 95,
      philosophy: 97
    },
    characters: [
      { name: "Lelouch vi Britannia", role: "Zero / Emperor", quote: "I destroy worlds... and create worlds." },
      { name: "Suzaku Kururugi", role: "Knight of Seven", quote: "A victory obtained through dishonest means is no victory at all." },
      { name: "C.C.", role: "Immortal Witch", quote: "False tears bring pain to others. A false smile brings pain to yourself." }
    ]
  },
  {
    id: "steinsgate",
    title: "Steins;Gate",
    japaneseTitle: "シュタインズ・ゲート",
    romaji: "Shutainzu Gēto",
    spectrum: "twilight",
    darknessScore: 50,
    rating: 9.9,
    rank: 2,
    year: "2011",
    studio: "White Fox",
    episodes: "24 Episodes + OVA",
    genres: ["Sci-Fi", "Psychological", "Time Travel", "Thriller", "Drama"],
    poster: "assets/images/posters/steinsgate.jpg",
    banner: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=1200&q=80",
    tagline: "Causality, convergence, and the unbearable agony of observing infinite deaths.",
    synopsis: "Eccentric self-proclaimed 'mad scientist' Rintaro Okabe accidentally invents a microwave that can send text messages into the past. As his alterations fracture causality and attract lethal conspiracies, Okabe finds himself in an agonizing psychological loop, fighting convergence lines to save those he loves.",
    philosophy: "Fate versus free will. Steins;Gate stands as the quintessential twilight narrative: transitioning from innocent banter to psychological torment, then ultimately breaking deterministic destiny through intellect, love, and courage.",
    quote: "No one knows what the future holds. That's why its potential is infinite.",
    quoteAuthor: "Rintaro Okabe",
    scores: {
      tragedy: 75,
      hope: 90,
      psychology: 98,
      philosophy: 96
    },
    characters: [
      { name: "Rintaro Okabe", role: "Hououin Kyouma", quote: "Deceive your other self. Deceive the world. That is what you must do to reach the Steins Gate." },
      { name: "Kurisu Makise", role: "Neuroscientist", quote: "Time is passing so fast. Right now, I feel like wishing time would stop forever." },
      { name: "Mayuri Shiina", role: "Lab Member 002", quote: "Tuturu~!" }
    ]
  },
  {
    id: "cote",
    title: "Classroom of the Elite",
    japaneseTitle: "ようこそ実力至上主義の教室へ",
    romaji: "Yōkoso Jitsuryoku Shijō Shugi no Kyōshitsu e",
    spectrum: "twilight",
    darknessScore: 48,
    rating: 9.1,
    rank: 9,
    year: "2017–2024",
    studio: "Lerche",
    episodes: "38 Episodes",
    genres: ["Psychological", "Drama", "School", "Mystery"],
    poster: "assets/images/posters/cote.jpg",
    banner: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    tagline: "Cold meritocracy and viewing humanity purely as disposable pawns.",
    synopsis: "Tokyo Metropolitan Advanced Nurturing High School guarantees 100% employment or university entrance to its graduates, but only the elite Class A receives true privilege. Kiyotaka Ayanokoji quietly resides in Class D, hiding his genius intellect and calculating detachment while manipulating students and teachers like chess pieces.",
    philosophy: "Is equality a myth? The series explores social Darwinism, psychological manipulation, and the haunting reality of someone raised solely for cognitive dominance who perceives humans as tools.",
    quote: "All people are nothing but tools. It doesn't matter how its done. It doesn't matter what needs to be sacrificed. In this world, winning is everything.",
    quoteAuthor: "Kiyotaka Ayanokoji",
    scores: {
      tragedy: 50,
      hope: 55,
      psychology: 94,
      philosophy: 86
    },
    characters: [
      { name: "Kiyotaka Ayanokoji", role: "Mastermind / White Room Survivor", quote: "As long as I win in the end... that's all that matters." },
      { name: "Suzune Horikita", role: "Class D Leader", quote: "I will make it to Class A on my own merits." },
      { name: "Kakeru Ryuen", role: "Class C Tyrant", quote: "Fear is the only true way to control fools." }
    ]
  },
  {
    id: "sakamoto",
    title: "Sakamoto Days",
    japaneseTitle: "サカモトデイズ",
    romaji: "Sakamoto Deizu",
    spectrum: "elysium",
    darknessScore: 35,
    rating: 9.2,
    rank: 8,
    year: "2025",
    studio: "TMS Entertainment",
    episodes: "Upcoming / Airing",
    genres: ["Action", "Comedy", "Shonen", "Martial Arts"],
    poster: "assets/images/posters/sakamoto.png",
    banner: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
    tagline: "From legendary assassin to humble convenience store clerk protecting his family.",
    synopsis: "Taro Sakamoto was once revered as the ultimate hitman, feared by villains and assassins everywhere. Then he fell in love, retired, got married, had a child, gained weight, and opened a convenience store! But when the criminal underworld comes knocking, Sakamoto defends his peaceful life without breaking his golden vow: never kill again.",
    philosophy: "The true measure of strength is restraint. Sakamoto demonstrates how a warrior can put down lethal violence to cultivate love, domestic warmth, and protect innocent life.",
    quote: "I promised my wife I'd never kill again. So you're just getting knocked out.",
    quoteAuthor: "Taro Sakamoto",
    scores: {
      tragedy: 20,
      hope: 92,
      psychology: 70,
      philosophy: 82
    },
    characters: [
      { name: "Taro Sakamoto", role: "Retired Hitman / Store Owner", quote: "Family is everything. Anyone who threatens that is going through a wall." },
      { name: "Shin Asakura", role: "Telepathic Clerk", quote: "Boss! I can read their thoughts, but you're already three moves ahead!" },
      { name: "Lu Shaotang", role: "Tai Chi Master", quote: "Eat first, fight later!" }
    ]
  },
  {
    id: "blackclover",
    title: "Black Clover",
    japaneseTitle: "ブラッククローバー",
    romaji: "Burakku Kurōbā",
    spectrum: "elysium",
    darknessScore: 25,
    rating: 9.0,
    rank: 10,
    year: "2017–2021",
    studio: "Pierrot",
    episodes: "170 Episodes + Movie",
    genres: ["Action", "Fantasy", "Shonen", "Magic"],
    poster: "assets/images/posters/blackclover.png",
    banner: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    tagline: "Born without a drop of magic in a world where magic is status. Never giving up.",
    synopsis: "In the Clover Kingdom, everyone is born with magical power except Asta, an orphan who trains his physical body tirelessly. When he receives a mysterious five-leaf grimoire containing Anti-Magic swords, he sets out alongside his gifted rival Yuno to become the Wizard King, inspiring everyone from royal knights to downtrodden peasants.",
    philosophy: "Perseverance over genetic privilege. Black Clover radiates unyielding optimism: determination and grit can shatter class discrimination and despair.",
    quote: "My magic is never giving up!",
    quoteAuthor: "Asta",
    scores: {
      tragedy: 35,
      hope: 96,
      psychology: 68,
      philosophy: 80
    },
    characters: [
      { name: "Asta", role: "Black Bull / Anti-Magic Knight", quote: "Even if I'm not chosen, I will keep swinging!" },
      { name: "Yuno Grinberryall", role: "Golden Dawn Prodigy", quote: "Asta is my rival. I won't let him surpass me." },
      { name: "Yami Sukehiro", role: "Black Bulls Captain", quote: "Surpass your limits. Right here, right now." }
    ]
  },
  {
    id: "opm",
    title: "One Punch Man",
    japaneseTitle: "ワンパンマン",
    romaji: "Wanpanman",
    spectrum: "elysium",
    darknessScore: 15,
    rating: 9.4,
    rank: 5,
    year: "2015–Present",
    studio: "Madhouse / J.C.Staff",
    episodes: "24 Episodes + OVAs",
    genres: ["Action", "Comedy", "Superhero", "Satire"],
    poster: "assets/images/posters/opm.jpg",
    banner: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80",
    tagline: "The philosophical ennui of ultimate power, grounded by pure comedic humility.",
    synopsis: "Saitama trained so vigorously that his hair fell out and he can defeat literally any foe with a single punch. Finding zero thrill in combat and suffering an existential crisis of boredom, he navigates the Hero Association for groceries and purpose, remaining the most unpretentious hero in anime history.",
    philosophy: "The satirical deconstruction of omnipotence. Saitama proves that ultimate strength does not bring happiness; true heroism is doing good for its own sake, indifferent to praise or recognition.",
    quote: "I'm just a guy who's a hero for fun.",
    quoteAuthor: "Saitama",
    scores: {
      tragedy: 10,
      hope: 95,
      psychology: 75,
      philosophy: 88
    },
    characters: [
      { name: "Saitama", role: "Caped Baldy / The Strongest", quote: "Human beings are strong because we have the ability to change ourselves." },
      { name: "Genos", role: "Demon Cyborg / Disciple", quote: "Master Saitama's power is limitless and incomprehensible." },
      { name: "King", role: "S-Class Rank 7 / Engine of Truth", quote: "You have to accept reality and move forward, Saitama-shi." }
    ]
  },
  {
    id: "vinland",
    title: "Vinland Saga",
    japaneseTitle: "ヴィンランド・サガ",
    romaji: "Vinrando Saga",
    spectrum: "elysium",
    darknessScore: 8,
    rating: 9.9,
    rank: 1,
    year: "2019–2023",
    studio: "WIT Studio / MAPPA",
    episodes: "48 Episodes",
    genres: ["Historical", "Seinen", "Drama", "Philosophy", "Action"],
    poster: "assets/images/posters/vinland.jpg",
    banner: "assets/images/thorfinn.jpg",
    tagline: "The profound metamorphosis from bloody vengeance to transcendent compassion.",
    synopsis: "Raised on Viking battlefields following the murder of his father Thors, young Thorfinn consumed his youth obsessed with vengeance against Askeladd. After losing his life's sole violent purpose, Season 2 (Farmland Arc) traces Thorfinn's profound rebirth as a slave learning repentance, kindness, agriculture, and the staggering courage needed to forge peace without a blade.",
    philosophy: "The ultimate climax of anime philosophy. A true warrior needs no sword. True courage is not slaughtering adversaries, but stepping past centuries of bloodshed to declare with pure conviction: 'I have no enemies.'",
    quote: "You have no enemies. No one has any enemies. There is no one in this world that you should hurt.",
    quoteAuthor: "Thors / Thorfinn Karlsefni",
    scores: {
      tragedy: 85,
      hope: 99,
      psychology: 99,
      philosophy: 100
    },
    characters: [
      { name: "Thorfinn Karlsefni", role: "Former Warrior / Peacemaker", quote: "I will build a land of peace where no one needs a sword. I have no enemies." },
      { name: "Thors Snorresson", role: "The True Troll of Jom", quote: "A true warrior needs no sword." },
      { name: "Einar", role: "Brother in Spirit", quote: "Thorfinn, you were born to save people, not kill them." },
      { name: "Askeladd", role: "Viking Chieftain / Tragic Mentor", quote: "Everyone is a slave to something." }
    ]
  }
];

// Comparison Matrix pairs for the Dualistic Clash feature
const PHILOSOPHICAL_CLASHES = [
  {
    id: "clash-eren-thorfinn",
    anime1: "aot",
    anime2: "vinland",
    title: "The Ultimate Dichotomy: Tatakae vs No Enemies",
    concept: "Freedom through Total War vs Peace through Total Non-Violence",
    side1: {
      character: "Eren Yeager",
      world: "World of Destruction & Determinism",
      thesis: "If someone takes my freedom, I won't hesitate to take theirs. The world is cruel, and only the victor writes reality.",
      keyTerm: "戦え (TATAKAE — FIGHT)",
      color: "#e62332"
    },
    side2: {
      character: "Thorfinn Karlsefni",
      world: "World of Redemption & Elysium",
      thesis: "I will run. I will bear the pain of every blow. But I will never raise a sword again, because no soul is my enemy.",
      keyTerm: "敵はいない (I HAVE NO ENEMIES)",
      color: "#fbbf24"
    },
    synthesis: "Two men who walked through the deepest circles of hell, fire and slaughter. Eren concluded that to protect his loved ones, the outside world must be leveled. Thorfinn concluded that the only way to protect humanity is to cross the ocean and build a land beyond violence."
  },
  {
    id: "clash-deathnote-codegeass",
    anime1: "deathnote",
    anime2: "codegeass",
    title: "Justice vs Revolution: Light Yagami vs Lelouch vi Britannia",
    concept: "Supreme Arbiter from the Shadows vs The Self-Sacrificial Villain",
    side1: {
      character: "Light Yagami (Kira)",
      world: "The Absolute God of the New World",
      thesis: "Fear alone will cleanse humanity. I will rule from the shadows as absolute judge and executioner.",
      keyTerm: "新世界の神 (GOD OF NEW WORLD)",
      color: "#e62332"
    },
    side2: {
      character: "Lelouch vi Britannia (Zero)",
      world: "The Zero Requiem",
      thesis: "To defeat evil, I will become a greater evil. And then, I will die to take the hatred of the world with me.",
      keyTerm: "ゼロ・レクイエム (ZERO REQUIEM)",
      color: "#8a0c16"
    },
    synthesis: "Both geniuses who commanded god-like powers over life and minds. Light fell prey to narcissism and sought immortality in power; Lelouch embraced ultimate self-annihilation so humanity could freely step into tomorrow."
  },
  {
    id: "clash-parasyte-steinsgate",
    anime1: "parasyte",
    anime2: "steinsgate",
    title: "The Biological vs The Temporal Abyss: Shinichi vs Okabe",
    concept: "Losing Human Flesh vs Losing Temporal Sanity",
    side1: {
      character: "Shinichi & Migi",
      world: "Biological Predation & Symbiosis",
      thesis: "When the line between predator and prey blurs, what remains human is our capacity to weep for others.",
      keyTerm: "寄生 (SYMBIOSIS)",
      color: "#cac1ec"
    },
    side2: {
      character: "Rintaro Okabe",
      world: "The World Lines of Causality",
      thesis: "No matter how many times I watch you die, I will rewrite causality until the future belongs to us.",
      keyTerm: "運命石の扉 (STEINS GATE)",
      color: "#fbbf24"
    },
    synthesis: "Both faced the psychological disintegration of their normal lives: Shinichi seeing his heart replaced by cold alien logic, and Okabe watching his friends die across thousands of timelines. Both reclaimed love as their guiding star."
  }
];
