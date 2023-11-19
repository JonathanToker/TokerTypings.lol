"use client";
import React from "react";
import { LineChart } from "@/Components";
import { useState, useEffect } from "react";
import { getDifficultyTest } from "@/utils";

type resultsArrType = {
  wpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  level: string;
};
type ChartData = {
  labels: number[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
  }[];
};
const Page = () => {
  const options = {};
  const [resultsArr, setResultsArr] = useState<resultsArrType[]>([]);

  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [{ label: "words per minute", data: [] }],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedArr: resultsArrType[] = JSON.parse(
        localStorage.getItem("resultsArr") || "[]"
      );
      setResultsArr(storedArr);

      setChartData({
        labels: storedArr.map((_, index) => index + 1),
        datasets: [
          {
            label: "words per minute",
            data: storedArr.map((data: resultsArrType) => data.wpm),
            borderColor: "blue",
            backgroundColor: "blue",
            tension: 0.2,
          },
        ],
      });
    }
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="text-3xl">Your overall statistics</h1>
      {resultsArr && (
        <div className="w-2/3 p-10">
          <LineChart chartData={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default Page;
