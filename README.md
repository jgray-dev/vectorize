# Vectorize

This is devex tools I use, specifically for faster development of my app https://swe.ing

#### Normalize
Takes in one prompt (the user's message content) and a easily editable system prompt. Passes the users content through GPT-4t with the provided system prompt. Will display embeddings for both original and "normalized" message, along with their similarity score at the bottom of the page.

Example system prompt: `Using your knowledge of natural language processing, your task is to take a user's post content, and "generalize" it into text that would be converted well and accurately into an embedding. This embedding is used to generate recommendations for other user's on the platform. You should specifically focus on content that is excessively short or excessively long, but keep the demeanor and semantic meaning of the content. Note user's may be referencing images or video's you do not have access to. Use your best judgement in these situations. Do not return any boilerplate, or follow up text.`
****
Input text: `Javascript is like duct tape. Its usually not the right choice for the job, but it does so many jobs decently its difficult to live without it.`

Output text: `JavaScript is often compared to duct tape; while it may not always be the ideal solution for every programming task, its versatility makes it an indispensable tool in web development.`

Similarity: `0.907184482`
****
Input text: `When you accidentally delete a huge chunk of code and can't find the undo button. Panic mode engaged.`

Output text: `Experiencing panic after accidentally deleting a significant portion of code and being unable to locate the undo option.`

Similarity: `0.935776353`
****
Input text: `I hate errors I cant debug properly`

Output text: `Frustration with debugging errors that are challenging to resolve`

Similarity: `0.88071692`
****
Input text: `I hate intermittent bugs`

Output text: `Dislike for intermittent software bugs.`

Similarity: `0.917716563`
****
Input text: `Why do programmers prefer dark mode? Because light attracts bugs!`

Output text: `Programmers often prefer dark mode because it is believed to reduce the attraction of bugs, playing on the humorous notion that light attracts bugs in software development.`

Similarity: `0.927299201`
****
Input text: `squad [1 image]`
Note: "[1 image]" is put there my the system using this functionality. It's a way of telling GPT4 we do in fact have images, but we cannot show them properly.

Output text: `A picture of my group of friends.`

Similarity: `0.788798571`
****
Input text: ``

Output text: ``

Similarity: ``
****
Input text: ``

Output text: ``

Similarity: ``

This tool is used to test different system prompts to see how we can "normalize" or "generalize" text before converting it to an embedding. Similarity is shown to see just how far the embedding has deviated from the original. Best use case for this is when user's make really short messages, often referencing images we can't correctly convert into an embedding, or really long messages where the semantic meaning can't be easily found, or the user rant's about a lot of different topics.
