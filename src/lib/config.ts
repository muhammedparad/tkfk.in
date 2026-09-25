export const EVENT_CONFIG = {
  eventName: "TKFK Gandhi Knowledge Challenge 2026",
  eventCode: "TKFK26",
  organizer: "The Knowledge Forum Kerala (TKFK)",
  organizerAbbr: "TKFK",
  eventDateDisplay: "2 October 2026",
  eventIsoDate: "2026-10-02T00:00:00+05:30",
  
  // Authoritative Event Timing Windows (Issue 16 & 17)
  registration_open_at: "2026-09-01T00:00:00+05:30",
  registration_close_at: "2026-10-01T23:59:59+05:30",
  quiz_open_at: "2026-10-02T00:00:00+05:30",
  quiz_close_at: "2026-10-02T23:59:59+05:30",
  results_release_at: "2026-10-05T10:00:00+05:30",

  registrationFee: 99, // ₹99
  currencySymbol: "₹",
  upiId: process.env.NEXT_PUBLIC_UPI_ID || "muhammedparad0485@okicici",
  payeeName: "TKFK Gandhi Knowledge Challenge",
  firstPrizeDisplay: "₹9,999",
  firstPrizeAmount: 9999,
  totalQuestions: 50,
  timeLimitMinutes: 25,
  registrationOpen: true,
  whatsAppGroupUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://chat.whatsapp.com/TKFK26OfficialGroup",
  supportEmail: "support@tkfk.org",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+91 98765 43210",
  address: "TKFK Education Bureau, Thiruvananthapuram, Kerala, India",
  registrationDeadline: "1 October 2026, 11:59 PM IST",
  resultsReleaseDate: "5 October 2026, 10:00 AM IST",
};

export function isRegistrationWindowOpen(): boolean {
  if (process.env.NODE_ENV !== 'production' || process.env.BYPASS_EVENT_WINDOWS === 'true') return true;
  const now = Date.now();
  const open = new Date(EVENT_CONFIG.registration_open_at).getTime();
  const close = new Date(EVENT_CONFIG.registration_close_at).getTime();
  return now >= open && now <= close;
}

export function isQuizWindowOpen(): boolean {
  if (process.env.NODE_ENV !== 'production' || process.env.BYPASS_EVENT_WINDOWS === 'true') return true;
  const now = Date.now();
  const open = new Date(EVENT_CONFIG.quiz_open_at).getTime();
  const close = new Date(EVENT_CONFIG.quiz_close_at).getTime();
  return now >= open && now <= close;
}

export function isResultsWindowReleased(): boolean {
  if (process.env.NODE_ENV !== 'production' || process.env.BYPASS_EVENT_WINDOWS === 'true') return true;
  const now = Date.now();
  const release = new Date(EVENT_CONFIG.results_release_at).getTime();
  return now >= release;
}

