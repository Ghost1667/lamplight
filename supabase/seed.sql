-- Lamplight: starter lessons and questions.
-- Run after schema.sql (SQL Editor → New query → paste → Run).
-- Safe to run again: it updates the starter content and leaves anything you added alone.

begin;

insert into public.subjects (id, name, hue, bands, sort) values
  ($x$maths$x$, $x$Mathematics$x$, 222, array[$x$primary$x$, $x$jss$x$, $x$sss$x$]::text[], 1),
  ($x$english$x$, $x$English Language$x$, 150, array[$x$primary$x$, $x$jss$x$, $x$sss$x$]::text[], 2),
  ($x$basic-science$x$, $x$Basic Science$x$, 26, array[$x$primary$x$, $x$jss$x$]::text[], 3),
  ($x$biology$x$, $x$Biology$x$, 186, array[$x$sss$x$]::text[], 4)
on conflict (id) do update set name = excluded.name, hue = excluded.hue, bands = excluded.bands, sort = excluded.sort;

insert into public.topics (id, subject_id, band, title, summary, lesson, sort) values
  ($x$maths-primary-fractions$x$, $x$maths$x$, $x$primary$x$, $x$Fractions$x$, $x$What fractions mean, equal fractions, adding them and finding a fraction of a number.$x$,
$x$A fraction is a part of a whole. In ==3/4==, the top number (the **numerator**) tells how many parts we have. The bottom number (the **denominator**) tells how many equal parts the whole was cut into.

## Equal fractions
Multiply or divide the top and bottom by the same number and the fraction keeps its value.
- 1/2 = 2/4 = 4/8
- 6/9 = 2/3 (divide top and bottom by 3)
Writing a fraction with the smallest possible numbers is called **simplest form**.

## Adding fractions
When the denominators are the same, add the numerators and keep the denominator.
- 1/4 + 2/4 = 3/4

## Comparing unit fractions
A unit fraction has 1 on top. The ==bigger the denominator, the smaller the piece==, so 1/3 is bigger than 1/8.

## A fraction of a number
Divide by the denominator, then multiply by the numerator.
- 3/4 of 20: 20 ÷ 4 = 5, then 5 × 3 = 15$x$, 1),
  ($x$maths-jss-simple-equations$x$, $x$maths$x$, $x$jss$x$, $x$Simple equations$x$, $x$Solving for an unknown by doing the same thing to both sides.$x$,
$x$An equation says two things are equal, like ==x + 7 = 12==. Solving it means finding the value of the unknown (here x) that makes it true.

## The golden rule
Whatever you do to one side, do to the other side. This keeps the equation balanced, like a pair of scales.

## Undo each step
Use the opposite operation to get x on its own.
- Adding is undone by subtracting: x + 7 = 12, so x = 12 − 7 = 5
- Multiplying is undone by dividing: 3x = 21, so x = 21 ÷ 3 = 7
- Dividing is undone by multiplying: x/4 = 6, so x = 6 × 4 = 24

## Two steps
For 2x − 5 = 9, first add 5 to both sides (2x = 14), then divide by 2 (x = 7).

## Unknowns on both sides
Collect the x terms on one side and the numbers on the other.
- 5x + 2 = 3x + 10
- 5x − 3x = 10 − 2
- 2x = 8, so x = 4

## Always check
Put your answer back into the equation. If both sides come out equal, you are right.$x$, 1),
  ($x$maths-jss-percentages$x$, $x$maths$x$, $x$jss$x$, $x$Percentages$x$, $x$Changing between fractions, decimals and percentages, and percentage increase.$x$,
$x$Per cent means ==out of 100==. So 25% means 25 out of 100.

## Converting
- Percentage to fraction: put it over 100 and simplify. 25% = 25/100 = 1/4
- Fraction to percentage: multiply by 100. 3/5 × 100 = 60%
- Decimal to percentage: multiply by 100. 0.07 = 7%

## Percentage of an amount
Change the percentage to a fraction and multiply.
- 20% of ₦500 = 20/100 × 500 = ₦100

## Score as a percentage
Write the score as a fraction of the total, then multiply by 100.
- 36 out of 40 = 36/40 × 100 = 90%

## Percentage increase
Percentage increase = (increase ÷ ==original amount==) × 100
- A price rises from ₦800 to ₦1,000. The increase is ₦200.
- 200/800 × 100 = 25%
Always divide by the original amount, not the new one.$x$, 2),
  ($x$maths-sss-indices$x$, $x$maths$x$, $x$sss$x$, $x$Indices$x$, $x$The laws of indices, zero and negative powers, and fractional indices.$x$,
$x$In ==2⁵==, 2 is the **base** and 5 is the **index** (or power). It means 2 × 2 × 2 × 2 × 2 = 32.

## The laws of indices
- Multiplying: add the powers. aᵐ × aⁿ = aᵐ⁺ⁿ, so 2³ × 2⁴ = 2⁷
- Dividing: subtract the powers. aᵐ ÷ aⁿ = aᵐ⁻ⁿ
- Power of a power: multiply the powers. (aᵐ)ⁿ = aᵐⁿ, so (x³)² = x⁶
The base must be the same before you add or subtract powers.

## Zero and negative powers
- a⁰ = 1 for any a that is not zero
- A negative power means one over: a⁻ⁿ = 1/aⁿ, so 5⁻² = 1/25

## Fractional powers
- The bottom of the fraction is the root: a^(1/2) = √a, so 16^(1/2) = 4
- The top is the power: a^(m/n) = (ⁿ√a)ᵐ
- 27^(2/3): the cube root of 27 is 3, then 3² = 9
Take the root first. The numbers stay small.

## Indicial equations
Write both sides with the same base, then equate the powers.
- 2ˣ = 32 = 2⁵, so x = 5$x$, 1),
  ($x$english-primary-nouns-pronouns$x$, $x$english$x$, $x$primary$x$, $x$Nouns and pronouns$x$, $x$Naming words, plurals, collective nouns, and the words that replace nouns.$x$,
$x$A **noun** is a naming word. It names a person, animal, place or thing: ==girl, goat, market, book==.

## Common and proper nouns
- Common nouns name any one of a kind: city, river, teacher
- Proper nouns name a particular one and start with a capital letter: Lagos, River Niger, Mrs Okafor

## Plurals
Most nouns add -s (book → books). Some change in a special way:
- child → children
- man → men
- tooth → teeth

## Collective nouns
A collective noun names a group.
- a herd of cattle
- a flock of sheep
- a swarm of bees

## Pronouns
A **pronoun** takes the place of a noun so we don't repeat it.
- Emeka is my brother. ==He== is ten years old.
- The books are on the table. Please bring ==them== to me.
Use he for a boy or man, she for a girl or woman, it for a thing or animal, and they or them for more than one.$x$, 1),
  ($x$english-jss-concord$x$, $x$english$x$, $x$jss$x$, $x$Concord$x$, $x$Making the verb agree with its subject, including the tricky cases examiners love.$x$,
$x$**Concord** means agreement. A singular subject takes a singular verb, and a plural subject takes a plural verb.
- The boy ==is== here. The boys ==are== here.

## Tricky singular subjects
- Each, every, either, neither, everyone, nobody: Each of the boys ==has== a book.
- Subjects that look plural but are singular: Mathematics ==is== my favourite subject. The news ==is== good.
- Two nouns that form one idea: Bread and butter ==is== my favourite breakfast.

## Together with, as well as, along with
These phrases do not change the subject. Find the real subject before them.
- The teacher, together with her students, ==is== coming.

## Neither ... nor, either ... or
The verb agrees with the subject ==nearest to it==.
- Neither Tunde nor his friends ==are== at home.
- Neither his friends nor Tunde ==is== at home.

## Tip
Cover up the words between the subject and the verb, then read the sentence again.$x$, 1),
  ($x$english-jss-synonyms-antonyms$x$, $x$english$x$, $x$jss$x$, $x$Synonyms and antonyms$x$, $x$Words nearest in meaning and words opposite in meaning, as tested in lexis questions.$x$,
$x$A **synonym** is a word with ==nearly the same meaning==. An **antonym** is a word with the ==opposite meaning==.
- huge: synonym enormous, antonym tiny
- ancient: synonym old, antonym modern

## How exam questions ask
- "Choose the option nearest in meaning to the underlined word" asks for a synonym.
- "Choose the option opposite in meaning" asks for an antonym.
Read the question twice. Mixing these up is the most common way to lose easy marks.

## Use the sentence
The rest of the sentence often gives a clue.
- "The rain was incessant; it fell all week." Something that falls all week is continuous.

## Useful pairs
- generous / stingy
- diligent (hard-working) / lazy
- commence (begin) / conclude (end)
- incessant (continuous) / occasional$x$, 2),
  ($x$english-sss-figures-of-speech$x$, $x$english$x$, $x$sss$x$, $x$Figures of speech$x$, $x$Simile, metaphor, personification, hyperbole, alliteration and metonymy.$x$,
$x$Figures of speech use words in special ways to create a picture or an effect. They appear often in WAEC and JAMB literature and lexis questions.

## The ones to know
- **Simile**: compares using ==like or as==. "He is as brave as a lion."
- **Metaphor**: says one thing ==is== another, with no like or as. "Her voice is music to my ears."
- **Personification**: gives human qualities to a thing. "The wind whispered through the trees."
- **Hyperbole**: deliberate exaggeration. "I have told you a million times."
- **Alliteration**: the same first sound repeated in nearby words. "Peter Piper picked a peck of pickled peppers."
- **Metonymy**: a thing is named by something closely linked to it. "The pen is mightier than the sword": pen stands for writing, sword for force.

## Simile or metaphor?
Look for "like" or "as". If either one is doing the comparing, it is a simile. If not, it is a metaphor.$x$, 1),
  ($x$basic-science-primary-living-things$x$, $x$basic-science$x$, $x$primary$x$, $x$Living and non-living things$x$, $x$The signs that tell us something is alive.$x$,
$x$Everything around us is either **living** or **non-living**. A goat, a mango tree and a person are living. A stone, a chair and a car are non-living.

## Signs of life
Remember them with ==MR NIGER D==:
- **M**ovement: living things move on their own
- **R**espiration: they take in air to get energy from food
- **N**utrition: they feed. Plants make their own food using sunlight; this is called ==photosynthesis==
- **I**rritability: they respond to things around them, like touch or light
- **G**rowth: they grow bigger
- **E**xcretion: they get rid of waste from their bodies
- **R**eproduction: they produce young ones
- **D**eath: they die

## Non-living things
Non-living things do not feed, grow or reproduce. A car moves, but only when someone drives it.$x$, 1),
  ($x$basic-science-jss-energy$x$, $x$basic-science$x$, $x$jss$x$, $x$Energy$x$, $x$Forms of energy, how it changes from one form to another, and where we get it.$x$,
$x$**Energy** is the ability to do work. It is measured in ==joules (J)==.

## Forms of energy
- **Kinetic energy**: the energy of a moving object, like a moving okada
- **Potential energy**: stored energy because of position, like a mango high on a tree
- **Chemical energy**: stored in food, fuel and batteries
- **Heat**, **light**, **sound** and **electrical** energy

## Energy changes form
Energy is never used up. It changes from one form to another.
- A torch: chemical energy in the battery → light (and some heat)
- A generator: chemical energy in petrol → electrical energy
- Eating food: chemical energy → kinetic energy when you run

This is the ==law of conservation of energy==: energy cannot be created or destroyed, only changed from one form to another.

## Sources of energy
- **Renewable** sources do not run out: solar, wind, water (hydro)
- **Non-renewable** sources will run out: coal, petrol, natural gas$x$, 1),
  ($x$biology-sss-the-cell$x$, $x$biology$x$, $x$sss$x$, $x$The cell$x$, $x$The structure of plant and animal cells and what each part does.$x$,
$x$The **cell** is the ==basic unit of life==. Every living thing is made of one or more cells. Robert Hooke first described cells in 1665 when he looked at thin slices of cork under a microscope.

## Parts and their jobs
- **Cell membrane**: controls what enters and leaves the cell
- **Cytoplasm**: jelly-like fluid where most chemical reactions happen
- **Nucleus**: controls the activities of the cell and carries the genetic material
- **Mitochondria**: release energy from food in respiration (the "powerhouse" of the cell)
- **Ribosomes**: where proteins are made

## Found only in plant cells
- **Cell wall**: made of cellulose, gives the cell a firm shape
- **Chloroplasts**: contain chlorophyll; where ==photosynthesis== happens
- **Large central vacuole**: filled with cell sap

## Plant cell vs animal cell
Both have a nucleus, cytoplasm, cell membrane and mitochondria. Only plant cells have a cell wall, chloroplasts and a large vacuole. Animal cells usually have small vacuoles or none.$x$, 1)
on conflict (id) do update set subject_id = excluded.subject_id, band = excluded.band, title = excluded.title,
  summary = excluded.summary, lesson = excluded.lesson, sort = excluded.sort;

