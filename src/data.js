// Import your 6 Saudi National Day cards
import rhc1 from "/cards/RHC.jpg";
import fhc1 from "/cards/FHC.jpg";
import green1 from "/cards/Green.jpg";
import process1 from "/cards/Process.jpg";
import safe1 from "/cards/Safe.jpg";
import verdifor1 from "/cards/Verdifor.jpg";

// All your Saudi National Day cards in one simple array
export const cards = [
  { src: rhc1, name: "RHC" },
  { src: fhc1, name: "FHC" },
  { src: green1, name: "Green" },
  { src: process1, name: "Process" },
  { src: safe1, name: "Safe" },
  { src: verdifor1, name: "Verdifor" },
];

// Simple function to get all cards
export const getAllCards = () => cards;
