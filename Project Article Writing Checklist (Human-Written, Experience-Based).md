# Project Article Writing Checklist (Human-Written, Experience-Based)

A working checklist for turning your own project code into original articles, plus a guide to how a real person writes: the pattern, the structure, and the punctuation.

**Part 1** is the 75-point checklist. **Part 2** covers human writing patterns, structure, and punctuation.

# Part 1: The 75-Point Checklist

## A. Before writing

1. **Choose one narrow problem.** One article, one problem.
2. **Pick one reader.** Beginner, mid-level dev, or agency owner? Write for that person only.
3. **Check search intent.** Google your topic and see what the top results cover. Find what they miss, and make that your angle.
4. **Write the one-sentence promise.** "After reading this, you'll be able to \_\_\_." If you can't finish it, the topic is too broad.
5. **Check you're allowed to share it.** Look at NDAs, client contracts, and employer rules.
6. **Collect proof first:** screenshots, logs, error messages, commit history, timings, costs.
7. **Reproduce the key steps** on a clean setup, so you know the tutorial works for someone else.
8. **Note your versions:** Node, n8n, library versions, OS, and the date you tested.

## B. Anonymize and sanitize

9. Remove API keys, tokens, passwords, and `.env` values.
10. Blur emails, phone numbers, names, and real URLs in screenshots.
11. Rename clients ("a mortgage prospect" or "Client A").
12. Check browser tabs, bookmarks, and notifications visible in screenshots.
13. Check image metadata (EXIF) if you share photos.
14. Don't share private or proprietary business logic.

## C. Structure

15. **Title:** specific, with the problem or result and your angle. Avoid clickbait.
16. **Intro (first 100 words):** the problem, the result, and why you're qualified to write it.
17. **TL;DR box** for readers who want the answer fast.
18. **Prerequisites list:** tools, accounts, and skill level needed.
19. **Headings (H2/H3)** that read like a story: problem, failed attempts, fix, results.
20. **Short paragraphs:** 2 to 4 lines.
21. **One idea per section.**
22. **Conclusion:** what you learned, limits, and next steps.
23. **Closing section:** related posts and where to ask questions.

## D. Content that shows real experience

24. What you tried first and **why it failed**.
25. Exact error messages in code blocks.
26. Dead ends and hours lost.
27. Decisions and trade-offs ("I chose X over Y because...").
28. Real numbers, with before and after.
29. Costs, such as API bills and server costs.
30. When this approach is a **bad fit**.
31. What you'd do differently now.
32. Your honest opinion, not a neutral summary.

## E. Code and technical details

33. Show only relevant snippets (10 to 30 lines), not whole files.
34. Explain **why** each part exists, not just what it does.
35. Label the language on every code block.
36. Put filenames above snippets so readers know where the code goes.
37. Make code copy-paste ready and tested.
38. Include the expected output after commands.
39. Add a troubleshooting section for common errors.
40. Link a public GitHub repo or demo if you can.
41. Note security warnings (never expose keys, validate inputs).

## F. Visuals

42. Use your own screenshots only. No stock images.
43. Crop to the relevant area and add arrows or highlights.
44. Add a simple architecture or workflow diagram.
45. Use before/after images where there are results.
46. Add alt text to every image.
47. Compress images so the page stays fast.
48. Use descriptive file names (`n8n-webhook-error.png`).

## G. Writing style

49. Use first person ("I tried," "I found").
50. Use plain, spoken-style language and contractions.
51. Be specific ("dropped from 14 min to 2 min"), not vague ("much faster").
52. Define jargon once.
53. Cut filler ("in today's world," "it's important to note").
54. Vary sentence length.
55. Avoid hype and unproven claims.
56. Read it aloud and fix anything that sounds robotic.

## H. Originality and honesty

57. Never copy text. Paraphrase docs and link them.
58. Cite official docs or sources for facts you didn't create.
59. Don't claim results you didn't measure.
60. Say when something is your opinion.
61. Add an affiliate or sponsorship disclosure if relevant.
62. Run a plagiarism check before publishing.

