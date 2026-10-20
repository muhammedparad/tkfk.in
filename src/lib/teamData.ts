export interface TeamSection {
  title: string;
  paragraphs: string[];
}

export interface TeamMember {
  slug: string;
  aliases: string[];
  name: string;
  shortName: string;
  role: string;
  fullRole: string;
  badgeLabel: string;
  image: string;
  badgeImage: string;
  quote: string;
  tagline: string;
  bioIntro: string[];
  sections: TeamSection[];
  noteToYou: string[];
  signOff: {
    name: string;
    role: string;
    closingLine: string;
  };
  otherMemberSlug: string;
  otherMemberLabel: string;
}

export const TEAM_MEMBERS: Record<string, TeamMember> = {
  'muhammed-asad': {
    slug: 'muhammed-asad',
    aliases: ['founder', 'asad'],
    name: 'Muhammed Asad P',
    shortName: 'Asad',
    role: 'Founder',
    fullRole: 'Founder of TKFK, The Knowledge Forum Kerala',
    badgeLabel: "FOUNDER'S NOTE",
    image: '/images/team/asad.png',
    badgeImage: '/images/team/founder_badge.png',
    quote: 'I believe students can do more than participate in opportunities created by others. They can create those opportunities themselves.',
    tagline: 'Student, creator, and founder working to build engaging spaces for youth to explore ideas and unlock potential.',
    bioIntro: [
      "I'm a student who believes that young people should have more opportunities to learn, explore ideas, and do meaningful things beyond the classroom. That belief is what led me to start TKFK."
    ],
    sections: [
      {
        title: 'Why TKFK Exists',
        paragraphs: [
          'I believe there is a lot of potential among students that often goes unnoticed. Many have ideas, talents, and the willingness to do something different, but they need the right opportunities and a platform to get started.',
          'TKFK is my attempt to help create that space. Through educational initiatives, quizzes, competitions, and collaborative activities, we want to make learning more engaging and give young people opportunities to participate and contribute.'
        ]
      },
      {
        title: 'What I Believe',
        paragraphs: [
          'I believe students can do more than participate in opportunities created by others. They can create those opportunities themselves.',
          "Building TKFK has also taught me that meaningful projects don't need to begin perfectly. They need people willing to start, learn from experience, and keep improving."
        ]
      },
      {
        title: 'My View on Learning',
        paragraphs: [
          'For me, learning goes beyond textbooks and examinations. It happens when we ask questions, explore unfamiliar subjects, exchange ideas, and put what we know into practice.',
          'I want TKFK to be a place where curiosity leads to action and students feel encouraged to explore what they are capable of.'
        ]
      },
      {
        title: 'Where TKFK Is Headed',
        paragraphs: [
          'TKFK is a student-led initiative, and I want us to keep creating meaningful learning opportunities for students and young creators across Kerala and beyond.',
          'There is plenty left to build and learn. Our focus is on growing a community that gives people genuine reasons to participate, contribute, and develop their interests.'
        ]
      }
    ],
    noteToYou: [
      "If you're a student with an idea, a curious learner, or someone looking for opportunities to get involved, I hope you find a place for yourself at TKFK.",
      "You don't have to wait until you know everything to get started. Sometimes, you learn the most by taking the first step.",
      "Let's learn and build together."
    ],
    signOff: {
      name: 'Muhammed Asad P',
      role: 'Founder, TKFK',
      closingLine: "Let's learn and build together."
    },
    otherMemberSlug: 'muhammed-mahamood',
    otherMemberLabel: 'Read Co-founder Muhammed Mahamood’s perspective'
  },

  'muhammed-mahamood': {
    slug: 'muhammed-mahamood',
    aliases: ['co-founder', 'cofounder', 'mahamood'],
    name: 'Muhammed Mahamood',
    shortName: 'Mahamood',
    role: 'Co-founder',
    fullRole: 'Co-founder of TKFK | The Knowledge Forum Kerala',
    badgeLabel: "CO-FOUNDER'S NOTE",
    image: '/images/team/mahamood.png',
    badgeImage: '/images/team/cofounder_badge.png',
    quote: 'I believe good ideas become meaningful when people are willing to put in the work behind them.',
    tagline: 'Co-founder and builder focused on creating accessible pathways for curious minds to participate and grow.',
    bioIntro: [
      "I'm Muhammed Mahamood, the co-founder of TKFK, a student-led learning community built to create more opportunities for students to learn, participate, and explore their interests.",
      "Being part of TKFK is about more than helping run an initiative. It's about being part of an idea that can grow into something useful for students, and contributing to that journey one step at a time."
    ],
    sections: [
      {
        title: 'Why TKFK Matters to Me',
        paragraphs: [
          'I believe students need spaces where they can explore their interests beyond their regular academic life. Opportunities to participate, share ideas, challenge themselves, and learn from others can make a real difference.',
          "TKFK gives us a chance to work towards that. Through educational activities, quizzes, competitions, and other initiatives, we're trying to make learning more engaging and bring students closer to opportunities they might otherwise miss."
        ]
      },
      {
        title: 'What I Believe',
        paragraphs: [
          'I believe good ideas become meaningful when people are willing to put in the work behind them.',
          'Building something with others takes patience, responsibility, and a willingness to learn. Not every idea works as expected, but every experience gives us something to improve on.',
          'For me, being a co-founder means taking responsibility for the work we do, supporting the people involved, and helping TKFK grow in a direction that stays true to its purpose.'
        ]
      },
      {
        title: 'Learning Beyond the Classroom',
        paragraphs: [
          'Education gives us a foundation, but curiosity helps us go further.',
          'I value opportunities that encourage students to think independently, discover new interests, and learn through experience. A quiz, a competition, or a collaborative project can be much more than a single activity when it inspires someone to explore something new.',
          "That's the kind of impact I hope our work at TKFK can have."
        ]
      },
      {
        title: 'Looking Ahead',
        paragraphs: [
          "We're still building, learning, and figuring out how TKFK can serve students better.",
          'My hope is that we continue creating opportunities that bring curious minds together and encourage more students to take part, contribute ideas, and discover their potential.',
          "There's a lot ahead of us, and I'm looking forward to being part of what TKFK becomes."
        ]
      }
    ],
    noteToYou: [
      'TKFK is built around the belief that learning becomes more meaningful when we take part in it.',
      "If you're someone who enjoys exploring ideas, participating in new experiences, or finding opportunities to grow, I hope you'll find something valuable in our community.",
      "Let's keep learning, trying, and building together."
    ],
    signOff: {
      name: 'Muhammed Mahamood',
      role: 'Co-founder, The Knowledge Forum Kerala (TKFK)',
      closingLine: "Let's keep learning, trying, and building together."
    },
    otherMemberSlug: 'muhammed-asad',
    otherMemberLabel: 'Read Founder Muhammed Asad P’s perspective'
  }
};

export function getTeamMemberBySlug(rawSlug: string): TeamMember | null {
  const normalized = rawSlug.toLowerCase().trim();
  if (TEAM_MEMBERS[normalized]) {
    return TEAM_MEMBERS[normalized];
  }
  for (const member of Object.values(TEAM_MEMBERS)) {
    if (member.slug === normalized || member.aliases.includes(normalized)) {
      return member;
    }
  }
  return null;
}
