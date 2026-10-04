const fs = require('fs');

// 1. Read existing OFFICIAL_50_QUESTIONS from src/data/questions.ts or require it
const rawTs = fs.readFileSync('src/data/questions.ts', 'utf8');

// Parse rawQuestions from user prompt
const rawQuestions = `
1. What was Mahatma Gandhi's full name?
മഹാത്മാഗാന്ധിയുടെ പൂർണ്ണനാമം എന്തായിരുന്നു?
A) Mohandas Karamchand Gandhi — മോഹൻദാസ് കരംചന്ദ് ഗാന്ധി
B) Mohanlal Karamchand Gandhi — മോഹൻലാൽ കരംചന്ദ് ഗാന്ധി
C) Mohandas Kasturba Gandhi — മോഹൻദാസ് കസ്തൂർബാ ഗാന്ധി
D) Karamchand Mohandas Gandhi — കരംചന്ദ് മോഹൻദാസ് ഗാന്ധി
2. Gandhi was born on:
ഗാന്ധിജി ജനിച്ചത് എന്നാണ്?
A) 2 October 1869 — 1869 ഒക്ടോബർ 2
B) 2 October 1870 — 1870 ഒക്ടോബർ 2
C) 9 January 1869 — 1869 ജനുവരി 9
D) 30 January 1869 — 1869 ജനുവരി 30
3. Which place is identified as Gandhi's birthplace in the module?
മൊഡ്യൂൾ പ്രകാരം ഗാന്ധിജിയുടെ ജന്മസ്ഥലം ഏതാണ്?
A) Rajkot — രാജ്കോട്ട്
B) Porbandar — പോർബന്തർ
C) Ahmedabad — അഹമ്മദാബാദ്
D) Bombay — ബോംബെ
4. Gandhi's birthplace in Porbandar is now known as:
പോർബന്തറിലെ ഗാന്ധിജിയുടെ ജന്മസ്ഥലം ഇപ്പോൾ അറിയപ്പെടുന്നത് ഏത് പേരിലാണ്?
A) Gandhi Bhavan — ഗാന്ധി ഭവൻ
B) Gandhi Smriti — ഗാന്ധി സ്മൃതി
C) Kirti Mandir — കീർത്തി മന്ദിർ
D) Sabarmati Ashram — സബർമതി ആശ്രമം
5. Who was Gandhi's father?
ഗാന്ധിജിയുടെ പിതാവ് ആരായിരുന്നു?
A) Gopal Krishna Gokhale — ഗോപാലകൃഷ്ണ ഗോഖലെ
B) Karamchand Gandhi — കരംചന്ദ് ഗാന്ധി
C) Mahadev Desai — മഹാദേവ് ദേശായി
D) Vallabhbhai Patel — വല്ലഭഭായ് പട്ടേൽ
6. Which school did Gandhi attend in Rajkot?
രാജ്കോട്ടിൽ ഗാന്ധിജി പഠിച്ച സ്കൂൾ ഏതാണ്?
A) Alfred High School — ആൽഫ്രഡ് ഹൈസ്കൂൾ
B) Shyamaldas College — ശ്യാംദാസ് കോളേജ്
C) Inner Temple — ഇന്നർ ടെംപിൾ
D) Gujarat College — ഗുജറാത്ത് കോളേജ്
7. Where did Gandhi obtain his legal qualification in London?
ലണ്ടനിൽ ഗാന്ധിജി നിയമ വിദ്യാഭ്യാസം പൂർത്തിയാക്കിയത് എവിടെയാണ്?
A) Oxford — ഓക്സ്ഫോർഡ്
B) Cambridge — കേംബ്രിഡ്ജ്
C) Inner Temple — ഇന്നർ ടെംപിൾ
D) London School of Law — ലണ്ടൻ സ്കൂൾ ഓഫ് ലോ
8. During his time in London, Gandhi became a member of the:
ലണ്ടനിൽ താമസിച്ചിരുന്ന കാലത്ത് ഗാന്ധിജി ഏത് സംഘടനയിൽ അംഗമായി?
A) Indian National Congress — ഇന്ത്യൻ നാഷണൽ കോൺഗ്രസ്
B) Vegetarian Society — വെജിറ്റേറിയൻ സൊസൈറ്റി
C) Natal Indian Congress — നാറ്റൽ ഇന്ത്യൻ കോൺഗ്രസ്
D) Young India Society — യങ് ഇന്ത്യ സൊസൈറ്റി
9. Why did Gandhi initially travel to South Africa in 1893?
1893-ൽ ഗാന്ധിജി ദക്ഷിണാഫ്രിക്കയിലേക്ക് ആദ്യം പോയതിന്റെ കാരണം എന്തായിരുന്നു?
A) To establish an ashram — ഒരു ആശ്രമം സ്ഥാപിക്കാൻ
B) To study law — നിയമം പഠിക്കാൻ
C) To represent Dada Abdullah in a legal dispute — ദാദാ അബ്ദുള്ളയുടെ നിയമതർക്കത്തിൽ അദ്ദേഹത്തെ പ്രതിനിധീകരിക്കാൻ
D) To lead a political movement — ഒരു രാഷ്ട്രീയ പ്രസ്ഥാനം നയിക്കാൻ
10. The Pietermaritzburg incident occurred in:
പീറ്റർമാരിറ്റ്സ്ബർഗ് സംഭവം നടന്നത് ഏത് വർഷത്തിലാണ്?
A) 1888
B) 1893
C) 1906
D) 1915
11. What happened to Gandhi at Pietermaritzburg?
പീറ്റർമാരിറ്റ്സ്ബർഗിൽ ഗാന്ധിജിക്ക് എന്താണ് സംഭവിച്ചത്?
A) He was arrested for protesting — പ്രതിഷേധിച്ചതിന് അറസ്റ്റ് ചെയ്തു
B) He was removed from a train because of racial discrimination — വംശീയ വിവേചനം കാരണം ട്രെയിനിൽ നിന്ന് പുറത്താക്കി
C) His law practice was closed — അദ്ദേഹത്തിന്റെ നിയമപ്രവർത്തനം അടച്ചുപൂട്ടി
D) He was imprisoned for refusing tax — നികുതി നൽകാൻ വിസമ്മതിച്ചതിന് ജയിലിലാക്കി
12. The Natal Indian Congress was established in:
നാറ്റൽ ഇന്ത്യൻ കോൺഗ്രസ് സ്ഥാപിതമായത് ഏത് വർഷത്തിലാണ്?
A) 1893
B) 1894
C) 1903
D) 1906
13. The first use of the term/practice of Satyagraha mentioned in the module occurred in:
മൊഡ്യൂളിൽ പരാമർശിക്കുന്ന സത്യാഗ്രഹത്തിന്റെ ആദ്യ പ്രയോഗം നടന്നത് ഏത് വർഷത്തിലാണ്?
A) 1894
B) 1903
C) 1906
D) 1915
14. Against which law was Gandhi's first Satyagraha in South Africa organised?
ദക്ഷിണാഫ്രിക്കയിലെ ഗാന്ധിജിയുടെ ആദ്യ സത്യാഗ്രഹം ഏത് നിയമത്തിനെതിരെയായിരുന്നു?
A) Rowlatt Act — റൗലട്ട് ആക്ട്
B) Salt Act — ഉപ്പ് നിയമം
C) Asiatic Registration Act — ഏഷ്യാറ്റിക് രജിസ്ട്രേഷൻ ആക്ട്
D) Government of India Act — ഗവൺമെന്റ് ഓഫ് ഇന്ത്യ ആക്ട്
15. Which publication did Gandhi start in South Africa in 1903?
1903-ൽ ദക്ഷിണാഫ്രിക്കയിൽ ഗാന്ധിജി ആരംഭിച്ച പ്രസിദ്ധീകരണം ഏതാണ്?
A) Young India — യങ് ഇന്ത്യ
B) Indian Opinion — ഇന്ത്യൻ ഒപ്പീനിയൻ
C) Harijan — ഹരിജൻ
D) Navajivan — നവജീവൻ
16. The Phoenix Settlement was established in:
ഫീനിക്സ് സെറ്റിൽമെന്റ് സ്ഥാപിതമായത് ഏത് വർഷത്തിലാണ്?
A) 1903
B) 1904
C) 1906
D) 1909
17. The Tolstoy Farm was established near:
ടോൾസ്റ്റോയ് ഫാം സ്ഥിതി ചെയ്തിരുന്നത് എവിടെയാണ്?
A) Durban — ഡർബൻ
B) Johannesburg — ജൊഹന്നാസ്ബർഗ്
C) Porbandar — പോർബന്തർ
D) Ahmedabad — അഹമ്മദാബാദ്
18. On what date did Gandhi return to India?
ഗാന്ധിജി ഇന്ത്യയിലേക്ക് മടങ്ങിയെത്തിയത് ഏത് തീയതിയിലാണ്?
A) 2 October — ഒക്ടോബർ 2
B) 30 January — ജനുവരി 30
C) 9 January — ജനുവരി 9
D) 12 March — മാർച്ച് 12
19. Gandhi's return to India is associated with which observance?
ഗാന്ധിജിയുടെ ഇന്ത്യയിലേക്കുള്ള തിരിച്ചുവരവ് ഏത് ദിനാചരണവുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു?
A) Republic Day — റിപ്പബ്ലിക് ഡേ
B) Pravasi Bharatiya Divas — പ്രവാസി ഭാരതീയ ദിവസ്
C) Independence Day — സ്വാതന്ത്ര്യദിനം
D) Gandhi Jayanti — ഗാന്ധിജയന്തി
20. Who was Gandhi's political guru?
ഗാന്ധിജിയുടെ രാഷ്ട്രീയ ഗുരു ആരായിരുന്നു?
A) Jawaharlal Nehru — ജവഹർലാൽ നെഹ്റു
B) Gopal Krishna Gokhale — ഗോപാലകൃഷ്ണ ഗോഖലെ
C) Rajendra Prasad — രാജേന്ദ്ര പ്രസാദ്
D) C. F. Andrews — സി. എഫ്. ആൻഡ്രൂസ്
21. Which ashram did Gandhi establish first in Ahmedabad?
അഹമ്മദാബാദിൽ ഗാന്ധിജി ആദ്യം സ്ഥാപിച്ച ആശ്രമം ഏതാണ്?
A) Sabarmati Ashram — സബർമതി ആശ്രമം
B) Kochrab Ashram — കൊച്ച്രബ് ആശ്രമം
C) Phoenix Settlement — ഫീനിക്സ് സെറ്റിൽമെന്റ്
D) Tolstoy Farm — ടോൾസ്റ്റോയ് ഫാം
22. Kochrab Ashram was later relocated to the banks of the:
കൊച്ച്രബ് ആശ്രമം പിന്നീട് ഏത് നദിയുടെ തീരത്തേക്കാണ് മാറ്റിയത്?
A) Ganges — ഗംഗ
B) Yamuna — യമുന
C) Sabarmati — സബർമതി
D) Narmada — നർമ്മദ
23. Which was Gandhi's first Satyagraha in India?
ഇന്ത്യയിൽ ഗാന്ധിജി നടത്തിയ ആദ്യ സത്യാഗ്രഹം ഏതാണ്?
A) Kheda — ഖേദ
B) Ahmedabad — അഹമ്മദാബാദ്
C) Champaran — ചമ്പാരൻ
D) Rowlatt — റൗലട്ട്
24. The Champaran Satyagraha was associated with:
ചമ്പാരൻ സത്യാഗ്രഹം ഏത് വിഭാഗവുമായി ബന്ധപ്പെട്ടതായിരുന്നു?
A) Indigo farmers — നീലകർഷകർ
B) Mill workers — മിൽ തൊഴിലാളികൾ
C) Salt workers — ഉപ്പ് തൊഴിലാളികൾ
D) Textile merchants — തുണിവ്യാപാരികൾ
25. Who invited Gandhi to Champaran?
ചമ്പാരനിലേക്ക് ഗാന്ധിജിയെ ക്ഷണിച്ചത് ആരായിരുന്നു?
A) Rajendra Prasad — രാജേന്ദ്ര പ്രസാദ്
B) Rajkumar Shukla — രാജ്കുമാർ ശുക്ല
C) Vallabhbhai Patel — വല്ലഭഭായ് പട്ടേൽ
D) Gopal Krishna Gokhale — ഗോപാലകൃഷ്ണ ഗോഖലെ
26. Gandhi's first hunger strike in India took place during:
ഇന്ത്യയിൽ ഗാന്ധിജി ആദ്യമായി നിരാഹാര സമരം നടത്തിയതുമായി ബന്ധപ്പെട്ട പ്രസ്ഥാനം ഏതാണ്?
A) Kheda Satyagraha — ഖേദ സത്യാഗ്രഹം
B) Ahmedabad Mill Strike — അഹമ്മദാബാദ് മിൽ സമരം
C) Champaran Satyagraha — ചമ്പാരൻ സത്യാഗ്രഹം
D) Rowlatt Satyagraha — റൗലട്ട് സത്യാഗ്രഹം
27. The Kheda Satyagraha was mainly connected with demands for:
ഖേദ സത്യാഗ്രഹം പ്രധാനമായും ഏത് ആവശ്യവുമായി ബന്ധപ്പെട്ടതായിരുന്നു?
A) Salt tax abolition — ഉപ്പ് നികുതി നിർത്തലാക്കൽ
B) Tax relief for affected farmers — പ്രതിസന്ധിയിലായ കർഷകർക്ക് നികുതി ഇളവ്
C) Factory wage increases — ഫാക്ടറി തൊഴിലാളികളുടെ വേതനവർധന
D) Separate electorates — പ്രത്യേക തിരഞ്ഞെടുപ്പ് മണ്ഡലങ്ങൾ
28. Which leader's leadership qualities became evident during the Kheda Satyagraha?
ഖേദ സത്യാഗ്രഹത്തിനിടെ ഏത് നേതാവിന്റെ നേതൃത്വഗുണങ്ങളാണ് ശ്രദ്ധേയമായത്?
A) Vallabhbhai Patel — വല്ലഭഭായ് പട്ടേൽ
B) Rajendra Prasad — രാജേന്ദ്ര പ്രസാദ്
C) C. F. Andrews — സി. എഫ്. ആൻഡ്രൂസ്
D) Mahadev Desai — മഹാദേവ് ദേശായി
29. Which sequence correctly represents Gandhi's early Indian Satyagrahas?
ഗാന്ധിജിയുടെ ആദ്യകാല ഇന്ത്യൻ സത്യാഗ്രഹങ്ങളുടെ ശരിയായ ക്രമം ഏതാണ്?
A) Kheda → Champaran → Ahmedabad
ഖേദ → ചമ്പാരൻ → അഹമ്മദാബാദ്
B) Ahmedabad → Kheda → Champaran
അഹമ്മദാബാദ് → ഖേദ → ചമ്പാരൻ
C) Champaran → Ahmedabad → Kheda
ചമ്പാരൻ → അഹമ്മദാബാദ് → ഖേദ
D) Champaran → Kheda → Ahmedabad
ചമ്പാരൻ → ഖേദ → അഹമ്മദാബാദ്
30. The Rowlatt Satyagraha took place in:
റൗലട്ട് സത്യാഗ്രഹം നടന്നത് ഏത് വർഷത്തിലാണ്?
A) 1917
B) 1919
C) 1920
D) 1922
31. The Non-Cooperation Movement began in:
നിസ്സഹകരണ പ്രസ്ഥാനം ആരംഭിച്ചത് ഏത് വർഷത്തിലാണ്?
A) 1919
B) 1920
C) 1924
D) 1930
32. Which was part of the Non-Cooperation programme?
നിസ്സഹകരണ പ്രസ്ഥാനത്തിന്റെ പരിപാടിയിൽ ഉൾപ്പെട്ടിരുന്നത് ഏതാണ്?
A) Boycott of government institutions and foreign cloth
സർക്കാർ സ്ഥാപനങ്ങളും വിദേശ വസ്ത്രങ്ങളും ബഹിഷ്കരിക്കൽ
B) Armed resistance — സായുധ പ്രതിരോധം
C) Tax collection — നികുതി പിരിവ്
D) Formation of a separate army — പ്രത്യേക സൈന്യം രൂപീകരിക്കൽ
33. Which event led Gandhi to withdraw the Non-Cooperation Movement?
നിസ്സഹകരണ പ്രസ്ഥാനം പിൻവലിക്കാൻ ഗാന്ധിജിയെ പ്രേരിപ്പിച്ച സംഭവം ഏതാണ്?
A) Jallianwala Bagh — ജാലിയൻവാലാബാഗ്
B) Chauri Chaura — ചൗരി ചൗര
C) Dandi March — ദണ്ഡി മാർച്ച്
D) Poona Pact — പൂനാ ഉടമ്പടി
34. The Chauri Chaura incident occurred in:
ചൗരി ചൗര സംഭവം നടന്നത് ഏത് വർഷത്തിലാണ്?
A) 1919
B) 1920
C) 1922
D) 1930
35. The Dandi March began from:
ദണ്ഡി മാർച്ച് ആരംഭിച്ചത് എവിടെ നിന്നാണ്?
A) Kochrab Ashram — കൊച്ച്രബ് ആശ്രമം
B) Sabarmati Ashram — സബർമതി ആശ്രമം
C) Phoenix Settlement — ഫീനിക്സ് സെറ്റിൽമെന്റ്
D) Porbandar — പോർബന്തർ
36. Approximately how far was the Dandi March?
ദണ്ഡി മാർച്ചിന്റെ ഏകദേശ ദൂരം എത്രയായിരുന്നു?
A) 185 km — 185 കി.മീ.
B) 285 km — 285 കി.മീ.
C) 385 km — 385 കി.മീ.
D) 485 km — 485 കി.മീ.
37. How many followers marched with Gandhi?
ഗാന്ധിജിയോടൊപ്പം എത്ര അനുയായികളാണ് ദണ്ഡി മാർച്ചിൽ പങ്കെടുത്തത്?
A) 58
B) 68
C) 78
D) 88
38. The Gandhi-Irwin Pact was signed in:
ഗാന്ധി-ഇർവിൻ ഉടമ്പടി ഒപ്പുവെച്ചത് ഏത് വർഷത്തിലാണ്?
A) 1930
B) 1931
C) 1932
D) 1934
39. Who was the Viceroy involved in the Gandhi-Irwin Pact?
ഗാന്ധി-ഇർവിൻ ഉടമ്പടിയിൽ ഉൾപ്പെട്ട വൈസ്രോയി ആരായിരുന്നു?
A) Lord Curzon — ലോർഡ് കർസൺ
B) Lord Irwin — ലോർഡ് ഇർവിൻ
C) Lord Mountbatten — ലോർഡ് മൗണ്ട്ബാറ്റൺ
D) Lord Wavell — ലോർഡ് വേവൽ
40. The Poona Pact was associated with Gandhi and:
പൂനാ ഉടമ്പടി ഗാന്ധിജിയുമായി ആരെയാണ് ബന്ധിപ്പിക്കുന്നത്?
A) Jawaharlal Nehru — ജവഹർലാൽ നെഹ്റു
B) B. R. Ambedkar — ബി. ആർ. അംബേദ്കർ
C) Rajendra Prasad — രാജേന്ദ്ര പ്രസാദ്
D) Vallabhbhai Patel — വല്ലഭഭായ് പട്ടേൽ
41. The Quit India Movement was launched on:
ക്വിറ്റ് ഇന്ത്യാ പ്രസ്ഥാനം ആരംഭിച്ചത് എന്നാണ്?
A) 8 August 1942 — 1942 ഓഗസ്റ്റ് 8
B) 15 August 1942 — 1942 ഓഗസ്റ്റ് 15
C) 26 January 1942 — 1942 ജനുവരി 26
D) 2 October 1942 — 1942 ഒക്ടോബർ 2
42. Where was the Quit India call given?
ക്വിറ്റ് ഇന്ത്യാ പ്രസ്ഥാനത്തിന്റെ ആഹ്വാനം നൽകിയത് എവിടെയാണ്?
A) Sabarmati Ashram — സബർമതി ആശ്രമം
B) Gowalia Tank Maidan, Bombay — ഗോവാലിയ ടാങ്ക് മൈതാനം, ബോംബെ
C) Dandi — ദണ്ഡി
D) Rajghat — രാജ്ഘട്ട്
43. Which phrase was Gandhi's famous call during the Quit India Movement?
ക്വിറ്റ് ഇന്ത്യാ പ്രസ്ഥാനകാലത്ത് ഗാന്ധിജിയുടെ പ്രസിദ്ധമായ ആഹ്വാനം ഏതാണ്?
A) Jai Hind — ജയ് ഹിന്ദ്
B) Swaraj is my birthright — സ്വരാജ് എന്റെ ജന്മാവകാശമാണ്
C) Do or Die — പ്രവർത്തിക്കുക അല്ലെങ്കിൽ മരിക്കുക
D) Truth is God — സത്യമാണ് ദൈവം
44. What does Gandhi's concept of Swaraj include?
ഗാന്ധിജിയുടെ സ്വരാജ് എന്ന ആശയത്തിൽ ഉൾപ്പെടുന്നത് എന്താണ്?
A) Only freedom from Britain — ബ്രിട്ടനിൽ നിന്നുള്ള സ്വാതന്ത്ര്യം മാത്രം
B) Self-rule and self-control — സ്വയംഭരണവും ആത്മനിയന്ത്രണവും
C) Military independence — സൈനിക സ്വാതന്ത്ര്യം
D) Economic isolation — സാമ്പത്തിക ഒറ്റപ്പെടൽ
45. The idea of Sarvodaya means:
സർവോദയ എന്ന ആശയത്തിന്റെ അർത്ഥം എന്താണ്?
A) Political independence — രാഷ്ട്രീയ സ്വാതന്ത്ര്യം
B) Welfare/upliftment of all — എല്ലാവരുടെയും ക്ഷേമവും ഉന്നമനവും
C) Village administration — ഗ്രാമഭരണം
D) Economic boycott — സാമ്പത്തിക ബഹിഷ്കരണം
46. The concept of Sarvodaya was inspired by John Ruskin's:
സർവോദയ ആശയത്തിന് പ്രചോദനമായ ജോൺ റസ്കിന്റെ കൃതി ഏതാണ്?
A) Hind Swaraj — ഹിന്ദ് സ്വരാജ്
B) Unto This Last — അൺടു ദിസ് ലാസ്റ്റ്
C) Key to Health — കീ ടു ഹെൽത്ത്
D) Young India — യങ് ഇന്ത്യ
47. Which book was written by Gandhi in 1909 during his voyage from London to South Africa?
1909-ൽ ലണ്ടനിൽ നിന്ന് ദക്ഷിണാഫ്രിക്കയിലേക്കുള്ള കപ്പൽ യാത്രയ്ക്കിടെ ഗാന്ധിജി എഴുതിയ പുസ്തകം ഏതാണ്?
A) Harijan — ഹരിജൻ
B) Hind Swaraj — ഹിന്ദ് സ്വരാജ്
C) Key to Health — കീ ടു ഹെൽത്ത്
D) Indian Opinion — ഇന്ത്യൻ ഒപ്പീനിയൻ
48. Which publication was associated with Gandhi from 1933?
1933 മുതൽ ഗാന്ധിജിയുമായി ബന്ധപ്പെട്ടിരുന്ന പ്രസിദ്ധീകരണം ഏതാണ്?
A) Harijan — ഹരിജൻ
B) Young India — യങ് ഇന്ത്യ
C) Navajivan — നവജീവൻ
D) Indian Opinion — ഇന്ത്യൻ ഒപ്പീനിയൻ
49. Who was known as the “Kerala Gandhi”?
“കേരള ഗാന്ധി” എന്നറിയപ്പെട്ടിരുന്നത് ആരായിരുന്നു?
A) K. Kelappan — കെ. കേളപ്പൻ
B) A. K. Gopalan — എ. കെ. ഗോപാലൻ
C) T. K. Madhavan — ടി. കെ. മാധവൻ
D) K. P. Kesava Menon — കെ. പി. കേശവ മേനോൻ
50. Which place was the main centre of the Salt Satyagraha in Kerala?
കേരളത്തിലെ ഉപ്പ് സത്യാഗ്രഹത്തിന്റെ പ്രധാന കേന്ദ്രം ഏതാണ്?
A) Vaikom — വൈക്കം
B) Kozhikode — കോഴിക്കോട്
C) Payyanur — പയ്യന്നൂർ
D) Sivagiri — ശിവഗിരി
`;

