"use client";

import { useEffect, useState } from "react";
import {callOpenAI, getEmbedding, vectorToString} from "~/server/queries";
import {insertPinecone, searchPinecone} from "~/server/hidden";

export default function Page() {
  const [text, setText] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [inputEmbedding, setInputEmbedding] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [generalizedText, setGeneralizedText] = useState("");
  const [generalizedEmbedding, setGeneralizedEmbedding] = useState("");
  const [similarity, setSimilarity] = useState("");

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  function handleChange(text: string) {
    setText(text);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      void submitChange(text);
    }, 2000);
    setTimeoutId(newTimeoutId);
  }

  async function submitChange(text: string) {
    const embedding = await getEmbedding(text);
    void await insertPinecone(embedding, 1)
    setInputEmbedding(await vectorToString(embedding));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const generalized = await callOpenAI(text, systemPrompt)
    // @ts-expect-error fts
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setGeneralizedText(generalized)
    // @ts-expect-error fts
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const generalizedEmbed = await getEmbedding(generalized)
    void await insertPinecone(generalizedEmbed, 2)
    setGeneralizedEmbedding(await vectorToString(generalizedEmbed))
    const similarity = await searchPinecone()
    setSimilarity(`${similarity}`)
  }

  return (
    <div className={"h-screen w-screen bg-black pt-12 text-white"}>
      <div className={"flex h-[70%] flex-row"}>
        <div className={"flex h-full w-full flex-col bg-red-400/20 p-4"}>
          <div className={"w-full"}>
            <textarea
              className={
                "min-h-36 w-full rounded-lg p-2 text-black placeholder-black/50"
              }
              placeholder={"Enter text here"}
              onChange={(e) => handleChange(e.target.value)}
              value={text}
            />
          </div>
          <div>
            <div
              className={
                "max-h-52 min-h-52 w-full overflow-scroll rounded-lg bg-white text-black"
              }
            >
              {inputEmbedding}
            </div>
          </div>
        </div>
        <div className={"h-full w-full bg-orange-400/20 p-4"}>
          <div>
            <textarea
              className={
                "min-h-56 w-full rounded-lg p-3 text-black placeholder-black/50"
              }
              placeholder={"System prompt"}
              onChange={(e) => setSystemPrompt(e.target.value)}
              value={systemPrompt}
            />
          </div>
        </div>
        <div className={"h-full w-full bg-green-400/20 p-4"}>
          <div>
            <div
              className={
                "max-h-36 min-h-36 w-full overflow-scroll rounded-lg bg-white text-black p-2 mb-2"
              }
            >
              {generalizedText}
            </div>
          </div>
          <div>
            <div
              className={
                "max-h-52 min-h-52 w-full overflow-scroll rounded-lg bg-white text-black"
              }
            >
              {generalizedEmbedding}
            </div>
          </div>
        </div>
      </div>

      <div className={"h-[30%] w-full bg-white/40"}>{similarity}</div>
    </div>
  );
}
