const fs = require('fs');

const parsed = require('./questions_parsed.json');

// For Q5, Q17, Q20, we provide accurate Malayalam translations matching the English question and options:
const customMl = {
  5: {
    question: "1910-ൽ ജോഹന്നാസ്ബർഗിനടുത്ത് സത്യാഗ്രഹികൾക്കായി നിർമ്മിച്ച രണ്ടാമത്തെ ആശ്രമത്തിന് ഭൂമി ദാനം ചെയ്തത് ആരാണ്?",
    option_a: "ദാദാ അബ്ദുള്ള",
    option_b: "മാഡലീൻ സ്ലേഡ്",
    option_c: "ഹെർമൻ കാലൻബാക്ക്",
    option_d: "ശൗക്കത്തലി"
  },
  17: {
    question: "1925 മാർച്ചിലെ തന്റെ രണ്ടാമത്തെ കേരള സന്ദർശന വേളയിൽ മഹാത്മാ ഗാന്ധി പോലീസ് കമ്മീഷണറുമായി കൂടിക്കാഴ്ച നടത്തി. അദ്ദേഹത്തിന്റെ പേരെന്തായിരുന്നു?",
    option_a: "കമ്മീഷണർ പിറ്റ്",
    option_b: "കമ്മീഷണർ മൺറോ",
    option_c: "കമ്മീഷണർ ഡയർ",
    option_d: "കമ്മീഷണർ ഇർവിൻ"
  },
  20: {
    question: "1934-ൽ നാലാമത്തെ കേരള സന്ദർശന വേളയിൽ കോഴിക്കോട്ടെ മാതൃഭൂമി പ്രസ്സ് ഓഫീസിലേക്ക് മഹാത്മാ ഗാന്ധി എങ്ങനെയാണ് എത്തിയത്?",
    option_a: "സർക്കാർ നൽകിയ മോട്ടോർ കാറിൽ",
    option_b: "ടെർമിനലിൽ നിന്നുള്ള പാസഞ്ചർ ട്രെയിനിൽ",
    option_c: "പരമ്പരാഗത കാളവണ്ടിയിൽ",
    option_d: "അനുയായികൾക്കൊപ്പം നടന്ന്"
  }
};

const categories = [
  "Early Life & Marriage",
  "Education & Law",
  "South Africa Journey",
  "Satyagraha Origins",
  "South Africa Ashrams",
  "Sabarmati Ashram",
  "Early Satyagrahas in India",
  "Salt Satyagraha & Dandi",
  "Poona Pact",
  "Philosophy & Influences",
  "Constructive Programme",
  "Autobiography & Literature",
  "Hind Swaraj",
  "Journalism & Publications",
  "Harijan Movement",
  "First Kerala Visit (1920)",
  "Second Kerala Visit (1925)",
  "Third Kerala Visit (1927)",
  "Fourth Kerala Visit (1934)",
  "Fourth Kerala Visit (1934)",
  "Fifth Kerala Visit (1937)",
  "Vaikom Satyagraha",
  "Vaikom Satyagraha",
  "Vaikom Satyagraha",
  "Guruvayur Satyagraha",
  "Salt Satyagraha in Kerala",
  "Quit India & Kasturba",
  "Bardoli Satyagraha",
  "Congress Presidency",
  "Memorials & Samadhi",
  "South Africa Works",
  "Non-Cooperation Movement",
  "Kheda Satyagraha",
  "Early Influences & Plays",
  "Family Background",
  "Natal Indian Congress",
  "Gokhale's Advice",
  "Champaran Satyagraha",
  "Quit India Movement",
  "Philosophy of Swaraj",
  "Philosophy of Khadi",
  "Health & Naturopathy",
  "Fourth Kerala Visit (1934)",
  "Tagore in Kerala",
  "Assassination & Memorial",
  "Round Table Conference",
  "Guruvayur Satyagraha",
  "Publications & Journalism",
  "Political Legacy",
  "Historical Reference Sources"
];

const full50Questions = [];

for (let i = 0; i < 50; i++) {
  const en = parsed.en[i];
  const mlOriginal = parsed.ml[i];
  const qNum = i + 1;

  const ml = customMl[qNum] ? {
    question: customMl[qNum].question,
    option_a: customMl[qNum].option_a,
    option_b: customMl[qNum].option_b,
    option_c: customMl[qNum].option_c,
    option_d: customMl[qNum].option_d
  } : {
    question: mlOriginal.question,
    option_a: mlOriginal.option_a,
    option_b: mlOriginal.option_b,
    option_c: mlOriginal.option_c,
    option_d: mlOriginal.option_d
  };

  full50Questions.push({
    id: `q-${qNum}`,
    question_text: en.question,
    question_text_ml: ml.question,
    option_a: en.option_a,
    option_a_ml: ml.option_a,
    option_b: en.option_b,
    option_b_ml: ml.option_b,
    option_c: en.option_c,
    option_c_ml: ml.option_c,
    option_d: en.option_d,
    option_d_ml: ml.option_d,
    correct_option: en.correct_option,
    category: categories[i] || "Gandhi History & Module",
    difficulty: i < 15 ? "EASY" : i < 35 ? "MEDIUM" : "HARD",
    explanation: `Answer is option ${en.correct_option}. Ref: TKFK Gandhi Knowledge Challenge Study Module.`
  });
}

fs.writeFileSync('scripts/full_50_bilingual_questions.json', JSON.stringify(full50Questions, null, 2));
console.log('Successfully generated full 50 bilingual questions JSON!');
