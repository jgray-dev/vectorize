"use client";

import React, { useState, useCallback, useMemo } from "react";
import { getEmbedding } from "~/server/queries";
import { insertPinecone, searchPinecone } from "~/server/hidden";

interface HeatmapComponentProps {
  embedding: number[];
  minValue: number;
  maxValue: number;
  colorState: number;
}

interface HoveredValue {
  value: number;
  x: number;
  y: number;
}

const HeatmapComponent: React.FC<HeatmapComponentProps> = React.memo(
  ({ embedding, minValue, maxValue, colorState }) => {
    const [hoveredValue, setHoveredValue] = useState<HoveredValue | null>(null);

    const { cellSize, cols, rows } = useMemo(
      () => ({
        cellSize: 12,
        cols: 48,
        rows: 32,
      }),
      []
    );

    const getColor = useCallback((value: number) => {
      // Normalize the value to be between 0 and 1
      const normalizedValue = (value - minValue) / (maxValue - minValue);
      // Apply a gentler power function to stretch the middle range
      const adjustedValue = Math.pow(normalizedValue, 0.8);

      // Ensure extremes are black and white
      if (adjustedValue <= 0.01) return 'rgb(0, 0, 0)';  // Black for minimum
      if (adjustedValue >= 0.99) return 'rgb(255, 255, 255)';  // White for maximum

      // Determine the primary color based on colorState
      let primaryColor: string;
      switch (colorState) {
        case 0:
          primaryColor = 'red';
          break;
        case 1:
          primaryColor = 'green';
          break;
        case 2:
          primaryColor = 'blue';
          break;
        default:
          primaryColor = 'red';  // Default to red if state is unexpected
      }

      // Interpolate colors for non-extreme values
      if (adjustedValue <= 0.4) {
        // Near-black to dark primary color
        const colorValue = Math.round(160 * (adjustedValue - 0.01) / 0.39);
        return `rgb(${primaryColor === 'red' ? colorValue : 0}, ${primaryColor === 'green' ? colorValue : 0}, ${primaryColor === 'blue' ? colorValue : 0})`;
      } else if (adjustedValue <= 0.6) {
        // Dark primary color to medium primary color
        const colorValue = Math.round(160 + (200 - 160) * (adjustedValue - 0.4) / 0.2);
        return `rgb(${primaryColor === 'red' ? colorValue : 0}, ${primaryColor === 'green' ? colorValue : 0}, ${primaryColor === 'blue' ? colorValue : 0})`;
      } else {
        // Medium primary color to near-white
        const primaryColorValue = Math.round(200 + (250 - 200) * (adjustedValue - 0.6) / 0.39);
        const secondaryColorValue = Math.round(180 * Math.pow((adjustedValue - 0.6) / 0.39, 2));
        return `rgb(${primaryColor === 'red' ? primaryColorValue : secondaryColorValue}, ${primaryColor === 'green' ? primaryColorValue : secondaryColorValue}, ${primaryColor === 'blue' ? primaryColorValue : secondaryColorValue})`;
      }
    }, [minValue, maxValue, colorState]);

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
  }
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
  const [colorState, setColorState] = useState<number>(0);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setInputs((prev) => ({ ...prev, [id]: value }));
    },
    []
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
      await delay(100);
      const similarity = await searchPinecone();
      setAdditionalInfo(`Similarity ${similarity && similarity > 1 ? 1 : similarity}`);
    } catch (error) {
      setAdditionalInfo(
        `Error generating embeddings: ${(error as Error).message}`
      );
    }
  }, [inputs]);

  const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorState(Number(e.target.value));
  };

  const { minValue, maxValue } = useMemo(() => {
    const allValues = [...embeddings.embedding1, ...embeddings.embedding2];
    return {
      minValue: Math.min(...allValues),
      maxValue: Math.max(...allValues),
    };
  }, [embeddings]);

  return (
    <div className="w-full space-y-8 p-4 pt-24 sm:pt-20 sm:p-10">
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
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 mr-4"
        >
          Submit
        </button>
        <select
          value={colorState}
          onChange={handleColorChange}
          className="rounded border p-2 text-black"
        >
          <option value={0}>Red</option>
          <option value={1}>Green</option>
          <option value={2}>Blue</option>
        </select>
      </div>
      <div className="flex flex-col space-y-8 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0">
        <HeatmapWrapper
          title="Heatmap for Input 1"
          embedding={embeddings.embedding1}
          minValue={minValue}
          maxValue={maxValue}
          colorState={colorState}
        />
        <HeatmapWrapper
          title="Heatmap for Input 2"
          embedding={embeddings.embedding2}
          minValue={minValue}
          maxValue={maxValue}
          colorState={colorState}
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

const HeatmapWrapper: React.FC<{
  title: string;
  embedding: number[];
  minValue: number;
  maxValue: number;
  colorState: number;
}> = React.memo(({ title, embedding, minValue, maxValue, colorState }) => (
  <div className="flex flex-col items-center">
    <h3 className="mb-4 text-center text-lg font-bold">{title}</h3>
    {embedding.length > 0 && (
      <HeatmapComponent
        embedding={embedding}
        minValue={minValue}
        maxValue={maxValue}
        colorState={colorState}
      />
    )}
  </div>
));

HeatmapWrapper.displayName = "HeatmapWrapper";

export default EmbeddingVisualizer;