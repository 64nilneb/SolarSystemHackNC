import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('button').addEventListener('click', () => {
        document.getElementById('button').style.display = 'none';
        document.getElementById('speedModifier').style.display = 'flex';
        document.getElementById('introScreen').style.display = 'none';
        document.getElementById('toggleOrbits').style.display = 'block';
        initializeSolarSystem();
    });
});

// Constant
let speedMultiplier = 0.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000011);
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.y = 2;

// Create renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

// Create stars in the background
function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starCount = 10000;
    const starVertices = [];

    for (let i = 0; i < starCount; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

addStars(); // Call the function to add stars
renderer.render(scene, camera);

// Load textures for the planets
const sunTexture = textureLoader.load('textures/sun.jpg');
const mercuryTexture = textureLoader.load('textures/mercury.jpg');
const venusTexture = textureLoader.load('textures/venus.jpg');
const earthTexture = textureLoader.load('textures/earth.jpg');
const marsTexture = textureLoader.load('textures/mars.jpg');
const jupiterTexture = textureLoader.load('textures/jupiter.jpg');
const saturnTexture = textureLoader.load('textures/saturn.jpg');
const uranusTexture = textureLoader.load('textures/uranus.jpg');
const neptuneTexture = textureLoader.load('textures/neptune.jpg');
const asteroidTexture = textureLoader.load('textures/asteroid.jpg');

const sizeMultiplier = 0.1;
// Create a big ball for the sun
const sunGeometry = new THREE.SphereGeometry(1.5 * sizeMultiplier, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data (size, distance from sun, speed of orbit)
const planetData = [
    { name: 'MERCURY', size: 0.5, distance: 0.39, texture: mercuryTexture, speed: 0.08264, rotationSpeed: 0.02, initialAngleDeg: 51.57 },
    { name: 'VENUS', size: 0.7, distance: 0.72, texture: venusTexture, speed: 0.03232, rotationSpeed: 0.01, initialAngleDeg: 142.2 },
    { name: 'EARTH', size: 0.75, distance: 1, texture: earthTexture, speed: 0.01992, rotationSpeed: 0.03, initialAngleDeg: 303.84 },
    { name: 'MARS', size: 0.6, distance: 1.52, texture: marsTexture, speed: 0.01059, rotationSpeed: 0.04, initialAngleDeg: 78.12 },
    { name: 'JUPITER', size: 1.2, distance: 5.2, texture: jupiterTexture, speed: 0.001673, rotationSpeed: 0.05, initialAngleDeg: 33.84 },
    { name: 'SATURN', size: 1, distance: 9.54, texture: saturnTexture, speed: 0.0009294, rotationSpeed: 0.03, initialAngleDeg: 303.73 },
    { name: 'URANUS', size: 0.9, distance: 19.2, texture: uranusTexture, speed: 0.0002370, rotationSpeed: 0.02, initialAngleDeg: 106.45 },
    { name: 'NEPTUNE', size: 0.85, distance: 30.06, texture: neptuneTexture, speed: 0.0001208, rotationSpeed: 0.02, initialAngleDeg: 54.3 },
];

// Arrays to hold planet meshes and orbits
const planets = [];
const orbits = [];
const labels = []; // Array to hold label elements

// Create planets and labels
planetData.forEach(data => {
    // Create planet mesh
    const geometry = new THREE.SphereGeometry(data.size * sizeMultiplier, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ map: data.texture });
    const planet = new THREE.Mesh(geometry, planetMaterial);
    planet.position.set(data.distance, 0, 0);
    scene.add(planet);
    
    // Compute initial angle in radians
    const initialAngleRad = (data.initialAngleDeg * Math.PI) / 180;

    planets.push({ planet, distance: data.distance, speed: data.speed, angle: initialAngleRad, rotationSpeed: data.rotationSpeed });

    // Create the label as an HTML div
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = data.name;
    labelDiv.style.color = 'lightblue';
    labelDiv.style.position = 'absolute';
    labelDiv.style.pointerEvents = 'none';
    labelDiv.style.whiteSpace = 'nowrap';
    document.body.appendChild(labelDiv);

    labels.push({ planet: planet, labelDiv: labelDiv });

    // Create the orbit ring
    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.02 * sizeMultiplier, data.distance + 0.02 * sizeMultiplier, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x6faeff, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    orbits.push(orbit);
});

// Create the asteroid belt
const asteroidBelt = new THREE.Group();
scene.add(asteroidBelt);

function createAsteroidBelt() {
    const asteroidCount = 1500; // Number of asteroids
    const beltInnerRadius = 2.0; // Just beyond Mars' orbit
    const beltOuterRadius = 3.2; // Just before Jupiter's orbit
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTexture, color: 0x656565 });

    for (let i = 0; i < asteroidCount; i++) {
        const asteroidGeometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0, 0.3) * sizeMultiplier, 8, 8); // Small spheres
        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

        // Random distance within the belt
        const distance = THREE.MathUtils.randFloat(beltInnerRadius, beltOuterRadius);

        // Random angle around the sun
        const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);

        // Random height to give thickness to the belt
        const height = THREE.MathUtils.randFloatSpread(0.1); // Slight vertical spread

        asteroid.position.set(
            Math.cos(angle) * distance,
            height,
            Math.sin(angle) * distance
        );

        // Random speed for asteroid orbit
        const speed = THREE.MathUtils.randFloat(0.0005, 0.001);

        asteroid.userData = { distance, angle, speed };

        asteroidBelt.add(asteroid);
    }
}

