const fs = require("fs");

// Define the API endpoint and key
const API_URL = "https://api.api-ninjas.com/v1/planets";
const API_KEY = "+05oWxHqq1ZpEix8N7825Q==n4OtQZhKFyUPeTcN"; // Replace with your actual API key

// Define base planet data
const planetData = [
  {
    name: "MERCURY",
    size: 0.5,
    distance: 0.39,
    texture: "mercuryTexture",
    speed: 0.08264,
    rotationSpeed: 0.02,
    initialAngleDeg: 51.57,
  },
  {
    name: "VENUS",
    size: 0.7,
    distance: 0.72,
    texture: "venusTexture",
    speed: 0.03232,
    rotationSpeed: 0.01,
    initialAngleDeg: 142.2,
  },
  {
    name: "EARTH",
    size: 0.75,
    distance: 1,
    texture: "earthTexture",
    speed: 0.01992,
    rotationSpeed: 0.03,
    initialAngleDeg: 303.84,
  },
  {
    name: "MARS",
    size: 0.6,
    distance: 1.52,
    texture: "marsTexture",
    speed: 0.01059,
    rotationSpeed: 0.04,
    initialAngleDeg: 78.12,
  },
  {
    name: "JUPITER",
    size: 1.2,
    distance: 5.2,
    texture: "jupiterTexture",
    speed: 0.001673,
    rotationSpeed: 0.05,
    initialAngleDeg: 33.84,
  },
  {
    name: "SATURN",
    size: 1,
    distance: 9.54,
    texture: "saturnTexture",
    speed: 0.0009294,
    rotationSpeed: 0.03,
    initialAngleDeg: 303.73,
  },
  {
    name: "URANUS",
    size: 0.9,
    distance: 19.2,
    texture: "uranusTexture",
    speed: 0.000237,
    rotationSpeed: 0.02,
    initialAngleDeg: 106.45,
  },
  {
    name: "NEPTUNE",
    size: 0.85,
    distance: 30.06,
    texture: "neptuneTexture",
    speed: 0.0001208,
    rotationSpeed: 0.02,
    initialAngleDeg: 54.3,
  },
];

// Dynamic import of `node-fetch`
async function fetchPlanetInfo(planetName) {
  const { default: fetch } = await import("node-fetch");
  try {
    const response = await fetch(`${API_URL}?name=${planetName}`, {
      headers: { "X-Api-Key": API_KEY },
    });
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching data for ${planetName}:`, error);
    return null;
  }
}

// Function to generate the full dataset and save it as JSON
async function generatePlanetDataset() {
  const enrichedPlanetData = [];

  for (const planet of planetData) {
    const apiData = await fetchPlanetInfo(planet.name);

    if (apiData) {
      // Merge API data with existing planet data
      const fullPlanetData = {
        ...planet,
        temperature: apiData.temperature ? `${apiData.temperature}°C` : "N/A",
        mass: apiData.mass || "N/A",
        radius: apiData.radius || "N/A",
        period: apiData.period || "N/A",
        semiMajorAxis: apiData.semi_major_axis || "N/A",
      };

      enrichedPlanetData.push(fullPlanetData);
    } else {
      console.warn(
        `No API data found for ${planet.name}, using base data only.`
      );
      enrichedPlanetData.push(planet);
    }
  }

  // Write the enriched data to a JSON file
  fs.writeFileSync(
    "planetData.json",
    JSON.stringify(enrichedPlanetData, null, 2)
  );
  console.log("Planet data has been saved to planetData.json");
}

// Run the script
generatePlanetDataset();
