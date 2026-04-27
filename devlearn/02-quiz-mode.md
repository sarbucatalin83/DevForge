# Feature 2 — Written Answer Quiz Mode

## Description

A flashcard-style question and answer mode using open text only (no multiple choice,
no code). Tests conceptual knowledge across all topics and difficulty levels.

## Content Format

Each quiz item is a JSON object with the following fields:

```json
{
  "id": "string",
  "track": "javascript | typescript | react",
  "topic": "string",
  "difficulty": "beginner | intermediate | advanced | senior",
  "type": "quiz",
  "question": "string",
  "answer": "string",
  "explanation": "string"
}
```

Questions and answers are **pre-generated offline** by the content CLI script. The app
never calls the Claude API at runtime.

## Quiz Flow

1. User selects a track, topic, and difficulty using the filter sidebar.
2. The app loads a question from the matching content files.
3. User reads the question and types a free-text answer in a text area.
4. User clicks **Submit**.
5. The app immediately reveals the stored correct answer side by side with the user's answer.
6. The stored explanation is also shown.
7. User self-assesses by clicking **I got it** (pass) or **I missed it** (fail).
8. Progress is recorded in localStorage.
9. The next question is queued or the user navigates manually.

## Show Answer

- A **Show Answer** button is available at any point before submitting.
- Clicking it reveals the correct answer and explanation immediately without requiring a
  submission.
- The result is recorded as "skipped" in progress tracking (neither pass nor fail).

## Post-Submission Display

- Correct answer and explanation are **always shown** after every submission, regardless of
  whether the user passed or failed — every attempt is a learning moment.

## Navigation

- Users can move freely between questions (previous / next / jump to any).
- No mandatory completion order.
