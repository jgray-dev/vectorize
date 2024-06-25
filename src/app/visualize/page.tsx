"use client";

import React, { useState } from "react";
import { getEmbedding } from "~/server/queries";
import { insertPinecone, searchPinecone } from "~/server/hidden";

interface HeatmapComponentProps {
  embedding: number[];
}

interface HoveredValue {
  value: number;
  x: number;
  y: number;
}

const EmbeddingVisualizer: React.FC = () => {
  const [input1, setInput1] = useState<string>("");
  const [input2, setInput2] = useState<string>("");
  const [embedding1, setEmbedding1] = useState<number[]>([]);
  const [embedding2, setEmbedding2] = useState<number[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");

  const handleSubmit = async () => {
    try {
      const emb1 = await getEmbedding(input1);
      const emb2 = await getEmbedding(input2);
      setEmbedding1(emb1);
      setEmbedding2(emb2);
      setAdditionalInfo("Embeddings generated successfully!");
      void (await insertPinecone(emb1, 1));
      void (await insertPinecone(emb2, 2));
      const similarity = await searchPinecone();
      setAdditionalInfo(`Similarity ${similarity}`);
    } catch (error) {
      setAdditionalInfo(
        `Error generating embeddings: ${(error as Error).message}`,
      );
    }
  };

  const HeatmapComponent: React.FC<HeatmapComponentProps> = ({ embedding }) => {
    const [hoveredValue, setHoveredValue] = useState<HoveredValue | null>(null);

    const minValue = Math.min(...embedding);
    const maxValue = Math.max(...embedding);

    const cellSize = 12;
    const cols = 48;
    const rows = 32;

    return (
      <div style={{ position: "relative" }}>
        <svg width={cols * cellSize} height={rows * cellSize}>
          {embedding.map((value, index) => {
            const x = (index % cols) * cellSize;
            const y = Math.floor(index / cols) * cellSize;
            const color = getColor(value, minValue, maxValue);
            return (
              <rect
                key={index}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={color}
                onMouseEnter={() => setHoveredValue({ value, x, y })}
                onMouseLeave={() => setHoveredValue(null)}
              />
            );
          })}
        </svg>
        {hoveredValue && (
          <div
            style={{
              position: "absolute",
              left: hoveredValue.x + cellSize / 2,
              top: hoveredValue.y - 20,
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "2px 4px",
              borderRadius: "3px",
              fontSize: "12px",
              pointerEvents: "none",
              zIndex: 100,
            }}
          >
            {hoveredValue.value.toFixed(4)}
          </div>
        )}
      </div>
    );
  };

  function getColor(value: number, minValue: number, maxValue: number): string {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const transformedValue =
      (Math.sign(normalizedValue - 0.5) *
        Math.pow(Math.abs(normalizedValue - 0.5) * 2, 0.65)) /
        2 +
      0.5;
    const hue = transformedValue * 360;
    const saturation = 100;
    const lightness = 50 + (transformedValue - 0.5) * 40;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  return (
    <div className="w-full space-y-8 p-10 pt-20">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="input1" className="block">
            Input 1
          </label>
          <input
            id="input1"
            className="w-full rounded border p-2 text-black"
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            placeholder="Enter text for Input 1"
          />
        </div>
        <div className="space-y-2">
          <p className="font-bold">Additional Info</p>
          <div className="min-h-[40px] rounded border p-2">
            {additionalInfo}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="input2" className="block">
            Input 2
          </label>
          <input
            id="input2"
            className="w-full rounded border p-2 text-black"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Enter text for Input 2"
          />
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
      <div className="grid grid-cols-2 gap-16">
        <div className="flex flex-col items-center">
          <h3 className="mb-4 text-center text-lg font-bold">
            Heatmap for Input 1
          </h3>
          {embedding1.length > 0 && <HeatmapComponent embedding={embedding1} />}
        </div>
        <div className="flex flex-col items-center">
          <h3 className="mb-4 text-center text-lg font-bold">
            Heatmap for Input 2
          </h3>
          {embedding2.length > 0 && <HeatmapComponent embedding={embedding2} />}
        </div>
      </div>
    </div>
  );
};

export default EmbeddingVisualizer;
