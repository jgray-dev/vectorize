"use client";

import React, { useState, useCallback } from "react";
import { getEmbedding } from "~/server/queries";


function embeddingTo2D(embedding: number[]): [number, number] {
  return [0, 0];
}

export default function Page() {
  const [inputText, setInputText] = useState("");

  const handleAddEmbedding = useCallback(async () => {
    try {
      const embedding = await getEmbedding(inputText);
      if (Array.isArray(embedding) && embedding.length === 1536) {
        console.log(void embeddingTo2D(embedding)[0]);
      } else {
        console.error("Please enter a valid embedding (array of 1536 numbers)");
      }
    } catch (error) {
      console.error(error);
      alert("Invalid input. Please enter a valid JSON array.");
    }
  }, [inputText]);

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Embedding Visualization</h1>
      <div className="mb-4">
        <textarea
          className="w-full rounded border p-2 text-black"
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter a JSON array of 1536 numbers (embedding)"
        />
        <button
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleAddEmbedding}
        >
          Add Embedding
        </button>
      </div>
    </div>
  );
}
