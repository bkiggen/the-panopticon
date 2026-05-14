export interface BulletItem {
  text: string;
  sub?: string[];
}

export interface OutlineSection {
  id: string;
  numeral: string;
  title: string;
  timing?: string;
  items: BulletItem[];
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
      {
        id: 'opening-frame',
        numeral: 'I',
        title: 'Opening Frame',
        timing: '3–5 min',
        items: [
          {
            text: 'Name and answer question: Is violence committed by individuals or "unofficial" groups to achieve political ends ever justified? If so, what is something you would kill for?',
          },
          {
            text: 'Set the mood: this is a film about real people, a real tunnel, a real car flying over a five-story building — and it was made only six years after it happened, by a director who spent his life thinking about "political violence"',
          },
          {
            text: "The central question the film forces, and the question we'll sit with tonight: what separates a political assassination from terrorism? Does the nature of the target change the moral calculus? Does the answer change when you look at what the killers did next?",
          },
          {
            text: "Frame Pontecorvo as a filmmaker who never stops asking that question — and who made Ogro at a moment in European history when it was unavoidable",
          },
        ],
      },
      {
        id: 'pontecorvo',
        numeral: 'II',
        title: 'Gillo Pontecorvo — A Political Life in Cinema',
        timing: '7–10 min',
        items: [
          {
            text: 'Born 1919, Pisa — Jewish Italian, comes of age under fascism; this is formative in the most direct sense possible',
          },
          {
            text: 'Joins the Communist Party as a young man; during WWII becomes an active partisan in the Resistance, operating in Milan',
          },
          {
            text: 'This is not drawing-room politics — he is a man who made the choice that armed resistance to fascism was legitimate and necessary, and he made that choice while the outcome was uncertain',
          },
          {
            text: "Postwar: drifts away from orthodox Communism but never from the underlying conviction that violence against genuine oppression can be justified — this thread runs through everything he makes",
          },
          {
            text: 'The Battle of Algiers (1966) — the film that defines him and without which Ogro is impossible to understand',
            sub: [
              'Shot in Algiers with non-professional actors, in black and white, with a handheld documentary texture so convincing that distributors had to add a title card clarifying no newsreel footage was used',
              'The FLN are the protagonists — Pontecorvo asks you to understand, even sympathize with, people planting bombs in cafés',
              'Banned in France for five years; used by revolutionary movements worldwide as a practical and ideological manual; famously screened at the Pentagon in 2003 as a study in insurgency and counter-insurgency',
              "Establishes Pontecorvo's method: procedural reconstruction, documentary texture, moral complexity without resolution",
            ],
          },
          {
            text: "Burn! (1969) — Marlon Brando as a British agent who first manufactures and then suppresses a Caribbean revolution; colonialism as a system that generates the violence it then condemns",
          },
          {
            text: 'Then a decade of near-silence — a perfectionist who found no subject worthy of his method',
          },
          {
            text: "The subject that brings him back is Carrero Blanco's assassination — why this, why now, we'll return to that",
          },
        ],
      },
      {
        id: 'basque',
        numeral: 'III',
        title: 'Who Are the Basque?',
        items: [
          {
            text: 'Who they are / the mystery of their origins',
            sub: [
              'Oldest ethnic group in Europe with no known relatives',
              'Pre-Indo-European — were there before the Celtic and Latin migrations',
              'The language (Euskara) is a language isolate — unrelated to any other language on earth',
            ],
          },
          {
            text: 'Where they live',
            sub: [
              'Straddle the western Pyrenees across northern Spain and southwestern France',
              'The Basque Country (Euskal Herria) — seven provinces, four in Spain, three in France',
              'Never had a fully independent state but maintained strong autonomous traditions',
            ],
          },
          {
            text: 'Culture and identity',
            sub: [
              'Euskara as the core of identity — one of the oldest living languages',
              'Strong oral tradition, music, folk sports (stone lifting and wood chopping competitions)',
              'Distinct cuisine — pintxos, one of the great food cultures of Europe',
              'Fierce independence and self-governance tradition going back centuries',
            ],
          },
          {
            text: 'The modern political situation',
            sub: [
              "Franco's suppression of Basque language and culture during the dictatorship",
              'ETA — the separatist militant organization, founded 1959, formally dissolved 2018',
              'Current autonomous status within Spain',
            ],
          },
          {
            text: 'Why they matter / the big idea to leave people with',
            sub: [
              'A people who maintained a distinct identity, language, and culture for potentially thousands of years against enormous pressure — Romans, Visigoths, Moors, Castilians, Franco',
              'Euskara surviving into the modern era is genuinely remarkable',
            ],
          },
        ],
      },
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
          {
            text: "ETA's logic: remove the linchpin and the succession plan collapses",
          },
        ],
      },
      {
        id: 'operation',
        numeral: 'VI',
        title: 'Operación Ogro — The Operation',
        timing: '5–7 min',
        items: [
          {
            text: "The planning: a small cell, months of preparation, a basement flat rented beneath Carrero Blanco's daily route to morning Mass at a Madrid church",
          },
          {
            text: 'The tunnel — dug by hand beneath the street over months, packed with explosives',
          },
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
      {
        id: 'moro',
        numeral: 'VII',
        title: 'The Aldo Moro Interlude — Why 1979 Is the Right Moment',
        timing: '5–7 min',
        items: [
          {
            text: 'This is the beat that makes Ogro something more than a reconstruction',
          },
          {
            text: "March 1978: the Brigate Rosse kidnap Aldo Moro in Rome, killing his five bodyguards. May 1978: they murder him and leave his body in the trunk of a Renault 4, parked equidistant between the headquarters of the Christian Democrats and the Communist Party — a final, theatrical political statement.",
          },
          {
            text: "Who was Moro: not a fascist, not a pillar of an authoritarian regime, but a Christian Democrat who had spent years attempting the compromesso storico — the historic compromise that would bring the Italian Communist Party into democratic governance. He was, by the standards of Italian politics, a reformer attempting to work within the system.",
          },
          {
            text: 'The contrast with Carrero Blanco is almost too neat: ETA kills the man whose entire function is to preserve a fascist dictatorship; the BR kills the man whose entire function is to make democracy more inclusive. Both call it revolutionary politics.',
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