## I. Final edit

63. Fix typos and grammar.
64. Check that every step works in order.
65. Test every link.
66. Check how it looks on mobile.
67. Make sure headings match the content.
68. Delete anything that doesn't help the reader.
69. Add an author box with your real name, photo, and short bio.
70. Add the publish date and an "updated" date.

## J. After publishing

71. Add internal links to related posts, and link back from older ones.
72. Request indexing in Google Search Console.
73. Re-read after a few days and fix anything unclear.
74. Update the post when tools or versions change.
75. Reply to comments and questions. It shows a real person is behind the site.

## Most important vs. least important

- **Must-haves:** #24, #28, #6, #9 to #11, #33 to #37, #42, #57, #62
- **Nice-to-haves:** #44, #48, #61, #72

# Part 2: How a Human Actually Writes

This part answers: if a real person wrote this article, what pattern would it follow, what structure, and which punctuation habits?

## An honest note first

No single mark proves a text is AI or human. AI detectors are unreliable and give false positives on human writing, and Google doesn't use them to approve sites. The goal is not to "beat a detector." The goal is writing that sounds like one specific person who did the work.

Em dashes are a good example. Humans use them too, and plenty of good writers love them. But AI models use them far more often than most people do, so readers have started to treat them as a tell. The practical rule: **avoid them, or use them very rarely.** You lose nothing by using a period, a comma, a colon, or parentheses instead.

## The human writing pattern

A person writing about their own project usually follows this pattern, even without planning it:

- **Starts in the middle of the problem.** "My workflow kept dropping leads, and I couldn't tell why." Not a broad intro about the industry.
- **Tells it in time order.** First I tried this, then that broke, then I found the real cause.
- **Includes small, specific details.** The Tuesday it broke, the 3 hours lost on one setting, the exact error text.
- **Admits uncertainty.** "I'm not 100% sure why this works, but it did."
- **Corrects itself.** "Turns out I was wrong about that."
- **Has opinions.** "Honestly, I'd skip this tool."
- **Wanders a little, then comes back.** One short aside is fine. Five is a problem.
- **Is uneven.** Some sections are long because the problem was hard. Others are two lines because the fix was easy.
- **Ends without a bow.** A next step, an open question, or the last lesson. Not a recap of everything.

## The structure a human follows

Humans follow the story of the work, not a perfectly balanced template.

1. **Hook:** the problem and result in 2 to 3 lines.
2. **Short context:** what the project is (anonymized), only as much as needed.
3. **The first attempt and why it failed.** Usually the longest part.
4. **The fix**, with code, screenshots, and why it works.
5. **Results** with real numbers.
6. **Limits and what I'd change.**
7. **A natural ending.** No "In conclusion."

Structure habits that look human:

- Headings that sound like something you'd say ("The part that broke everything") mixed with plain ones ("The fix").
- Sections of different lengths.
- Lists only where a list is truly the best format (steps, requirements). Explanations stay in normal paragraphs.
- Paragraphs of 1 to 4 lines, with an occasional one-line paragraph for emphasis.
- Not every section ends with a neat summary sentence.

Structure habits that look machine-made:

- Every section has the same length and the same three bullets.
- Every bullet starts with a bolded label and a colon.
- A tidy intro, body, and "In conclusion" recap, every time.
- Headings that all follow one formula.

## Punctuation guide

**Use freely**

- **Periods.** Short sentences are fine.
- **Commas.** Normal, natural use.
- **Question marks** to talk to the reader ("Why did this happen?").
- **Parentheses** for quick asides (like this one).
- **Contractions:** I'm, don't, it's, can't.

**Use sparingly**

- **Colons.** Good before a list or code, but don't open every bullet with "Label: explanation."
- **Semicolons.** Most casual writers rarely use them.
- **Exclamation marks.** One in a whole article is plenty.
- **Ellipses (...).** Occasionally, for a trailing thought.
- **Bold text.** Only for a few truly key terms, not random phrases in every paragraph.

