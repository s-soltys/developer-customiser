README.md

An interactive app that guides new team members through creating a comprehensive, engaging "How to Work With Me" guide through a conversational interface and questionnaire.

Categories include:
- Communication preferences (Slack vs email, response times, meeting preferences)
- Work style (deep focus hours, collaboration preferences, timezone considerations)
- Feedback style (direct vs diplomatic, frequency preferences)
- Strengths & growing areas
- Pet peeves & energizers
- Personal context (hobbies, fun facts that help build connection)

The user journey is:
- I type in my name
- For each category, I am shown a screen with questions
- Once I provide all answers for all, then I see a summary screen / card which I can share with colleagues with a link


This app uses React + Tailwind + React Query on Frontend
And uses Kotlin on Backend + Mongodb
I do not know the Kotlin ecosystem well enough so I would need to have to set it up (Kotlin, Mongodb etc.).
The app is a monorepo.
The data model should be flexible - I can later introduce new questions, hence maybe use a key-value pair.
Configure also CLAUDE.md files, and consider creating sub-agents for Kotlin and for React, that will follow your recommendations.
Scalability or performance are not concerns, this is a pure MVP.