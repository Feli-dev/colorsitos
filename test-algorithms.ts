// Test script to compare palette generation algorithms
import { generateColorPalette } from "./src/utils/palette-generator.js";

// Test colors
const testColors = [
  "#3182CE", // Original blue
  "#E53E3E", // Red
  "#38A169", // Green
  "#D69E2E", // Yellow
  "#805AD5", // Purple
  "#ED8936", // Orange
];

console.log("Comparison of palette generation algorithms\n");
console.log("=".repeat(60));

testColors.forEach((color) => {
  console.log(`\nBase color: ${color}`);
  console.log("-".repeat(40));

  try {
    const palette = generateColorPalette(color);
    console.log("Generated palette:");
    Object.entries(palette).forEach(([shade, hex]) => {
      console.log(`  ${shade}: ${hex}`);
    });
  } catch (error) {
    // Ensure error is handled safely if not an Error instance
    if (error instanceof Error) {
      console.error(`Error generating palette for ${color}:`, error.message);
    } else {
      console.error(`Error generating palette for ${color}:`, String(error));
    }
  }
});

console.log("\n" + "=".repeat(60));
console.log("Test completed");