**Avoid or minimize**

- **Em dashes.** Replace with a period, comma, colon, or parentheses. Example: instead of "The fix was simple, and it took me three days to find" written with a dash, just split it into two sentences.
- **Dashes used for dramatic pauses** in general.
- **Emoji in headings and bullets.**
- **Heavy use of quotation marks** around ordinary words.
- **Mixing straight and curly quotes.** Pick one style and stay consistent.
- **Arrow symbols and decorative separators** in body text.

## Sentence-level habits

- Mix short and long sentences. A very short one lands well after a long one.
- Start a sentence with "And" or "But" now and then.
- Use a fragment on purpose, occasionally. Like this.
- Talk to the reader directly: "you" and "I."
- Use concrete nouns and numbers: "a $6/month VPS," not "a cost-effective hosting solution."
- Prefer simple verbs: use, build, fix, break. Not utilize, leverage, facilitate.

## Phrases and patterns to cut

These show up constantly in machine-written text. Cut them or rewrite them in plain words.

**Overused words:** delve, tapestry, landscape, leverage, seamless, robust, game-changer, unlock, elevate, crucial, pivotal, ever-evolving, realm, paramount, harness, streamline, holistic.

**Overused openers and closers:**

- "In today's fast-paced digital world..."
- "Let's dive in."
- "Whether you're a beginner or an expert..."
- "It's important to note that..."
- "In conclusion..." and "In summary..."
- "Navigating the complexities of..."
- "I hope this helps!" at the end of every post.

**Overused sentence patterns:**

- "It's not just X, it's Y." and "Not only X, but also Y."
- Lists of exactly three adjectives ("fast, reliable, and scalable").
- A rhetorical question followed right away by its answer, in every section.
- A summary sentence that repeats the paragraph you just wrote.
- Perfectly balanced "On one hand... on the other hand..." with no opinion at the end.

## Before and after examples

**Machine-sounding:**

> In today's fast-paced digital landscape, leveraging automation is crucial for streamlining lead management. This comprehensive guide will delve into how to build a seamless workflow.

**Human-sounding:**

> My lead workflow was dropping about 1 in 10 enquiries and I had no idea why. It took me two evenings to find the cause. Here's what I did.

**Machine-sounding:**

> The solution is robust, scalable, and efficient, providing a seamless user experience.

**Human-sounding:**

> It handled 500 test leads without a single failure. It's not pretty, but it works, and it costs me about $6 a month.

**Machine-sounding:**

> It is important to note that API rate limits may impact performance.

**Human-sounding:**

> I hit the rate limit at around 60 requests a minute. Everything just stopped, with no error message at all. That one cost me a whole afternoon.

## A simple human-article template

Fill this in for each project article.

1. **One-line problem:** \_\_\_\_\_\_
2. **What I expected to happen:** \_\_\_\_\_\_
3. **What actually happened (error, numbers, screenshot):** \_\_\_\_\_\_
4. **First thing I tried, and why it didn't work:** \_\_\_\_\_\_
5. **What finally worked:** \_\_\_\_\_\_
6. **Why it works (in plain words):** \_\_\_\_\_\_
7. **Result in numbers:** \_\_\_\_\_\_
8. **What I'd do differently:** \_\_\_\_\_\_
9. **Who should NOT use this approach:** \_\_\_\_\_\_

Write the draft by answering these in order, in your own voice. Then add code and images, and edit last.

## Final scan before publishing

Run through this in two minutes:

- Search the draft for em dashes and replace nearly all of them.
- Search for the cut-list words above (delve, leverage, seamless, robust, crucial).
- Check for "In conclusion" and "It's important to note."
- Check that not every section has the same length and the same bullet pattern.
- Read it out loud. If you wouldn't say a sentence to a colleague, rewrite it.
- Confirm there is at least one failure, one real number, and one screenshot.

If you use AI at all, use it only to check grammar on a draft you wrote yourself, then reread and put your own voice back in. Never publish its text as it came out.