export const STUDY_MODULES = [
  {
    id: "mod-1",
    slug: "early-life",
    title: "01 — Gandhi's Early Life & Formative Years",
    description: "Birth in Porbandar, family background, early schooling, and marriage to Kasturba.",
    read_time: "8 min read",
    key_points: [
      "Born on 2 October 1869 in Porbandar, Gujarat.",
      "Father Karamchand Gandhi was Diwan of Porbandar state.",
      "Schooled in Rajkot; moved to London in 1888 to study law at Inner Temple."
    ],
    content: `Mohandas Karamchand Gandhi was born on October 2, 1869, in Porbandar, a coastal town in Gujarat. His father, Karamchand Uttamchand Gandhi, served as the Diwan (chief minister) of Porbandar state. His mother, Putlibai, was deeply religious and influenced young Mohandas with values of self-discipline, fasting, and truthfulness.

In 1883, at the age of 13, Mohandas married Kasturba Kapadia in an arranged child marriage. In 1888, he traveled to London, England, to study law at the Inner Temple, qualifying as a barrister before returning to India in 1891.`
  },
  {
    id: "mod-2",
    slug: "south-africa",
    title: "02 — The South African Experience (1893–1914)",
    description: "Racial discrimination at Pietermaritzburg, Natal Indian Congress, and birth of Satyagraha.",
    read_time: "10 min read",
    key_points: [
      "Thrown off a train at Pietermaritzburg in 1893 for riding in first class.",
      "Established Natal Indian Congress in 1894.",
      "Founded Phoenix Settlement (1904) and Tolstoy Farm (1910)."
    ],
    content: `In 1893, Gandhi accepted a one-year contract to represent an Indian merchant in Natal, South Africa. Shortly after arriving, he experienced racial discrimination firsthand when he was forcibly removed from a first-class train compartment at Pietermaritzburg station.

This pivotal event transformed Gandhi's life. He decided to stay and fight against racial oppression. In 1894, he helped form the Natal Indian Congress. Over two decades in South Africa, Gandhi developed the philosophy and practice of Satyagraha (soul-force or passive resistance).`
  },
  {
    id: "mod-3",
    slug: "return-to-india",
    title: "03 — Return to India & Early Campaigns",
    description: "Arrival in 1915, mentorship under Gokhale, Champaran and Kheda Satyagrahas.",
    read_time: "9 min read",
    key_points: [
      "Returned to India on 9 January 1915 (celebrated as Pravasi Bharatiya Divas).",
      "Gopal Krishna Gokhale served as his political mentor.",
      "Champaran Satyagraha (1917) and Kheda Satyagraha (1918)."
    ],
    content: `Upon returning to India on January 9, 1915, Gandhi was advised by his political mentor, Gopal Krishna Gokhale, to travel across India for a year to understand the people's condition before joining active politics.

His first major successful local movement was the Champaran Satyagraha of 1917 in Bihar, supporting indigo farmers against oppressive British planters. This was followed by the Kheda Satyagraha of 1918 in Gujarat for tax relief during crop failures.`
  },
  {
    id: "mod-4",
    slug: "non-cooperation",
    title: "04 — Non-Cooperation Movement (1920–1922)",
    description: "Rowlatt Act, Jallianwala Bagh massacre response, Khilafat movement, Chauri Chaura.",
    read_time: "11 min read",
    key_points: [
      "Launched in August 1920 following Rowlatt Act & Jallianwala Bagh massacre.",
      "Boycott of British goods, educational institutions, and courts.",
      "Called off in February 1922 following violent Chauri Chaura incident."
    ],
    content: `The Non-Cooperation Movement was launched in August 1920 in response to the Rowlatt Act and the brutal Jallianwala Bagh massacre of April 1919. Gandhi urged citizens to surrender government titles, boycott British goods, government schools, and law courts.

The movement united millions across India. However, when a crowd burned a police station in Chauri Chaura, Uttar Pradesh, killing 22 policemen in February 1922, Gandhi suspended the movement immediately, refusing to compromise on non-violence.`
  },
  {
    id: "mod-5",
    slug: "salt-march",
    title: "05 — Dandi March & Civil Disobedience (1930)",
    description: "The 240-mile Dandi Salt March, defiance of British salt monopoly, Round Table Conferences.",
    read_time: "12 min read",
    key_points: [
      "Began 12 March 1930 from Sabarmati Ashram to Dandi beach.",
      "Covered 240 miles (385 km) over 24 days with 78 original followers.",
      "Broke salt law on 6 April 1930, sparking nationwide Civil Disobedience."
    ],
    content: `On March 12, 1930, Gandhi embarked on one of his most iconic campaigns: the Salt March. Accompanied by 78 chosen ashram members, he walked 240 miles from Sabarmati Ashram to the coastal village of Dandi.

Upon reaching Dandi on April 6, 1930, Gandhi picked up a handful of natural salt, defying the British salt tax laws. This symbolic action inspired millions of Indians to make and trade illicit salt, leading to mass arrests and worldwide press coverage.`
  },
  {
    id: "mod-6",
    slug: "quit-india",
    title: "06 — Quit India Movement (1942)",
    description: "The Gowalia Tank speech in Bombay, 'Do or Die' mantra, mass independence struggle.",
    read_time: "10 min read",
    key_points: [
      "Passed by All India Congress Committee on 8 August 1942 in Bombay.",
      "Famous slogan: 'Do or Die' (Karo ya Maro).",
      "Immediate arrest of Gandhi and key Congress leaders."
    ],
    content: `During World War II, Gandhi launched the Quit India Movement on August 8, 1942, demanding an immediate end to British rule. In his impassioned speech at Gowalia Tank Maidan in Bombay, he issued the historical mantra to the nation: 'Do or Die' (Karo ya Maro).

The British government responded swiftly by arresting Gandhi and almost the entire Indian leadership early the next morning. Despite leaderless suppression, spontaneous rebellions erupted across the nation.`
  },
  {
    id: "mod-7",
    slug: "philosophy",
    title: "07 — Core Principles & Philosophy",
    description: "Satya (Truth), Ahimsa (Non-violence), Swadeshi, Sarvodaya, and Trusteeship.",
    read_time: "12 min read",
    key_points: [
      "Satya (Truth): Truth is God and the ultimate reality.",
      "Ahimsa (Non-violence): Positive love and refusal to inflict injury.",
      "Swadeshi & Sarvodaya: Self-reliance and welfare of all."
    ],
    content: `Gandhian philosophy is rooted in fundamental spiritual and ethical values:

1. Satya (Truth): Gandhi believed Truth was the supreme entity. He titled his autobiography 'The Story of My Experiments with Truth'.
2. Ahimsa (Non-Violence): Non-violence is not passive submission, but active soul-force.
3. Swadeshi: Promoting local village industries and self-reliance.
4. Sarvodaya: Upliftment of the poorest section of society (Unto This Last).`
  },
  {
    id: "mod-8",
    slug: "key-dates",
    title: "08 — Chronology & Key Historic Dates",
    description: "Timeline of major events in Mahatma Gandhi's life from 1869 to 1948.",
    read_time: "7 min read",
    key_points: [
      "1869: Born in Porbandar.",
      "1893: Arrived in South Africa.",
      "1915: Returned to India.",
      "1930: Salt March.",
      "1942: Quit India Movement.",
      "1948: Martyred on 30 January."
    ],
    content: `A quick chronological reference guide:

• 2 Oct 1869: Birth in Porbandar, Gujarat.
• 1888–1891: Law studies in London.
• 1893–1914: South Africa years.
• 9 Jan 1915: Return to India.
• 1917: Champaran Satyagraha.
• 1920: Non-Cooperation Movement launched.
• 1930: Dandi Salt March.
• 1931: Gandhi-Irwin Pact.
• 1942: Quit India Movement.
• 15 Aug 1947: Indian Independence (Gandhi spent day fasting in Kolkata for communal peace).
• 30 Jan 1948: Assassinated by Nathuram Godse during evening prayers at Birla House.`
  },
  {
    id: "mod-9",
    slug: "personalities",
    title: "09 — Key Associates & Contemporaries",
    description: "Kasturba Gandhi, Rabindranath Tagore, Jawaharlal Nehru, Sardar Patel, Gokhale.",
    read_time: "9 min read",
    key_points: [
      "Rabindranath Tagore conferred the title 'Mahatma' on Gandhi.",
      "Gandhi called Tagore 'Gurudev'.",
      "Gopal Krishna Gokhale was his political guru."
    ],
    content: `Gandhi worked closely with prominent historical figures:

• Kasturba Gandhi: Courageous partner in all satyagraha campaigns.
• Rabindranath Tagore: Named him 'Mahatma' (Great Soul), while Gandhi called him 'Gurudev'.
• Gopal Krishna Gokhale: Gandhi's revered political mentor.
• Sardar Vallabhbhai Patel & Jawaharlal Nehru: Key lieutenants in the freedom movement.
• Madeleine Slade (Mirabehn): British woman who devoted her life as Gandhi's disciple.`
  },
  {
    id: "mod-10",
    slug: "legacy",
    title: "10 — Global Impact & Contemporary Legacy",
    description: "Influence on Martin Luther King Jr., Nelson Mandela, Albert Einstein, UN Peace Day.",
    read_time: "8 min read",
    key_points: [
      "2 October designated International Day of Non-Violence by United Nations in 2007.",
      "Direct inspiration for US Civil Rights Movement & Anti-Apartheid movement.",
      "Albert Einstein famous quote: 'Generations to come will scarce believe that such a one as this ever walked upon this earth'."
    ],
    content: `Gandhi's message of non-violence transcends national boundaries. Martin Luther King Jr. adopted Gandhian non-violence during the US Civil Rights Movement. Nelson Mandela referred to Gandhi as an integral hero of South Africa's liberation.

In June 2007, the United Nations General Assembly unanimously adopted a resolution declaring October 2 as the International Day of Non-Violence worldwide.`
  }
];