insert into public.questions (id, topic_id, question, options, answer, explanation) values
  ('6926b750-7440-5881-9dc3-3f8b25e93758', $x$maths-primary-fractions$x$, $x$Which fraction is equal to 1/2?$x$, array[$x$2/4$x$, $x$2/3$x$, $x$3/4$x$, $x$1/3$x$]::text[], 0, $x$Multiply the top and bottom of 1/2 by 2 and you get 2/4.$x$),
  ('67f8685d-afc1-5954-b8c9-9238302617dc', $x$maths-primary-fractions$x$, $x$What is 1/4 + 2/4?$x$, array[$x$3/4$x$, $x$3/8$x$, $x$2/8$x$, $x$1/2$x$]::text[], 0, $x$The denominators are the same, so add the numerators: 1 + 2 = 3. The answer is 3/4.$x$),
  ('ccb376a3-9c4c-5428-aea8-732c873c3dac', $x$maths-primary-fractions$x$, $x$Which of these fractions is the largest?$x$, array[$x$1/3$x$, $x$1/5$x$, $x$1/8$x$, $x$1/10$x$]::text[], 0, $x$For unit fractions, the smaller the denominator, the bigger the piece. 1/3 is the largest.$x$),
  ('1b3dcccf-e535-5362-80fa-bab9c7125f73', $x$maths-primary-fractions$x$, $x$What is 3/4 of 20?$x$, array[$x$15$x$, $x$12$x$, $x$16$x$, $x$5$x$]::text[], 0, $x$20 ÷ 4 = 5, and 5 × 3 = 15.$x$),
  ('9fe9be8a-3c53-5a95-8152-5e28b15fd509', $x$maths-primary-fractions$x$, $x$Write 6/9 in its simplest form.$x$, array[$x$2/3$x$, $x$3/4$x$, $x$1/3$x$, $x$3/2$x$]::text[], 0, $x$Divide the top and bottom by 3: 6 ÷ 3 = 2 and 9 ÷ 3 = 3.$x$),
  ('6c2cb4a4-7d32-5303-b332-555085dc9757', $x$maths-primary-fractions$x$, $x$In the fraction 5/8, which number is the denominator?$x$, array[$x$8$x$, $x$5$x$, $x$13$x$, $x$3$x$]::text[], 0, $x$The denominator is the bottom number. It tells how many equal parts the whole is divided into.$x$),
  ('346eef76-428f-5d68-bcbb-3f7623851bc0', $x$maths-jss-simple-equations$x$, $x$Solve: x + 7 = 12$x$, array[$x$5$x$, $x$19$x$, $x$−5$x$, $x$7$x$]::text[], 0, $x$Subtract 7 from both sides: x = 12 − 7 = 5.$x$),
  ('dda08cae-c4c9-55e4-93d8-48b174c4d8f1', $x$maths-jss-simple-equations$x$, $x$Solve: 3x = 21$x$, array[$x$7$x$, $x$18$x$, $x$24$x$, $x$63$x$]::text[], 0, $x$Divide both sides by 3: x = 21 ÷ 3 = 7.$x$),
  ('e9f3699f-7e42-5a36-adcd-1aca5b050420', $x$maths-jss-simple-equations$x$, $x$Solve: 2x − 5 = 9$x$, array[$x$7$x$, $x$2$x$, $x$4$x$, $x$14$x$]::text[], 0, $x$Add 5 to both sides to get 2x = 14, then divide by 2 to get x = 7.$x$),
  ('7fc3fecf-88eb-5abe-a938-940489e67702', $x$maths-jss-simple-equations$x$, $x$Solve: x/4 = 6$x$, array[$x$24$x$, $x$10$x$, $x$1.5$x$, $x$2$x$]::text[], 0, $x$Multiply both sides by 4: x = 6 × 4 = 24.$x$),
  ('a90012a6-4266-5a1b-96d8-0f352dd4d082', $x$maths-jss-simple-equations$x$, $x$I think of a number, double it and add 3. The answer is 17. What is my number?$x$, array[$x$7$x$, $x$10$x$, $x$14$x$, $x$5$x$]::text[], 0, $x$Write it as 2x + 3 = 17. Subtract 3 to get 2x = 14, so x = 7.$x$),
  ('b6ffe4e4-447a-5a7c-95c9-457a38d3095b', $x$maths-jss-simple-equations$x$, $x$Solve: 5x + 2 = 3x + 10$x$, array[$x$4$x$, $x$6$x$, $x$1.5$x$, $x$2$x$]::text[], 0, $x$Subtract 3x from both sides and subtract 2 from both sides: 2x = 8, so x = 4.$x$),
  ('94dc5b44-9e2f-5f17-8c93-68b13119a9aa', $x$maths-jss-percentages$x$, $x$Write 25% as a fraction in its lowest terms.$x$, array[$x$1/4$x$, $x$1/25$x$, $x$2/5$x$, $x$1/2$x$]::text[], 0, $x$25% = 25/100. Divide the top and bottom by 25 to get 1/4.$x$),
  ('3424578c-ddb2-5bb6-9eb3-cee6613f8550', $x$maths-jss-percentages$x$, $x$What is 20% of ₦500?$x$, array[$x$₦100$x$, $x$₦25$x$, $x$₦50$x$, $x$₦250$x$]::text[], 0, $x$20/100 × 500 = 100.$x$),
  ('210c8d12-3cc5-58d9-b0b2-78055301403e', $x$maths-jss-percentages$x$, $x$Express 3/5 as a percentage.$x$, array[$x$60%$x$, $x$35%$x$, $x$30%$x$, $x$53%$x$]::text[], 0, $x$3/5 × 100 = 60%.$x$),
  ('a040fd9f-5a1f-5b2a-96d9-2025d82d151c', $x$maths-jss-percentages$x$, $x$The price of a bag of rice rises from ₦800 to ₦1,000. What is the percentage increase?$x$, array[$x$25%$x$, $x$20%$x$, $x$200%$x$, $x$80%$x$]::text[], 0, $x$The increase is ₦200. Divide by the original price: 200/800 × 100 = 25%.$x$),
  ('0ea79793-afaf-5d11-aaec-6b396fc9f449', $x$maths-jss-percentages$x$, $x$Write 0.07 as a percentage.$x$, array[$x$7%$x$, $x$70%$x$, $x$0.7%$x$, $x$0.07%$x$]::text[], 0, $x$Multiply by 100: 0.07 × 100 = 7%.$x$),
  ('cc85c3e3-4d33-59c0-b2a7-386969fb1796', $x$maths-jss-percentages$x$, $x$Ada scored 36 out of 40 in a test. What is her score as a percentage?$x$, array[$x$90%$x$, $x$36%$x$, $x$85%$x$, $x$94%$x$]::text[], 0, $x$36/40 × 100 = 90%.$x$),
  ('642113a4-df98-5e01-aae7-efb31e09f11b', $x$maths-sss-indices$x$, $x$Simplify 2³ × 2⁴.$x$, array[$x$2⁷$x$, $x$2¹²$x$, $x$4⁷$x$, $x$2¹$x$]::text[], 0, $x$When multiplying with the same base, add the powers: 3 + 4 = 7.$x$),
  ('0e6dee8b-f44f-5de1-8111-0b10880b02f1', $x$maths-sss-indices$x$, $x$If a is not zero, what is a⁰?$x$, array[$x$1$x$, $x$0$x$, $x$a$x$, $x$−1$x$]::text[], 0, $x$Any non-zero number raised to the power 0 equals 1.$x$),
  ('8f739a86-6621-52b6-8f20-9a6cc357dc7e', $x$maths-sss-indices$x$, $x$Evaluate 5⁻².$x$, array[$x$1/25$x$, $x$−25$x$, $x$−10$x$, $x$1/10$x$]::text[], 0, $x$A negative power means one over: 5⁻² = 1/5² = 1/25.$x$),
  ('19bef0cc-1c8b-5188-a9c4-b9484a35d0c8', $x$maths-sss-indices$x$, $x$Evaluate 16^(1/2).$x$, array[$x$4$x$, $x$8$x$, $x$2$x$, $x$256$x$]::text[], 0, $x$A power of 1/2 means square root. √16 = 4.$x$),
  ('7ab876ba-2828-554d-9cbb-a169a64be1d4', $x$maths-sss-indices$x$, $x$Evaluate 27^(2/3).$x$, array[$x$9$x$, $x$18$x$, $x$3$x$, $x$6$x$]::text[], 0, $x$Cube root first: ∛27 = 3. Then square it: 3² = 9.$x$),
  ('b439d496-ac3b-54cf-b93a-8f886c1a2176', $x$maths-sss-indices$x$, $x$Simplify (x³)².$x$, array[$x$x⁶$x$, $x$x⁵$x$, $x$x⁹$x$, $x$2x³$x$]::text[], 0, $x$For a power of a power, multiply the powers: 3 × 2 = 6.$x$),
  ('ada79d09-e88d-5380-99c3-4a5f08a6ca40', $x$maths-sss-indices$x$, $x$Solve 2ˣ = 32.$x$, array[$x$5$x$, $x$16$x$, $x$4$x$, $x$6$x$]::text[], 0, $x$32 = 2⁵, so the powers must match: x = 5.$x$),
  ('5ff7e3de-bc59-5ba3-965f-dc2a5d1f55b1', $x$english-primary-nouns-pronouns$x$, $x$Which word is a noun in this sentence? "The girl ran to the market."$x$, array[$x$market$x$, $x$ran$x$, $x$the$x$, $x$to$x$]::text[], 0, $x$"Market" names a place, so it is a noun. ("Girl" is also a noun, but it is not one of the options.)$x$),
  ('c65bb32a-8e90-50a8-9e97-da6abf12fb48', $x$english-primary-nouns-pronouns$x$, $x$What is the plural of "child"?$x$, array[$x$children$x$, $x$childs$x$, $x$childrens$x$, $x$childes$x$]::text[], 0, $x$"Child" has a special plural: children.$x$),
  ('b880e31c-157a-5598-9660-b040485d9889', $x$english-primary-nouns-pronouns$x$, $x$Emeka is my brother. ___ is ten years old.$x$, array[$x$He$x$, $x$She$x$, $x$It$x$, $x$They$x$]::text[], 0, $x$Emeka is a boy, so we use "He".$x$),
  ('7ae708a0-74db-5ac6-a155-464c57bb7b0c', $x$english-primary-nouns-pronouns$x$, $x$Which of these is a proper noun?$x$, array[$x$Lagos$x$, $x$city$x$, $x$river$x$, $x$teacher$x$]::text[], 0, $x$Lagos is the name of a particular city, so it is a proper noun and starts with a capital letter.$x$),
  ('8c8102ce-1f94-54c9-9b0a-4dd074d8bef7', $x$english-primary-nouns-pronouns$x$, $x$The books are on the table. Please bring ___ to me.$x$, array[$x$them$x$, $x$it$x$, $x$they$x$, $x$him$x$]::text[], 0, $x$"Books" is plural, and the pronoun comes after "bring", so we use "them".$x$),
  ('e825934f-5f10-56b8-9608-f131a7202aba', $x$english-primary-nouns-pronouns$x$, $x$Complete the collective noun: a ___ of cattle.$x$, array[$x$herd$x$, $x$flock$x$, $x$swarm$x$, $x$pack$x$]::text[], 0, $x$We say a herd of cattle. A flock is for sheep or birds, and a swarm is for bees.$x$),
  ('8b1adf5b-b3e4-55ae-95b1-34400b924f29', $x$english-jss-concord$x$, $x$Each of the boys ___ a book.$x$, array[$x$has$x$, $x$have$x$, $x$are having$x$, $x$were having$x$]::text[], 0, $x$"Each" is singular, so it takes the singular verb "has".$x$),
  ('63d8135f-fcb4-55cd-8a49-4cb37ed4d95a', $x$english-jss-concord$x$, $x$The teacher, together with her students, ___ coming.$x$, array[$x$is$x$, $x$are$x$, $x$were$x$, $x$have been$x$]::text[], 0, $x$"Together with her students" does not change the subject. The subject is "The teacher", which is singular.$x$),
  ('697bb8a5-6370-566d-81b9-dcb30a0df994', $x$english-jss-concord$x$, $x$Neither Tunde nor his friends ___ at home.$x$, array[$x$are$x$, $x$is$x$, $x$was$x$, $x$has been$x$]::text[], 0, $x$With neither ... nor, the verb agrees with the nearer subject, "his friends", which is plural.$x$),
  ('4e83879b-85a0-5201-823d-b4d2ef3d9023', $x$english-jss-concord$x$, $x$Mathematics ___ my favourite subject.$x$, array[$x$is$x$, $x$are$x$, $x$were$x$, $x$have been$x$]::text[], 0, $x$Mathematics looks plural but is the name of one subject, so it takes "is".$x$),
  ('17fae768-2bea-51b6-a337-c7ca521e2fdf', $x$english-jss-concord$x$, $x$The news ___ good.$x$, array[$x$is$x$, $x$are$x$, $x$were$x$, $x$have been$x$]::text[], 0, $x$"News" is always treated as singular in English.$x$),
  ('63bff7dd-ad37-524d-850e-5826496b78e2', $x$english-jss-concord$x$, $x$Bread and butter ___ my favourite breakfast.$x$, array[$x$is$x$, $x$are$x$, $x$were$x$, $x$have been$x$]::text[], 0, $x$Bread and butter is one dish, a single idea, so it takes a singular verb.$x$),
  ('9b96ad69-49dd-57a9-9767-686fabe65fc6', $x$english-jss-synonyms-antonyms$x$, $x$Choose the word nearest in meaning to "huge".$x$, array[$x$enormous$x$, $x$tiny$x$, $x$narrow$x$, $x$quiet$x$]::text[], 0, $x$"Enormous" means very big, the same as "huge".$x$),
  ('d4fd79dd-014f-5a9a-9468-75f95d7e4dfe', $x$english-jss-synonyms-antonyms$x$, $x$Choose the word opposite in meaning to "generous".$x$, array[$x$stingy$x$, $x$kind$x$, $x$wealthy$x$, $x$honest$x$]::text[], 0, $x$A generous person gives freely. A stingy person does not like to give.$x$),
  ('211ef956-5dfc-5944-9c7e-6b5f22b0aaeb', $x$english-jss-synonyms-antonyms$x$, $x$"The rain was incessant." Which word is nearest in meaning to "incessant"?$x$, array[$x$continuous$x$, $x$light$x$, $x$sudden$x$, $x$cold$x$]::text[], 0, $x$"Incessant" means not stopping, which is continuous.$x$),
  ('5ef539be-a391-5d1c-acb5-ee27cc355496', $x$english-jss-synonyms-antonyms$x$, $x$Choose the word opposite in meaning to "ancient".$x$, array[$x$modern$x$, $x$old$x$, $x$broken$x$, $x$famous$x$]::text[], 0, $x$"Ancient" means very old. Its opposite is modern.$x$),
  ('9461c046-70e8-54a5-9fe7-1b052dfed14f', $x$english-jss-synonyms-antonyms$x$, $x$"Bola is very diligent." Choose the word opposite in meaning to "diligent".$x$, array[$x$lazy$x$, $x$careful$x$, $x$clever$x$, $x$rude$x$]::text[], 0, $x$"Diligent" means hard-working. The opposite is lazy.$x$),
  ('26852e72-ad65-5fa6-ad26-6f42dc3a58d6', $x$english-jss-synonyms-antonyms$x$, $x$Choose the word nearest in meaning to "commence".$x$, array[$x$begin$x$, $x$finish$x$, $x$delay$x$, $x$cancel$x$]::text[], 0, $x$"Commence" is a formal word for begin or start.$x$),
  ('5be1be54-6049-5fe6-a4e9-b98f79a07201', $x$english-sss-figures-of-speech$x$, $x$"Her voice is music to my ears." This is an example of$x$, array[$x$metaphor$x$, $x$simile$x$, $x$hyperbole$x$, $x$alliteration$x$]::text[], 0, $x$It says her voice IS music, without "like" or "as". That makes it a metaphor.$x$),
  ('3381c80a-b6b8-5f7f-88c6-fca106874ce1', $x$english-sss-figures-of-speech$x$, $x$"He is as brave as a lion." This is an example of$x$, array[$x$simile$x$, $x$metaphor$x$, $x$personification$x$, $x$metonymy$x$]::text[], 0, $x$The comparison uses "as ... as", so it is a simile.$x$),
  ('5925b6f9-a9e5-54bd-87a3-d7828e6e3eb7', $x$english-sss-figures-of-speech$x$, $x$"The wind whispered through the trees." This is an example of$x$, array[$x$personification$x$, $x$hyperbole$x$, $x$simile$x$, $x$alliteration$x$]::text[], 0, $x$Whispering is a human action given to the wind. That is personification.$x$),
  ('c143d4c6-a52c-5c76-b516-ed8c6d1d0e50', $x$english-sss-figures-of-speech$x$, $x$"I have told you a million times." This is an example of$x$, array[$x$hyperbole$x$, $x$metaphor$x$, $x$personification$x$, $x$simile$x$]::text[], 0, $x$Nobody has said something a million times. The deliberate exaggeration is hyperbole.$x$),
  ('1a174193-83cc-5b98-8736-cf6d0e9ac322', $x$english-sss-figures-of-speech$x$, $x$"Peter Piper picked a peck of pickled peppers." This is an example of$x$, array[$x$alliteration$x$, $x$onomatopoeia$x$, $x$simile$x$, $x$hyperbole$x$]::text[], 0, $x$The "p" sound is repeated at the start of nearby words. That is alliteration.$x$),
  ('33ef82da-2620-5415-ae5f-fcdc9662c7cf', $x$english-sss-figures-of-speech$x$, $x$"The pen is mightier than the sword." This is an example of$x$, array[$x$metonymy$x$, $x$simile$x$, $x$onomatopoeia$x$, $x$personification$x$]::text[], 0, $x$"Pen" stands for writing and "sword" for force. Naming a thing by something linked to it is metonymy.$x$),
  ('b46ccd1b-3df2-51d5-97b3-23dafd5198d6', $x$basic-science-primary-living-things$x$, $x$Which of these is a living thing?$x$, array[$x$goat$x$, $x$stone$x$, $x$chair$x$, $x$car$x$]::text[], 0, $x$A goat feeds, grows, breathes and produces young ones. The others cannot.$x$),
  ('b5956692-bfa1-54c2-a3f8-f4e670f148df', $x$basic-science-primary-living-things$x$, $x$Living things produce young ones. What is this called?$x$, array[$x$reproduction$x$, $x$respiration$x$, $x$excretion$x$, $x$nutrition$x$]::text[], 0, $x$Producing young ones is reproduction, the R at the end of MR NIGER D.$x$),
  ('96816239-4b66-5bb9-8d13-7c2ae864a160', $x$basic-science-primary-living-things$x$, $x$Which of these is NOT a sign of life?$x$, array[$x$rusting$x$, $x$growth$x$, $x$movement$x$, $x$feeding$x$]::text[], 0, $x$Rusting happens to iron, which is non-living. Growth, movement and feeding are signs of life.$x$),
  ('b886bc50-2c06-5ac1-96e0-0ecc6d2fb456', $x$basic-science-primary-living-things$x$, $x$Green plants make their own food using sunlight. What is this process called?$x$, array[$x$photosynthesis$x$, $x$excretion$x$, $x$respiration$x$, $x$irritability$x$]::text[], 0, $x$Plants use sunlight to make food in their leaves. This is photosynthesis.$x$),
  ('1f596cc9-cee0-5ff2-b119-8882311326a2', $x$basic-science-primary-living-things$x$, $x$Getting rid of waste from the body is called$x$, array[$x$excretion$x$, $x$reproduction$x$, $x$nutrition$x$, $x$growth$x$]::text[], 0, $x$Removing waste, like sweat and urine, is excretion.$x$),
  ('c1db0d32-9f26-576e-99d6-9c8f229338c0', $x$basic-science-primary-living-things$x$, $x$A plant bends towards light from a window. Which sign of life does this show?$x$, array[$x$irritability$x$, $x$reproduction$x$, $x$excretion$x$, $x$death$x$]::text[], 0, $x$Responding to light is irritability, also called sensitivity.$x$),
  ('7e6cd35d-153e-528a-ae6d-6b3c7c939c57', $x$basic-science-jss-energy$x$, $x$What is the SI unit of energy?$x$, array[$x$joule$x$, $x$watt$x$, $x$newton$x$, $x$metre$x$]::text[], 0, $x$Energy is measured in joules (J). Watts measure power and newtons measure force.$x$),
  ('95da7dbc-0d75-5c29-8709-e71ee3bc59e2', $x$basic-science-jss-energy$x$, $x$The energy stored in food is$x$, array[$x$chemical energy$x$, $x$kinetic energy$x$, $x$sound energy$x$, $x$light energy$x$]::text[], 0, $x$Food stores chemical energy, which the body releases during respiration.$x$),
  ('115bee07-18bf-56b9-a0a9-0a5724988173', $x$basic-science-jss-energy$x$, $x$The energy possessed by a moving object is$x$, array[$x$kinetic energy$x$, $x$potential energy$x$, $x$chemical energy$x$, $x$heat energy$x$]::text[], 0, $x$Kinetic energy is the energy of motion.$x$),
  ('78467567-8dec-5d04-9c49-032856991515', $x$basic-science-jss-energy$x$, $x$A torch changes chemical energy in the battery mainly into$x$, array[$x$light energy$x$, $x$sound energy$x$, $x$kinetic energy$x$, $x$chemical energy$x$]::text[], 0, $x$The battery’s chemical energy becomes electrical energy, then light (with some heat) in the bulb.$x$),
  ('4c486ba2-abdf-580c-9d91-2e98f0385e72', $x$basic-science-jss-energy$x$, $x$Which of these is a renewable source of energy?$x$, array[$x$solar$x$, $x$coal$x$, $x$petrol$x$, $x$natural gas$x$]::text[], 0, $x$Sunlight will not run out, so solar energy is renewable.$x$),
  ('fd184d3b-3bd2-5fca-9aea-1cd0fa20c968', $x$basic-science-jss-energy$x$, $x$"Energy cannot be created or destroyed, only changed from one form to another." This is$x$, array[$x$the law of conservation of energy$x$, $x$Newton’s first law of motion$x$, $x$the law of reflection$x$, $x$Ohm’s law$x$]::text[], 0, $x$This statement is the law of conservation of energy.$x$),
  ('970c3942-d12d-50ed-8fcb-e0b8209f188d', $x$biology-sss-the-cell$x$, $x$The basic unit of life is the$x$, array[$x$cell$x$, $x$tissue$x$, $x$organ$x$, $x$nucleus$x$]::text[], 0, $x$All living things are made of cells. Tissues and organs are built from cells.$x$),
  ('f9e14dc4-9cca-535a-9b3b-05c8ab077152', $x$biology-sss-the-cell$x$, $x$Which organelle releases energy during respiration?$x$, array[$x$mitochondrion$x$, $x$ribosome$x$, $x$nucleus$x$, $x$vacuole$x$]::text[], 0, $x$Mitochondria carry out respiration and release energy. They are called the powerhouse of the cell.$x$),
  ('7ecae651-bd20-55c5-baac-2e07814cd99a', $x$biology-sss-the-cell$x$, $x$Which structure is found in plant cells but NOT in animal cells?$x$, array[$x$cell wall$x$, $x$cell membrane$x$, $x$nucleus$x$, $x$cytoplasm$x$]::text[], 0, $x$Only plant cells have a cellulose cell wall. Both kinds have a membrane, nucleus and cytoplasm.$x$),
  ('9b4a19cb-fbb4-50de-a1fc-36dd6a95a1c5', $x$biology-sss-the-cell$x$, $x$Which part of the cell controls its activities?$x$, array[$x$nucleus$x$, $x$cytoplasm$x$, $x$cell wall$x$, $x$vacuole$x$]::text[], 0, $x$The nucleus contains the genetic material and controls the cell’s activities.$x$),
  ('3b8eb29f-a65e-5a00-bd7d-255baca0282c', $x$biology-sss-the-cell$x$, $x$Who first described cells, after looking at cork under a microscope in 1665?$x$, array[$x$Robert Hooke$x$, $x$Charles Darwin$x$, $x$Gregor Mendel$x$, $x$Louis Pasteur$x$]::text[], 0, $x$Robert Hooke saw tiny compartments in cork and named them cells.$x$),
  ('1e121e01-c26e-5388-bfc9-cc2e0849e529', $x$biology-sss-the-cell$x$, $x$Proteins are made in the$x$, array[$x$ribosomes$x$, $x$mitochondria$x$, $x$chloroplasts$x$, $x$vacuole$x$]::text[], 0, $x$Ribosomes are the site of protein synthesis.$x$),
  ('82da9d33-e196-59fa-8b20-b753491e685e', $x$biology-sss-the-cell$x$, $x$In a plant cell, photosynthesis takes place in the$x$, array[$x$chloroplast$x$, $x$nucleus$x$, $x$mitochondrion$x$, $x$cell membrane$x$]::text[], 0, $x$Chloroplasts contain chlorophyll, which traps light for photosynthesis.$x$)
on conflict (id) do update set topic_id = excluded.topic_id, question = excluded.question,
  options = excluded.options, answer = excluded.answer, explanation = excluded.explanation;

commit;
