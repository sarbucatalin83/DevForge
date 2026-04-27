# Content Sources

The content generation CLI script instructs Claude to base all generated questions and
exercises on the authoritative sources listed here. Sources are grouped by track.

Update this file after the user selects their preferred sources. The generation script
reads this file to include the relevant source list in its Claude prompt.

---

## JavaScript Sources

<!-- Populate after user selects from the candidate list -->

| ID | Resource | URL | Notes |
|----|----------|-----|-------|
| JS1 | The Modern JavaScript Tutorial | https://javascript.info/ | Covers JS from basics to advanced; interactive exercises |
| JS2 | MDN JavaScript Guide | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide | Official reference; authoritative on web APIs |
| JS3 | Eloquent JavaScript (4th ed.) | https://eloquentjavascript.net/ | Book with exercises; free online |
| JS4 | You Don't Know JS Yet (Kyle Simpson) | https://github.com/getify/You-Dont-Know-JS | Deep-dive series; intermediate to senior |
| JS5 | JavaScript: The Definitive Guide (Flanagan, 7th ed.) | https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/ | Comprehensive reference |
| JS6 | freeCodeCamp JS Curriculum | https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/ | Beginner-friendly; project-based |
| JS7 | The Odin Project — JavaScript Path | https://www.theodinproject.com/paths/full-stack-javascript | Project-based; beginner to intermediate |

---

## TypeScript Sources

| ID | Resource | URL | Notes |
|----|----------|-----|-------|
| TS1 | TypeScript Official Handbook | https://www.typescriptlang.org/docs/handbook/intro.html | Official; all levels |
| TS2 | TypeScript Deep Dive (Basarat Ali) | https://basarat.gitbook.io/typescript/ | Free; comprehensive; all levels |
| TS3 | learntypescript.dev | https://learntypescript.dev/ | Interactive; beginner to advanced; includes quizzes |
| TS4 | Total TypeScript (Matt Pocock) | https://www.totaltypescript.com/ | Exercises; intermediate to senior; partial free |
| TS5 | No BS TS — Jack Herrington (YouTube) | https://www.youtube.com/playlist?list=PLNqp92_EXZBJYFrpEzdO2EapvU0GOJ09n | Video; intermediate |
| TS6 | Effective TypeScript (Dan Vanderkam) | https://effectivetypescript.com/ | Book; intermediate to senior |

---

## React Sources

| ID | Resource | URL | Notes |
|----|----------|-----|-------|
| R1 | React Official Docs (react.dev) | https://react.dev/learn | Official; interactive; all levels |
| R2 | The Road to React (Robin Wieruch) | https://www.roadtoreact.com/ | Book; beginner to intermediate; partial free |
| R3 | Joy of React (Josh Comeau) | https://www.joyofreact.com/ | Interactive course; intermediate to senior |
| R4 | Scrimba — Learn React | https://scrimba.com/learn/learnreact | Interactive video; beginner; partial free |
| R5 | The Odin Project — React Path | https://www.theodinproject.com/paths/full-stack-javascript/courses/react | Project-based; beginner to intermediate |
| R6 | patterns.dev | https://www.patterns.dev/ | Design patterns; advanced to senior; free |
| R7 | Bulletproof React (Alan Alickovic) | https://github.com/alan2207/bulletproof-react | Architecture guide; senior; free |

---

## Selection Status

> **TODO**: User to select which sources from each track to include.
> Update the `selected` column below and configure the generation script accordingly.

| ID | Selected |
|----|----------|
| JS1 | ⬜ |
| JS2 | ⬜ |
| JS3 | ⬜ |
| JS4 | ⬜ |
| JS5 | ⬜ |
| JS6 | ⬜ |
| JS7 | ⬜ |
| TS1 | ⬜ |
| TS2 | ⬜ |
| TS3 | ⬜ |
| TS4 | ⬜ |
| TS5 | ⬜ |
| TS6 | ⬜ |
| R1  | ⬜ |
| R2  | ⬜ |
| R3  | ⬜ |
| R4  | ⬜ |
| R5  | ⬜ |
| R6  | ⬜ |
| R7  | ⬜ |