createAsteroidBelt(); // Generate the asteroid belt

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enableRotate = true;
controls.enablePan = false;

function animate() {
    requestAnimationFrame(animate);

    // Rotate planets
    planets.forEach(p => {
        p.angle += p.speed * speedMultiplier;
        p.planet.position.set(
            Math.cos(p.angle) * p.distance,
            0,
            Math.sin(p.angle) * p.distance
        );
        p.planet.rotation.y += p.rotationSpeed * speedMultiplier;
    });

    // Update asteroid belt
    asteroidBelt.children.forEach(asteroid => {
        asteroid.userData.angle += asteroid.userData.speed * speedMultiplier;
        asteroid.position.set(
            Math.cos(asteroid.userData.angle) * asteroid.userData.distance,
            asteroid.position.y, // Keep the original height
            Math.sin(asteroid.userData.angle) * asteroid.userData.distance
        );
    });

    // Update labels' positions
    labels.forEach(l => {
        const vector = new THREE.Vector3();
        l.planet.getWorldPosition(vector);

        // Project the position to normalized device coordinates (NDC)
        vector.project(camera);

        // Convert the NDC to screen coordinates
        const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
        const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight;

        // Adjust the label's position in screen space
        const labelWidth = l.labelDiv.clientWidth;
        const labelHeight = l.labelDiv.clientHeight;
        l.labelDiv.style.left = `${x - labelWidth / 2}px`; // Center the label horizontally
        l.labelDiv.style.top = `${y - labelHeight - 10}px`; // Position above the planet
    });

    // Rotate the sun
    sun.rotation.y += 0.002 * speedMultiplier;

    controls.update();

    renderer.render(scene, camera);
}

// Event listener to toggle orbit visibility
document.getElementById('toggleOrbits').addEventListener('click', () => {
    orbits.forEach(orbit => {
        orbit.visible = !orbit.visible;
    });
});

// Get references to the slider and the speed display
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
speedSlider.addEventListener('input', () => {
    speedMultiplier = parseFloat(speedSlider.value);
    speedValue.textContent = speedMultiplier.toFixed(1) + 'x';
});

// Adjust camera and renderer on window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update label positions on resize
    labels.forEach(l => {
        l.labelDiv.style.left = '';
        l.labelDiv.style.top = '';
    });
});

// Create and style the date label
const dateDiv = document.createElement('div');
dateDiv.className = 'date-label';
dateDiv.textContent = 'November 2, 2024';

// Style the date label
dateDiv.style.position = 'absolute';
dateDiv.style.top = '10px';
dateDiv.style.width = '100%';
dateDiv.style.textAlign = 'center';
dateDiv.style.fontWeight = 'bold';
dateDiv.style.fontSize = '20px';
dateDiv.style.color = 'white';
dateDiv.style.pointerEvents = 'none';

document.body.appendChild(dateDiv);

document.getElementById('super-prev').addEventListener('click', () => {speedMultiplier = -5});
document.getElementById('prev').addEventListener('click', () => {speedMultiplier = -2});
document.getElementById('pause-play').addEventListener('click', () => {
    if (speedMultiplier == 0) {
        speedMultiplier = 0.1;
    }
    else {
        speedMultiplier = 0;
    }
});
document.getElementById('fast-forward').addEventListener('click', () => {speedMultiplier = 2});
document.getElementById('super-fast').addEventListener('click', () => {speedMultiplier = 5});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function zoomAnimate() {
    for (let i = 500; i >= 2; i-= 7) {
        camera.position.set(i, i, i);
        await sleep(3);
        if (i < 10) {
            i += 6.9;
        }
        else if (i < 60) {
            i += 6.75;
        }
        else if (i < 80) {
            i += 6.4
        }
        else if (i < 100) {
            i += 6;
        }
        else if (i < 200) {
            i += 5;
        }
        else if (i < 300) {
            i += 4;
        }
        else if (i < 400) {
            i += 3;
        }
    }
}

function initializeSolarSystem() {
    zoomAnimate();
    animate();
}