"use server";
import "server-only";

import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "~/env";

const pc = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

const index = pc.Index(env.PINECONE_ENVIRONMENT);

export async function insertPinecone(embedding: number[], id: number) {
  return index.namespace("default").upsert([
    {
      id: `${id}`,
      values: embedding,
    },
  ]);
}

export async function searchPinecone() {
  const queryResponse = await index.namespace("default").query({
    id: "1",
    topK: 1,
    includeValues: true,
  });
  // console.log(queryResponse);
  const similar = await index.namespace("default").query({
    // @ts-expect-error fts
    vector: queryResponse.matches[0].values,
    topK: 2,
    includeValues: false,
  });
  // @ts-expect-error fts
  return similar.matches[1].score
}
