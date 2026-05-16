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
                  {
                    text: 'One of the first films to show the conditions of the concentration camps',
                  },
                  {
                    text: "Added a love story at Solinas' insistence, felt compromised",
                  },
                ],
              },
              {
                text: 'The first silence…',
                items: [
                  { text: '7 years between the two films.' },
                  {
                    text: "Pontecorvo has explained the pattern of long delays between projects as a result of his inability to accept any form of compromise or middle ground in his commitment to a project.",
                  },
                  {
                    text: 'Withdrew from numerous opportunities and projects during this time',
                  },
                  {
                    text: 'Period in which Italy was the second biggest film industry in the world',
                  },
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
                  {
                    text: 'Colonialism as a system that generates the violence it then condemns',
                  },
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

      // ── III ─────────────────────────────────────────────────────────────────
      {
        id: 'basque',
        numeral: 'III',
        title: 'Who Are the Basque?',
        items: [
          {
            text: 'Who they are / the mystery of their origins',
            items: [
              { text: 'Oldest ethnic group in Europe with no known relatives' },
              { text: 'Pre-Indo-European — were there before the Celtic and Latin migrations' },
              {
                text: 'The language (Euskara) is a language isolate — unrelated to any other language on earth',
              },
            ],
          },
          {
            text: 'Where they live',
            items: [
              {
                text: 'Straddle the western Pyrenees across northern Spain and southwestern France',
              },
              {
                text: 'The Basque Country (Euskal Herria) — seven provinces, four in Spain, three in France',
              },
              {
                text: 'Never had a fully independent state but maintained strong autonomous traditions',
              },
            ],
          },
          {
            text: 'Culture and identity',
            items: [
              { text: 'Euskara as the core of identity — one of the oldest living languages' },
              {
                text: 'Strong oral tradition, music, folk sports (stone lifting and wood chopping competitions)',
              },
              { text: 'Distinct cuisine — pintxos, one of the great food cultures of Europe' },
              {
                text: 'Fierce independence and self-governance tradition going back centuries',
              },
            ],
          },
          {
            text: 'The modern political situation',
            items: [
              {
                text: "Franco's suppression of Basque language and culture during the dictatorship",
              },
              {
                text: 'ETA — the separatist militant organization, founded 1959, formally dissolved 2018',
              },
              { text: 'Current autonomous status within Spain' },
            ],
          },
          {
            text: 'Why they matter / the big idea to leave people with',
            items: [
              {
                text: 'A people who maintained a distinct identity, language, and culture for potentially thousands of years against enormous pressure — Romans, Visigoths, Moors, Castilians, Franco',
              },
              { text: 'Euskara surviving into the modern era is genuinely remarkable' },
            ],
          },
        ],
      },

      // ── IV ──────────────────────────────────────────────────────────────────
      {
        id: 'franco',
        numeral: 'IV',
        title: 'Francisco Franco and the World That Made ETA',
        timing: '5–7 min',
        items: [
          {
            text: 'Brief orientation: Franco takes power after the Spanish Civil War (1939), rules as dictator for 36 years — the longest-surviving fascist regime in Western Europe',
          },
          {
            text: 'The regime by the early 1970s: aging, sclerotic, held together by the Catholic Church, the military, and a technocratic elite (Opus Dei); economically modernizing but politically frozen',
          },
          {
            text: "The Basque Country specifically — a distinct language, a distinct culture, and a history of brutal suppression under Franco; Basque language banned in public, regional identity criminalized",
          },
          {
            text: "ETA founded 1959: Euskadi Ta Askatasuna, combining Basque nationalism with Marxist revolutionary politics; a generation radicalized by the regime's refusal to allow any peaceful expression of Basque identity",
          },
          {
            text: 'The Burgos trials (1970) — ETA militants tried by military tribunal, death sentences handed down, international outcry; the trials inadvertently give ETA a global platform and a martyrology',
          },
          {
            text: 'The question of legitimacy: by 1973 ETA is operating against a regime that most of the world recognizes as a fascist dictatorship with no legitimate democratic mandate',
          },
        ],
      },

      // ── V ───────────────────────────────────────────────────────────────────
      {
        id: 'target',
        numeral: 'V',
        title: 'Admiral Luis Carrero Blanco — The Target',
        timing: '5 min',
        items: [
          {
            text: "Career Francoist, Navy man, Franco's closest and most loyal lieutenant across three and a half decades",
          },
          {
            text: "Named Prime Minister in June 1973 — the first time Franco had ever appointed one, a sign of the dictator's failing health and his need to secure succession",
          },
          {
            text: 'Why Carrero Blanco was the target: he was not merely a functionary but the designated guarantor of Francoism after Franco\'s death — the man the hardline establishment believed would ensure the regime survived the dictator intact. "After Franco, Francoism" — Carrero Blanco was that plan in human form.',
          },
          {
            text: 'Deeply conservative, deeply Catholic, deeply anti-communist; a supporter of the Burgos death sentences; no interest in liberalization of any kind',
          },
          { text: "ETA's logic: remove the linchpin and the succession plan collapses" },
        ],
      },

      // ── VI ──────────────────────────────────────────────────────────────────
      {
        id: 'operation',
        numeral: 'VI',
        title: 'Operación Ogro — The Operation',
        timing: '5–7 min',
        items: [
          {
            text: "The planning: a small cell, months of preparation, a basement flat rented beneath Carrero Blanco's daily route to morning Mass at a Madrid church",
          },
          { text: 'The tunnel — dug by hand beneath the street over months, packed with explosives' },
          {
            text: "December 20, 1973: the explosion launches Carrero Blanco's car over a five-story building, landing on a second-floor terrace. He dies shortly after. The crater in the street is still visible today.",
          },
          {
            text: 'Immediate aftermath: shock and disorientation within the regime; Franco reportedly devastated personally; the hardline succession plan in ruins',
          },
          {
            text: 'The political consequences are real and significant: when Franco dies in November 1975, Carrero Blanco is not there to anchor a continuity government. The transition to democracy — however imperfect — is arguably more possible because of what happened in that Madrid street in 1973.',
          },
          {
            text: 'The long shadow: ETA does not stop. It continues killing for decades, targeting politicians, judges, businesspeople, soldiers — many of them figures in a functioning democracy. By the time ETA finally dissolves in 2018, it has killed over 800 people. The moral clarity of 1973 becomes much harder to locate in 1985 or 1995.',
          },
        ],
      },

      // ── VII ─────────────────────────────────────────────────────────────────
      {
        id: 'moro',
        numeral: 'VII',
        title: 'The Aldo Moro Interlude — Why 1979 Is the Right Moment',
        timing: '5–7 min',
        items: [
          { text: 'This is the beat that makes Ogro something more than a reconstruction' },
          {
            text: "March 1978: the Brigate Rosse kidnap Aldo Moro in Rome, killing his five bodyguards. May 1978: they murder him and leave his body in the trunk of a Renault 4, parked equidistant between the headquarters of the Christian Democrats and the Communist Party — a final, theatrical political statement.",
          },
          {
            text: "Who was Moro: not a fascist, not a pillar of an authoritarian regime, but a Christian Democrat who had spent years attempting the compromesso storico — the historic compromise that would bring the Italian Communist Party into democratic governance. He was, by the standards of Italian politics, a reformer attempting to work within the system.",
          },
          {
            text: "The contrast with Carrero Blanco is almost too neat: ETA kills the man whose entire function is to preserve a fascist dictatorship; the BR kills the man whose entire function is to make democracy more inclusive. Both call it revolutionary politics.",
          },
          {
            text: "Pontecorvo is making Ogro with Moro's murder eighteen months in the past, in a country still in shock, still arguing about whether the state should have negotiated. He is a man of the left making a film that asks the audience to understand political assassination — in that context, in that moment.",
          },
          {
            text: 'He is not endorsing the BR. But he is refusing to look away from the question. That is what makes Ogro a serious film rather than a thriller.',
          },
          {
            text: "The juxtaposition Pontecorvo implicitly forces: what distinguishes Carrero Blanco from Aldo Moro as targets? Is it the nature of the regime? The nature of the man? The political outcome? Or is there no principled distinction — only outcomes we prefer and outcomes we don't?",
          },
        ],
      },

      // ── VIII ────────────────────────────────────────────────────────────────
      {
        id: 'method',
        numeral: 'VIII',
        title: 'What Pontecorvo Does With the Material',
        timing: '3–5 min',
        items: [
          {
            text: 'The Battle of Algiers method applied to Spain: procedural, documentary in texture, reconstructed from the inside',
          },
          {
            text: 'The film was made with the cooperation of ETA members — some of the actual participants, operating under pseudonyms, contributed to the script',
          },
          {
            text: "This is not neutral filmmaking. But it is not hagiography either — the film's procedural coldness asks you to think, not simply to cheer",
          },
          {
            text: "Reception: controversial in Spain, released during the fragile early years of the democratic transition; easier to admire from a distance than from inside a country still sorting out what the Franco years meant",
          },
          {
            text: 'What to watch for tonight: the texture of the operation, the way Pontecorvo handles the humanity of the cell members, and the moment — if there is one — where the film asks you to pause rather than simply follow',
          },
        ],
      },

      // ── IX ──────────────────────────────────────────────────────────────────
      {
        id: 'closing',
        numeral: 'IX',
        title: 'Closing Provocation',
        timing: '2–3 min',
        items: [
          {
            text: 'Pontecorvo spent his life as a man who believed in the legitimacy of anti-fascist violence — not as an abstraction but as a lived conviction from his own wartime experience',
          },
          {
            text: 'Ogro is made by a man in his sixties looking back at that conviction and testing it against a more complicated present',
          },
          {
            text: "Leave the audience with the question rather than the answer: does the nature of the regime determine the legitimacy of violence against it? And if yes — who decides? ETA thought they still had the right to decide in 1995. The BR thought they had the right in 1978.",
          },
          {
            text: "Tonight's film takes 1973 seriously on its own terms. Your job as a viewer is to decide whether it earns that.",
          },
        ],
      },
    ],
  },
];
