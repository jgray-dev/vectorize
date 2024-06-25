"use server";

import OpenAI from "openai";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const openai = new OpenAI({
  apiKey: process.env.OPENAI,
});


export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    if (embedding.data[0]?.embedding) {
      return embedding.data[0].embedding;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    return [0];
  }
}

export async function vectorToString(vector: number[]): Promise<string> {
  let string = "";
  vector.forEach((value) => {
    string += value.toString() + " ";
  });
  return string;
}



export async function callOpenAI(text: string, system: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: `${system}` },
      { role: "user", content: `${text}` },
    ],
    model: "gpt-4-turbo",
  }); 
  // @ts-expect-error fts
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
  return completion.choices[0].message.content
}