// Extract existing official questions array from src/data/questions.ts
const match = rawTs.match(/export const OFFICIAL_50_QUESTIONS: Question\[\] = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not find OFFICIAL_50_QUESTIONS in src/data/questions.ts');
  process.exit(1);
}

const existingQuestions = eval(match[1]);

// Parse lines
const lines = rawQuestions.split('\n').map(l => l.trim()).filter(l => l.length > 0);

let parsed = [];
let currentQ = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const qNumMatch = line.match(/^(\d+)\.\s*(.+)/);
  if (qNumMatch) {
    if (currentQ) parsed.push(currentQ);
    const num = parseInt(qNumMatch[1]);
    const engText = qNumMatch[2].trim();
    i++;
    const mlText = lines[i] ? lines[i].trim() : '';
    currentQ = {
      index: num,
      question_text: engText,
      question_text_ml: mlText,
      options: {}
    };
    continue;
  }

  const optMatch = line.match(/^([A-D])\)\s*(.+)/);
  if (optMatch && currentQ) {
    const optLetter = optMatch[1];
    const fullOpt = optMatch[2].trim();
    let engOpt = fullOpt;
    let mlOpt = fullOpt;
    if (fullOpt.includes('—')) {
      const parts = fullOpt.split('—').map(p => p.trim());
      engOpt = parts[0];
      mlOpt = parts[1] || parts[0];
    } else if (fullOpt.includes(' - ')) {
      const parts = fullOpt.split(' - ').map(p => p.trim());
      engOpt = parts[0];
      mlOpt = parts[1] || parts[0];
    } else {
      engOpt = fullOpt;
      mlOpt = fullOpt;
    }

    if (!fullOpt.includes('—') && !fullOpt.includes(' - ') && lines[i+1] && !lines[i+1].match(/^[A-D]\)/) && !lines[i+1].match(/^\d+\./)) {
      i++;
      mlOpt = lines[i].trim();
    }

    currentQ.options[optLetter] = { eng: engOpt, ml: mlOpt };
  }
}
if (currentQ) parsed.push(currentQ);

