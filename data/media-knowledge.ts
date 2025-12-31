import { ProfileSection as KnowledgeSection } from './personal-profile';

export interface MediaKnowledgeBase {
    sections: KnowledgeSection[];
}

export const mediaKnowledgeBase: MediaKnowledgeBase = {
    sections: [
        {
            id: 'media-ai-tech',
            title: 'AI, Technology & Engineering',
            content: `
Core Interests:
- Agentic AI & Autonomous Agents: Deep dive into agentic design patterns, frameworks, and roadmaps (Tina Huang, Mark Kashef, Varun Mayya).
- Workflow Automation: Extensive interest in n8n for local and private automation, building custom AI assistants, and integrating APIs (NetworkChuck, Cole Medin).
- MLOps & Engineering: Machine Learning operations, prompt engineering, and coding AI tools (freeCodeCamp, Krish Naik).
- Neuromorphic Computing: Interest in hardware architectures mimicking the brain (Intel, Carnegie Science).
- Quantum & Space: Neil deGrasse Tyson (Interstellar, Physics of movies), Michio Kaku (Quantum digestion), and Veritasium/Vsauce videos on math/physics paradoxes.
- Robotics: Deep focus on ROS 2 (Humble) tutorials (Kevin Wood, Robotics Back-End), Princeton Robotics lectures, and humanoid robot comparisons.
- Consumer Tech: Reviews of latest hardware (Google Pixel 9a, iPhone 17 Pro rumors, Samsung Galaxy Tab S11) followed via MKBHD and The Studio.
- Smart Wearables: Keen interest in smart glasses (Ray-Ban Meta, Xreal Air 2 Ultra, Apple Vision Pro) and their AI integration.
- Drones & Cinematography: DJI ecosystem (DJI Neo, O4 Air Unit, Flip), FPV flying, and drone regulations.
- Coding & Development: Python programming, VS Code setups, and building applications (LangChain courses by Krish Naik).

Key Channels:
- Varun Mayya (AI developments)
- Kevin Wood | Robotics & AI (ROS 2)
- NetworkChuck (Tech & Automation tutorials)
- Marques Brownlee / MKBHD (Tech reviews)
- freeCodeCamp (Coding & MLOps)
- Google DeepMind (Research breakthroughs)
- GrowthX (AI in professional growth)
`
        },
        {
            id: 'media-fitness-health',
            title: 'Fitness, Biohacking & Nutrition',
            content: `
Dietary Philosophy:
- Fasting: Extensive research and practice of Intermittent Fasting (OMAD) and prolonged water fasting (7-day water fasts).
- Nutrition: Focus on Satvic foods (Ash Gourd Juice benefits), vegetarian/vegan protein sources (Nimai Delgado), and gut health.
- Biohacking: Interest in Bryan Johnson's Blueprint, 432Hz healing frequencies. Research on supplements like Rhodiola Rosea, L-Theanine, Tongkat Ali, and Ashwagandha for anxiety and endurance.

Workouts & Mobility:
- Mobility & Flexibility: Strong focus on "bulletproofing" joints, spine health, and "animalistic mobility" flows. Follows Movesmethod, Squat University, and Dan John's flexibility hacks.
- Calisthenics & Strength: Bodyweight mastery, pull-up hacks, and handstand training (Strength Side, ATHLEAN-X).
- Mindset: David Goggins' philosophy ("Addicted to Hard Work", "100 Mile races").
- Science of Health: Sleep optimization, testosterone myths, and deep sleep protocols (Andrew Huberman).

Key Figures:
- Sadhguru (Yogic diet & health)
- Squat University (Rehab & Mobility)
- Movesmethod (Flexibility & Joint Health)
- Strength Side (Calisthenics)
- Andrew Huberman (Neuroscience of health)
- Dr. Pal (Gut health)
- Satvic Movement (Diet & Lifestyle)
- Bryan Johnson (Longevity)
`
        },
        {
            id: 'media-business-finance',
            title: 'Business, Entrepreneurship & Wealth',
            content: `
Themes:
- Startup Philosophy: Deep interest in Naval Ravikant's "Lion Method", "The Focus for Young People", and wealth creation principles without luck.
- Founder Stories: The Social Network scenes (Mark Zuckerberg, Sean Parker), Shark Tank (India & US) negotiations.
- Indian Startup Ecosystem: Following Nikhil Kamath's podcasts with founders to understand the Indian market.
- Strategic Thinking: Corporate warfare, business betrayals, and "Boring businesses" that generate cash flow.

Key Channels:
- Nikhil Kamath (WTF is... Podcast)
- Naval Ravikant (Philosophical wealth & happiness)
- Think School (Business Case Studies)
- Dostcast (Real conversations)
- Raj Shamani (Finance & Growth)
- Y Combinator (Startup School)
- Finance With Sharan (Personal finance hacks)
`
        },
        {
            id: 'media-spirituality',
            title: 'Spirituality, Philosophy & Consciousness',
            content: `
Core Practices:
- Isha Foundation: Deeply connected to Sadhguru's teachings. Watches content on specific rituals (Surya Kriya, Linga Bhairavi, Shambhavi Mahamudra), ashram life, and yogic diet.
- Yoga & Mudras: Practice of Shanmukhi Mudra, Surya Shakti, and pranayama techniques.
- Sudarshan Kriya: Interest in Art of Living practices and Dr. Vikas Divyakirti's talks.
- Mental Health & Psychology: Deep dive into trauma healing, dealing with narcissistic parents, and inner child work (Dr. Daniel Fox, The Holistic Psychologist).
- Biohacking & Nutrition: Research on supplements (Rhodiola Rosea, L-Theanine), gut health (Dr. Pal, Satvic Yoga), and specific benefits of Ghee.
- Esoteric & Mysticism: Strong interest in Angel Numbers (111, 333, 555), synchronicity, Manifestation, and 432Hz/healing frequencies.
- Astrology: Deep dive into Vedic astrology (Saturn in 3rd House, Ketu in 12th, Sade Sati), planetary transits (Saturn to Pisces 2025), and birth chart analysis (Astro Arun Pandit).
- Ancient Wisdom: Interest in "Buga Sphere", ancient technology theories, and the intersection of science and spirituality.
- Rituals & Events: Strong interest in Kumbh Mela 2025, Naga Sadhus, Aghori lifestyle, and the spiritual significance of the event (Nityananda Mishra).
- Deities & Mythology: Stories of Shiva, Ganesha, and Rama; significance of festivals like Navratri.

Key Sources:
- Sadhguru / Isha Foundation
- Premanand Ji Maharaj (Radha Rani devotion)
- Dr. Vikas Divyakirti
- Garikapati Narasimha Rao (Telugu Pravachanam)
- Chaganti Koteswara Rao
- Ranveer Allahbadia / BeerBiceps (Spiritual podcasts & History)
- Vedanta Society
- Osho (Philosophical impact)
- Gaia (Ancient mysteries)
`
        },
        {
            id: 'media-entertainment',
            title: 'Entertainment, Sports & Lifestyle',
            content: `
Sports:
- Cricket (Religion): Hardcore fan of MS Dhoni ("Thala"), Rohit Sharma ("Hitman"), and Virat Kohli. Follows IPL closely (CSK/MI rivalries), match highlights. Admits Sunil Chhetri's greatness in football.
- Chess: Follows Magnus Carlsen (GOAT debates, game analysis) and GothamChess.
- Football: Follows the GOAT debate (Messi vs Ronaldo), Neymar skills, and classic moments (Maradona).
- F1/Motorsports: Interest in Lewis Hamilton, Max Verstappen, and high-speed racing edits.

Cinema & Pop Culture:
- Bollywood & Regional: Deep interest in SRK, Ranbir Kapoor, and directors like Sandeep Reddy Vanga ("Animal").
- Telugu Cinema: Fans of Prabhas ("Kalki 2898 AD", "Baahubali"), Vijay Deverakonda, Nani ("Saripodhaa Sanivaaram").
- MCU & DC: Deep dive into lore (Moon Knight personalities, Thor quotes, Spider-Man, Superman 2025). Transformers (Optimus Prime speeches).
- Classics: "The Social Network" (obsession with dialogue and business drama), John Wick action sequences.
- Comedy: Kapil Sharma Show, Kullu (AashiquiPaglu), Rahul Dua, and stand-up clips.

Music Preferences:
- Rap/Hip-Hop: Kendrick Lamar (Heavy rotation: "Money Trees", "DNA", "Euphoria"), Drake, J. Cole.
- Rock/Classic: Pink Floyd ("Comfortably Numb", "Another Brick in the Wall"), Led Zeppelin ("Stairway to Heaven"), Queen ("Bohemian Rhapsody"), Eagles ("Hotel California").
- Guitar & Instrumental: Obsessed with technical guitar skills. Polyphia (Tim Henson - "Playing God", "Ego Death", "Goose"), Steve Vai, John Mayer (Deep dive into "Neon" techniques/acoustic versions).
- Fingerstyle & Percussive: Ichika Nito ("Freak", "Metaphor"), Marcin (Percussive arrangements), and Sungha Jung.
- Covers & Learning: Follows guitarists like Larissa Liveir, Sophie Lloyd, and channels like Marty Music and Brandon D'Eon for tabs/techniques (Canon Rock, Free Bird solo).
- Pop/Vibe: The Weeknd, Billie Eilish, SZA, Ariana Grande, Shawn Mendes ("Treat You Better"), Luis Fonsi ("Despacito" intro tabs).
- Indian/Regional: Anirudh Ravichander (BGM king), Arijit Singh ("Tum Hi Ho", "Sooraj Dooba Hai"), Badshah, AP Dhillon ("Brown Munde").
- Specific Tracks: "Jericho" (Iniko), "Run" (Joji - Guitar Solo), "Breezeblocks" (Alt-J).
- Vibe: High-energy focus music, cinematic scores, acoustic guitar covers, and lyrical pop-rap.

Lifestyle:
- Eileen Gu: Following her skiing career, training, and lifestyle.
- Luxury & Autos: Supercars (Bugatti, Rolls Royce), Manny Khoshbin's garage. Deep interest in engineering heavyweights (Tesla Cybertruck, Porsche 911, Toyota Supra MK4).
- Motorcycles: Adventure and Sport bikes. Specific interest in Honda Africa Twin, Transalp 750, Honda CB650R, Yamaha MT-07, and Kawasaki H2R vs ZX10R comparisons.
- Reviews: Throttle House, PowerDrift, Gagan Choudhary, MotorInc (technical deep dives).
- Travel & Culture: Vlogs exploring India, international luxury destinations, and cultural curiosity about Eastern Europe (dating/lifestyle norms).
`
        },
        {
            id: 'media-meta-learning',
            title: 'Meta-Learning & Productivity',
            content: `
- Learning How to Learn: Jim Kwik's brain health tips.
- Productivity Systems: tools and workflows (Perplexity AI, Obsidian referenced indirectly).
- Skill Acquisition: Breaking down complex skills (agentic AI, coding) into manageable roadmaps.
`
        }
    ]
};
