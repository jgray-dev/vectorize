"use server";

//Interfaces

// Embeddings interfaces
interface Embedding {
  object: string;
  embedding: number[];
  index: number;
}

interface Usage {
  total_tokens: number;
}

export interface Response {
  object: string;
  data: Embedding[];
  model: string;
  usage: Usage;
}

export async function getEmbedding(
  text: string,
  tags?: string,
): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  console.log("API Key:", apiKey);

  try {
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: `${text} ${tags}`,
        model: "voyage-large-2",
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: Response = await response.json();
    console.log(data);
    if (data.data[0]?.embedding) {
      return data.data[0].embedding;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function vectorToString(vector: number[]): Promise<string> {
  let string = "";
  vector.forEach((value) => {
    string += value.toString() + " ";
  });
  return string;
}

import OpenAI from "openai";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const openai = new OpenAI({
  apiKey: process.env.OPENAI,
});

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