console.log(`Parsed ${parsed.length} questions.`);

const mergedQuestions = existingQuestions.map((orig, idx) => {
  const p = parsed[idx];
  if (!p) return orig;

  return {
    id: orig.id,
    question_text: p.question_text || orig.question_text,
    question_text_ml: p.question_text_ml || orig.question_text_ml,
    option_a: p.options.A ? p.options.A.eng : orig.option_a,
    option_a_ml: p.options.A ? p.options.A.ml : orig.option_a_ml,
    option_b: p.options.B ? p.options.B.eng : orig.option_b,
    option_b_ml: p.options.B ? p.options.B.ml : orig.option_b_ml,
    option_c: p.options.C ? p.options.C.eng : orig.option_c,
    option_c_ml: p.options.C ? p.options.C.ml : orig.option_c_ml,
    option_d: p.options.D ? p.options.D.eng : orig.option_d,
    option_d_ml: p.options.D ? p.options.D.ml : orig.option_d_ml,
    correct_option: orig.correct_option,
    category: orig.category,
    difficulty: orig.difficulty,
    explanation: orig.explanation
  };
});

const newTs = `import { Question } from '@/types';\n\nexport const OFFICIAL_50_QUESTIONS: Question[] = ${JSON.stringify(mergedQuestions, null, 2)};\n`;
fs.writeFileSync('src/data/questions.ts', newTs);
console.log('src/data/questions.ts updated successfully with exact user Malayalam questions!');
