"use client";

import React, { useState, useCallback, useMemo } from "react";
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

const HeatmapComponent: React.FC<HeatmapComponentProps> = React.memo(
  ({ embedding }) => {
    const [hoveredValue, setHoveredValue] = useState<HoveredValue | null>(null);

    const { minValue, maxValue, cellSize, cols, rows } = useMemo(
      () => ({
        minValue: Math.min(...embedding),
        maxValue: Math.max(...embedding),
        cellSize: 12,
        cols: 48,
        rows: 32,
      }),
      [embedding],
    );

    const getColor = useCallback(
      (value: number): string => {
        const normalizedValue = (value - minValue) / (maxValue - minValue);
        const transformedValue =
          (Math.sign(normalizedValue - 0.5) *
            Math.pow(Math.abs(normalizedValue - 0.5) * 2, 0.65)) /
            2 +
          0.5;
        const hue = transformedValue * 180 + 165;
        const saturation = 100;
        const lightness = 50 + (transformedValue - 0.5) * 40;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      },
      [minValue, maxValue],
    );

    return (
      <div className="relative w-full sm:w-auto">
        <svg
          className="h-auto w-full sm:h-[384px] sm:w-[576px]"
          viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}
        >
          {embedding.map((value, index) => {
            const x = (index % cols) * cellSize;
            const y = Math.floor(index / cols) * cellSize;
            const color = getColor(value);
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
            className="pointer-events-none absolute z-10 rounded bg-black bg-opacity-70 p-1 text-xs text-white"
            style={{
              left: hoveredValue.x + cellSize / 2,
              top: hoveredValue.y - 20,
            }}
          >
            {hoveredValue.value.toFixed(6)}
          </div>
        )}
      </div>
    );
  },
);

HeatmapComponent.displayName = "HeatmapComponent";

const EmbeddingVisualizer: React.FC = () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [inputs, setInputs] = useState({ input1: "", input2: "" });
  const [embeddings, setEmbeddings] = useState({
    embedding1: [],
    embedding2: [],
  });
  const [additionalInfo, setAdditionalInfo] = useState<string>("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setInputs((prev) => ({ ...prev, [id]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    try {
      const [emb1, emb2] = await Promise.all([
        getEmbedding(inputs.input1),
        getEmbedding(inputs.input2),
      ]);
      // @ts-expect-error fts
      setEmbeddings({ embedding1: emb1, embedding2: emb2 });
      setAdditionalInfo("Embeddings generated successfully!");

      void (await insertPinecone(emb1, 1));
      void (await insertPinecone(emb2, 2));
      await delay(500);
      const similarity = await searchPinecone();
      setAdditionalInfo(`Similarity ${similarity}`);
    } catch (error) {
      setAdditionalInfo(
        `Error generating embeddings: ${(error as Error).message}`,
      );
    }
  }, [inputs]);

  return (
    <div className="w-full space-y-8 p-4 pt-10 sm:p-10 sm:pt-32">
      <div className="flex flex-col space-y-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0">
        <InputField
          id="input1"
          label="Input 1"
          value={inputs.input1}
          onChange={handleInputChange}
        />
        <div className="space-y-2">
          <p className="font-bold">Additional Info</p>
          <div className="min-h-[40px] rounded border p-2">
            {additionalInfo}
          </div>
        </div>
        <InputField
          id="input2"
          label="Input 2"
          value={inputs.input2}
          onChange={handleInputChange}
        />
      </div>
      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
      <div className="flex flex-col space-y-8 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0">
        <HeatmapWrapper
          title="Heatmap for Input 1"
          embedding={embeddings.embedding1}
        />
        <HeatmapWrapper
          title="Heatmap for Input 2"
          embedding={embeddings.embedding2}
        />
      </div>
    </div>
  );
};

const InputField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = React.memo(({ id, label, value, onChange }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block">
      {label}
    </label>
    <input
      id={id}
      className="w-full rounded border p-2 text-black"
      value={value}
      onChange={onChange}
      placeholder={`Enter text for ${label}`}
    />
  </div>
));

InputField.displayName = "InputField";

const HeatmapWrapper: React.FC<{ title: string; embedding: number[] }> =
  React.memo(({ title, embedding }) => (
    <div className="flex flex-col items-center">
      <h3 className="mb-4 text-center text-lg font-bold">{title}</h3>
      {embedding.length > 0 && <HeatmapComponent embedding={embedding} />}
    </div>
  ));

HeatmapWrapper.displayName = "HeatmapWrapper";

export default EmbeddingVisualizer;
