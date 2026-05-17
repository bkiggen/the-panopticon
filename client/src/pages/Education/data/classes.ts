// ─── Types ───────────────────────────────────────────────────────────────────
// OutlineItem is recursive:
//   - items absent or empty → rendered as plain text
//   - items present         → rendered as a collapsible accordion
//
// Nesting rules (how the class outline maps to page elements):
//   Section (numeral + title)  = OutlineSection
//   Level 0 items (section.items):
//     no children → plain body text with gold dash
//     has children → accordion header (collapsible)
//   Level 1+ items (inside an accordion):
//     no children → plain text indented under the accordion
//     has children → nested accordion (any depth)

export interface OutlineItem {
  text: string;
  items?: OutlineItem[];
}

export interface OutlineSection {
  id: string;
  numeral: string;
  title: string;
  timing?: string;
  items: OutlineItem[];
}

export interface ClassData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  film: string;
  director: string;
  year: string;
  teaser: string;
  posterSrc?: string;
  sections: OutlineSection[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const classes: ClassData[] = [
  {
    id: 'pontecorvo-ogro',
    number: '01',
    title: "Pontecorvo's Ogro",
    subtitle: 'and the Question of Political Violence',
    film: 'Ogro',
    director: 'Gillo Pontecorvo',
    year: '1979',
    teaser:
      'What separates a political assassination from terrorism? A film made only six years after a real car flew over a five-story building — and the question that still has no easy answer.',
    posterSrc: 'https://upload.wikimedia.org/wikipedia/en/4/45/Operaci%C3%B3n_Ogro_%28film%29_poster.jpg',
    sections: [
      // ── I ───────────────────────────────────────────────────────────────────
      {
        id: 'opening-frame',
        numeral: 'I',
        title: "Pontecorvo's Ogro and the Question of Political Violence",
        items: [
          {
            text: 'Any resemblance to real people, dead or otherwise…',
            items: [
              {
                text: 'Ogro is a film about real people, a real tunnel, a real car flying over a five-story building — and it was made only six years after it happened, by a director who spent his life thinking about "political violence." It offers no easy answers.',
              },
            ],
          },
          {
            text: 'State Violence. Terrorism. Rebellion. Revolution.',
            items: [
              { text: "What's the difference between a political assassination and terrorism?" },
              { text: 'Can the context of a violent state justify a violent response?' },
              { text: 'Do the ends justify the means? Do the means matter?' },
              { text: '…and who gets to answer these questions?' },
            ],
          },
        ],
      },

      // ── II ──────────────────────────────────────────────────────────────────
      {
        id: 'pontecorvo',
        numeral: 'II',
        title: 'Gillo Pontecorvo — A Political Life in Cinema',
        items: [
          {
            text: 'Baby Gillo',
            items: [
              { text: 'Born 1919, Pisa. The 5th of 8 children. Secular Jewish family.' },
              { text: "The year that D'Annunzio invaded Fiume" },
              { text: "The year that Mussolini's fascism reached fever pitch" },
              {
                text: 'Position in the family gave him a "stubborn but also self-doubting character."',
              },
              { text: 'Wealthy family (live-in French nanny, musical education)' },
              {
                text: 'Wanted to pursue arts, pushed into Chemistry. Drops out of university.',
              },
            ],
          },
          {
            text: 'The Tennis Playboy Days',
            items: [
              { text: 'Young Pontecorvo tours Europe competing in tennis tournaments' },
              {
                text: "Joins Communist Party as a young man. Heavily influenced by his older brother's Marxist ideas. Inspired by Parisian anti-fascists",
              },
              {
                text: 'Fled Paris while German army approached. Taught tennis in southern France.',
              },
            ],
          },
          {
            text: 'First Tastes of Resistance',
            items: [
              {
                text: 'Returned to Italy. During WWII becomes an active partisan in the Resistance, operating in Milan. Helped orchestrate general strikes and participated in "clandestine resistance activity."',
              },
              { text: "Journalist in nascent communist newspaper L'Unità" },
              {
                text: "Pontecorvo's resistance experience is central to his artistic career.",
              },
              {
                text: "First film experience: assistant director and actor for Aldo Vergano's WWII resistance drama Il sole sorge ancora / Outcry (1946)",
                items: [
                  {
                    text: 'Central theme concerns collaboration between the Italians and the Nazis/Fascists, as well as the tenuous union between Catholics and communists in the resistance.',
                  },
                  { text: 'Exposed him to both resistance cinema and Italian Neorealism' },
                ],
              },
              {
                text: 'Continued working as a journalist with a penchant for photography. Was criticised by his editors for over-emphasizing the photographic elements of his reports',
              },
              {
                text: "Roberto Rossellini's neorealist war docudrama Paisa (Paisan) (1946) was, according to Pontecorvo, his true inspiration to make his own films. He has claimed that he subsequently decided to abandon everything in order to work in the cinema.",
              },
              {
                text: 'Worked as assistant director on a handful of films throughout the 50s. Made documentaries on the side using state subsidies.',
              },
              {
                text: 'Continued to embrace neorealism as the Italian film world moved away from it.',
              },
              {
                text: 'Christian Democrats and "Historical Amnesia" urged society away from politically charged film',
              },
              {
                text: 'Left the PCI (Partito Comunista Italiano) in 1956 following the Soviet invasion of Hungary.',
                items: [
                  {
                    text: 'Non-violent political student protests grew into national revolution against the hard-line Stalinist Mátyás Rákosi regime.',
                  },
                  {
                    text: 'After an initial period of confusion, the Soviet Politburo decided to completely extinguish the rebellion. On November 4, 1956, a massive Soviet invasion force of roughly 200,000 troops and thousands of tanks rolled into Budapest and other regions. Despite fierce, sometimes desperate resistance by Hungarian civilians and armed forces, the Red Army crushed the revolution, reinstating a Moscow-backed government.',
                  },
                ],
              },
              {
                text: 'He was 37 at the time. Remained committed to Marxist ideology but rejected the hierarchical structure of the PCI',
              },
              { text: 'He meets Franco Solinas and begins a long, fruitful partnership' },
            ],
          },
          {
            text: 'La grande strada azzurra (The Wide Blue Road) (1957)',
            items: [
              { text: 'First feature' },
              { text: 'Based on novel by Solinas' },
              {
                text: "The film presents the struggles of a fishing community in Sardinia attempting to form a cooperative against middlemen who exploit the fishermen's labor by driving down the price of their daily catch.",
              },
              {
                text: '"Pink Neorealism"',
                items: [
                  {
                    text: 'In pink neorealism the basic elements of the neorealist style — such as a simple plot with a progressive theme — are maintained, with nods to audience demands for more visually pleasing elements such as recognizable stars and color. This film starred Yves Montand and Alida Valli, big stars at the time.',
                  },
                ],
              },
              { text: 'Won the best director award at the Karlovy Vary festival in Russia' },
              {
                text: 'During a time when his brother was a star in the Soviet nuclear arms program so…',
              },
            ],
          },
          {
            text: 'Kapò (1959)',
            items: [
              { text: 'Another collaboration with Solinas' },
              { text: 'Academy-award nominated' },
              { text: 'One of the first films to show the conditions of the concentration camps' },
              { text: "Added a love story at Solinas' insistence, felt compromised" },
            ],
          },
          {
            text: 'The first silence…',
            items: [
              { text: '7 years between the two films.' },
              {
                text: "Pontecorvo has explained the pattern of long delays between projects as a result of his inability to accept any form of compromise or middle ground in his commitment to a project.",
              },
              { text: 'Withdrew from numerous opportunities and projects during this time' },
              { text: 'Period in which Italy was the second biggest film industry in the world' },
            ],
          },
          {
            text: 'La battaglia di Algeri (The Battle of Algiers) (1966)',
            items: [
              {
                text: 'After Kapò, Pontecorvo received offers from around the world. Instead, he made his career-defining master-work.',
              },
              {
                text: 'Shot in Algiers with non-professional actors, in black and white, with a handheld documentary texture so convincing that distributors had to add a title card clarifying no newsreel footage was used',
              },
              {
                text: 'The FLN are the protagonists. Yacef Saadi, a real FLN leader, contributed to the screenplay and starred in the film. The French are somewhat humanized…',
              },
              { text: 'Embed: https://www.youtube.com/watch?v=7XZZ25S2JBA' },
              {
                text: 'Banned in France for five years; used by revolutionary movements worldwide as a practical and ideological manual; famously screened at the Pentagon in 2003 as a study in insurgency and counter-insurgency',
              },
              {
                text: "Establishes Pontecorvo's method: procedural reconstruction, documentary texture, moral complexity without easy resolution",
              },
            ],
          },
          {
            text: 'Queimada (Burn!) (1969)',
            items: [
              {
                text: 'Marlon Brando as a British agent who first manufactures and then suppresses a Caribbean revolution years later',
              },
              { text: 'Colonialism as a system that generates the violence it then condemns' },
              { text: 'Not well-received outside of Italy and critically panned' },
              {
                text: "United Artists, afraid of offending the Spanish market (due to Franco's threats to kill Spanish distribution), changed the nationality of the villains from Spaniards to Portuguese at the last minute — and then hardly distributed the picture after the critics' reviews were less than enthusiastic.",
              },
              {
                text: 'There was also a 17-minute cut made for the American export version that damaged the film.',
              },
              {
                text: 'Gained more praise as time went on. Edward Said said it and Battle of Algiers "stand unmatched and unexcelled since they were made in the 60s."',
              },
              {
                text: "Brando considered it some of his best work, and counted Pontecorvo among the only three directors he'd rate alongside Kazan and Bertolucci.",
              },
            ],
          },
          {
            text: 'The second silence…',
            items: [{ text: 'Again, why?' }],
          },
          {
            text: 'Ogro (1979)',
            items: [
              {
                text: 'depicts the assassination of the Francoist prime minister, Carrero Blanco, by ETA Basque separatists in 1973.',
              },
              { text: 'Script originally written with a less conflicted ending' },
              { text: 'Then the Aldo Moro kidnapping and killing happened' },
              {
                text: "Pontecorvo reconsidered his stance on political violence and changed the ending of Ogro in order to question the legitimacy of violent armed struggle.",
              },
            ],
          },
        ],
      },

    ],
  },
];
