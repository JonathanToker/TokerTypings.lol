"use client";
import React from "react";
import Image from "next/image";
import { randomWordsList, punctuationRandomWordsList } from "@/utils";
import { useRef, useEffect, useState } from "react";
type typingAreaProps = {
  wordsAmount: number;
  path: string;
};
type TestResult = {
  wpm: number;
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  level: string;
};
type PunctuationType = "without" | "with" | null;
const TypingArea: React.FC<typingAreaProps> = ({ wordsAmount, path }) => {
  //everything related to input field and wpm, accuracy, correct & wrong words:
  const [typedWord, setTypedWord] = useState("");
  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [wrongWordsCount, setWrongWordsCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordsTypedSoFar, setWordsTypedSoFar] = useState(0);

  const [showResults, setShowResults] = useState(true);

  const [clearInput, setClearInput] = useState(false);

  const [wordsArr, setWordsArr] = useState(randomWordsList(path, wordsAmount));

  const [resultsArr, setResultsArr] = useState<TestResult[]>([]);
  const separateWordFromPunctuation = (word: string) => {
    const match = word.match(/^(\w+)(\W)?$/);
    if (match) {
      return { baseWord: match[1], punctuation: match[2] };
    }
    return { baseWord: word, punctuation: null };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (wordsTypedSoFar >= wordsAmount) {
      if (value.endsWith(" ") || value.endsWith("\n")) {
        setTypedWord("");
      } else {
        setTypedWord(value);
      }
      return;
    }
    if (value.trim() === "" && value.endsWith(" ")) {
      return;
    }
    if (!startTime) setStartTime(Date.now());

    // Referring to the current word element using the wordRefs array
    let currentWordEl = wordRefs.current[wordsTypedSoFar];
    const correctWord = wordsArr[wordsTypedSoFar] || "";

    let incrementedCorrectWords = correctWordsCount;
    let incrementedWrongWords = wrongWordsCount;

    // Real-time feedback: Check if the typed value so far matches the start of the correct word
    if (correctWord.startsWith(value) || correctWord === value) {
      inputRef?.current?.classList.remove("bg-red");
    } else {
      inputRef?.current?.classList.add("bg-red");
    }
    const { baseWord, punctuation } = separateWordFromPunctuation(correctWord);
    if (
      value.endsWith(" ") ||
      value.endsWith("\n") ||
      (wordsTypedSoFar === wordsAmount - 1 && value === correctWord)
    ) {
      const currentTypedWord = value.trim();

      const { baseWord, punctuation } =
        separateWordFromPunctuation(correctWord);

      if (
        currentTypedWord === correctWord ||
        (currentTypedWord === baseWord && !punctuation)
      ) {
        incrementedCorrectWords += 1;
        setCorrectWordsCount(incrementedCorrectWords);
        currentWordEl?.classList.remove("wrong-word", "current-word");
        currentWordEl?.classList.add("correct-word");
      } else {
        incrementedWrongWords += 1;
        setWrongWordsCount(incrementedWrongWords);
        currentWordEl?.classList.remove("current-word");
        currentWordEl?.classList.add("wrong-word");
      }

      const nextWordRef = wordRefs.current[wordsTypedSoFar + 1];
      if (nextWordRef) {
        nextWordRef.classList.add("current-word");
      }

      const newWordsTypedSoFar = wordsTypedSoFar + 1;
      setWordsTypedSoFar(newWordsTypedSoFar);

      if (newWordsTypedSoFar === wordsAmount) {
        // Test ends
        const endTime = Date.now();
        let wpm = 0;
        if (startTime) {
          wpm = calculateWPM(endTime, startTime);
        }

        const totalWords = incrementedCorrectWords + incrementedWrongWords;
        const accuracy = Math.round(
          (incrementedCorrectWords / totalWords) * 100
        );

        const newResult: TestResult = {
          wpm,
          accuracy,
          correctWords: incrementedCorrectWords,
          wrongWords: incrementedWrongWords,
          level: path,
        };

        setResultsArr((prevResults) => {
          setShowResults(true); // ensure results are shown for the new test
          setShowSaveFeedback(false); // ensures that saved turn into save
          return [...prevResults, newResult];
        });
      }
      inputRef?.current?.classList.remove("bg-red");
      setTypedWord("");
    } else {
      setTypedWord(value);
    }
  };

  const handleRefresh = () => {
    setTypedWord("");
    setCorrectWordsCount(0);
    setWrongWordsCount(0);
    setStartTime(null);
    setWordsTypedSoFar(0);
    setClearInput(false);
    if (punctuation === "with") {
      setWordsArr(
        punctuationRandomWordsList(randomWordsList(path, wordsAmount))
      );
    } else {
      setWordsArr(randomWordsList(path, wordsAmount));
    }
    inputRef?.current?.classList.remove("bg-red");
    // Reset classes for each word
    wordRefs.current.forEach((wordEl) => {
      if (wordEl) {
        wordEl.classList.remove("correct-word", "wrong-word", "current-word");
      }
    });

    // Re-highlight the first word
    if (wordRefs.current[0]) {
      wordRefs.current[0].classList.add("current-word");
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }; //place this function in the button and maybe when useEffect with a dependency of just [] but maybe it'll do something else and not just initialize the value of the states with the default value and clear the classes, the other option is to maybe just pass this function to the Navbar and as within each time you press it, the function will be invoke

  useEffect(() => {
    // Highlight the first word on the initial render
    if (wordRefs.current[0]) {
      wordRefs.current[0].classList.add("current-word");
    }
  }, []);

  const calculateWPM = (endTime: number, startTime: number) => {
    const timeDifference = endTime - startTime;
    const minutes = timeDifference / 60000;
    return Math.round(correctWordsCount / minutes);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setWordsArr(randomWordsList(path, wordsAmount));
  }, [wordsAmount, path]);
  // the highlighting classes logic:
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const renderWords = () => {
    return wordsArr.map((word, index) => {
      // attach ref to each span
      if (!wordRefs.current[index]) {
        wordRefs.current[index] = null; // initialize the ref
      }
      return (
        <span
          key={index}
          className="words__spans"
          ref={(el) => (wordRefs.current[index] = el)}
        >
          {word}
        </span>
      );
    });
  };
  let currentWordEl = wordRefs.current[wordsTypedSoFar];
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Esc") {
        if (wordsAmount) {
          handleRefresh();
        }
      } else if (
        e.key === "Enter" &&
        resultsArr.length > 0 &&
        showResults &&
        !showSaveFeedback
      ) {
        handleSave();
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown);
    // Cleanup: remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [wordsAmount, handleRefresh]); // Add dependencies to the effect
  useEffect(() => {
    handleRefresh();
  }, [wordsAmount, path]); // Only run this effect when wordsAmount changes
  const handleClose = () => {
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  const getPunctuation = (): PunctuationType => {
    const storedPunc = localStorage.getItem("punctuation");
    const validPunc: PunctuationType[] = ["without", "with"];
    if (validPunc.includes(storedPunc as PunctuationType)) {
      return storedPunc as PunctuationType;
    }
    return "without";
  };
  const [punctuation, setPunctuation] = useState<PunctuationType>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const punc = getPunctuation();
      setPunctuation(punc);
      if (punc === "with") {
        setWordsArr(
          punctuationRandomWordsList(randomWordsList(path, wordsAmount))
        );
      } else {
        setWordsArr(randomWordsList(path, wordsAmount));
      }
    }
  }, []);
  const playerPercentile = (mode: string) => {
    const currentWPM = resultsArr[resultsArr.length - 1].wpm;
    let adjustedWPM;

    switch (mode) {
      case "Easy":
        adjustedWPM = currentWPM;
        break;
      case "Normal":
        adjustedWPM = currentWPM * 1.15; // increase by 15%
        break;
      case "Hard":
        adjustedWPM = currentWPM * 1.7; // increase by 70%
        break;
      default:
        adjustedWPM = currentWPM;
        break;
    }
    switch (true) {
      case adjustedWPM >= 140:
        return 1;
      case adjustedWPM >= 135:
        return 2;
      case adjustedWPM >= 130:
        return 3;
      case adjustedWPM >= 125:
        return 4;
      case adjustedWPM >= 120:
        return 5;
      case adjustedWPM >= 115:
        return 6;
      case adjustedWPM >= 110:
        return 7;
      case adjustedWPM >= 105:
        return 8;
      case adjustedWPM >= 100:
        return 9;
      case adjustedWPM >= 95:
        return 10;
      case adjustedWPM >= 90:
        return 15;
      case adjustedWPM >= 80:
        return 20;
      case adjustedWPM >= 75:
        return 30;
      case adjustedWPM >= 70:
        return 40;
      case adjustedWPM >= 65:
        return 50;
      case adjustedWPM >= 60:
        return 60;
      case adjustedWPM >= 55:
        return 75;
      case adjustedWPM >= 50:
        return 80;
      case adjustedWPM >= 45:
        return 85;
      case adjustedWPM >= 40:
        return 90;
      default:
        return 95;
    }
  };
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const handleSave = () => {
    if (typeof window !== "undefined") {
      const latestResult = resultsArr[resultsArr.length - 1];

      // Fetch previous results from localStorage or default to an empty array
      const storedResults: TestResult[] = JSON.parse(
        localStorage.getItem("resultsArr") || "[]"
      );

      // Append the latest result and save back to localStorage
      storedResults.push(latestResult);
      localStorage.setItem("resultsArr", JSON.stringify(storedResults));

      // Give feedback to the user
      setShowSaveFeedback(true);
    }
  };

  return (
    <>
      {wordsAmount && <div className="words-area">{renderWords()}</div>}
      <div className="bar">
        <input
          ref={inputRef}
          type="text"
          id="input-field"
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          value={typedWord}
          onChange={handleInputChange}
        />

        <button
          className="reset-button hover-scale"
          title="or press esc"
          onClick={handleRefresh}
        >
          <Image
            className="reset-img"
            src="/white-circular-arrows.png"
            alt="circular arrows"
            width={30}
            height={30}
          />
        </button>
      </div>
      {resultsArr.length > 0 && showResults && (
        <div className="display-results">
          <div className="top-percentile">
            Top {playerPercentile(resultsArr[resultsArr.length - 1].level)}%
          </div>
          <div className="close hover-scale" onClick={handleClose}>
            x
          </div>
          <h1 className="display-results__recent">{`Recent taken test (${
            resultsArr[resultsArr.length - 1].level
          }):`}</h1>
          <div className="wrapper">
            <div className="display-results__containers">
              {`WPM: ${resultsArr[resultsArr.length - 1].wpm}`}
            </div>
            <div className="display-results__containers">
              {`Accuracy: ${resultsArr[resultsArr.length - 1].accuracy}%`}
            </div>
            <div className="display-results__containers">
              {`Correct Words: ${
                resultsArr[resultsArr.length - 1].correctWords
              }`}
            </div>
            <div className="display-results__containers">
              {`Wrong Words: ${resultsArr[resultsArr.length - 1].wrongWords}`}
            </div>
          </div>
          <button
            className={`save-button hover-scale ${
              showSaveFeedback ? "disabled" : ""
            }`}
            title="or press enter"
            onClick={handleSave}
            disabled={showSaveFeedback}
          >
            {showSaveFeedback ? "Saved!" : "Save"}
          </button>
        </div>
      )}
    </>
  );
};

export default TypingArea;
