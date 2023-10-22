"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="px-4 pt-4 relative pb-9">
      <h1 className="text-4xl text-center tracking-wider">
        Welcome to TokerTypings.lol
      </h1>
      <h2 className="text-2xl text-center my-4">
        Be ready to play typing tests with your set of preferences and track
        your progress!
      </h2>
      <div className="preferences">
        <div className="preferences__title">
          <h1>Choose your preferences</h1>
        </div>
        <div className="preference-container">
          <div className="preference__item">
            <h1 className="text-2xl underline">Theme:</h1>
            <button className="preferences__buttons underline">Light</button>
            <button className="preferences__buttons">Dark</button>
          </div>
          <div className="preference__item">
            <h1 className="text-2xl underline">Font Family:</h1>
            <button className="preferences__buttons underline">
              sans-serif
            </button>
            <button className="preferences__buttons">monospace</button>
            <button className="preferences__buttons">cursive</button>
          </div>
          <div className="preference__item">
            <h1 className="text-2xl underline">Punctuation:</h1>
            <button className="preferences__buttons underline">without</button>
            <button className="preferences__buttons">with</button>
          </div>
        </div>
      </div>
      <p className="absolute bottom-1 left-1">@ Made by Yonatan Toker</p>
    </div>
  );
}
