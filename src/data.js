// Import your 6 Ramadan greeting cards
import rhc1 from "/cards/RHC.jpg";
import fhc1 from "/cards/FHC.jpg";
import green1 from "/cards/Green.jpg";
import process1 from "/cards/Process.jpg";
import safe1 from "/cards/Safe.jpg";
import verdifor1 from "/cards/Verdifor.jpg";

// Import Founding Day greeting cards
import fdRhc from "/founding-day-cards/RHC.jpg";
import fdFhc from "/founding-day-cards/FHC.jpg";
import fdGreen from "/founding-day-cards/Green.jpg";
import fdProcess from "/founding-day-cards/Process.jpg";
import fdSafe from "/founding-day-cards/Safe.jpg";
import fdVerdifor from "/founding-day-cards/Verdifor.jpg";

// All your Ramadan greeting cards in one simple array
export const ramadanCards = [
  { src: rhc1, name: "RHC" },
  { src: fhc1, name: "FHC" },
  { src: green1, name: "Green" },
  { src: process1, name: "Process" },
  { src: safe1, name: "Safe" },
  { src: verdifor1, name: "Verdifor" },
];

// All Founding Day greeting cards
export const foundingDayCards = [
  { src: fdRhc, name: "RHC" },
  { src: fdFhc, name: "FHC" },
  { src: fdGreen, name: "Green" },
  { src: fdProcess, name: "Process" },
  { src: fdSafe, name: "Safe" },
  { src: fdVerdifor, name: "Verdifor" },
];

// Legacy export for backwards compatibility
export const cards = ramadanCards;

// Function to get cards by occasion
export const getCardsByOccasion = (occasion) => {
  switch (occasion) {
    case "founding-day":
      return foundingDayCards;
    case "ramadan":
    default:
      return ramadanCards;
  }
};

// Simple function to get all Ramadan cards (legacy)
export const getAllCards = () => ramadanCards;
