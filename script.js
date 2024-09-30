// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('drone-canvas').appendChild(renderer.domElement);

// Create star field
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

const starsVertices = [];
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// Create drone swarm
const droneGeometry = new THREE.ConeGeometry(0.5, 1, 4);
const droneMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const drones = [];

for (let i = 0; i < 100; i++) {
    const drone = new THREE.Mesh(droneGeometry, droneMaterial);
    drone.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    );
    drone.rotation.x = Math.PI / 2;
    scene.add(drone);
    drones.push(drone);
}

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

camera.position.z = 50;

// Drone movement patterns
const swarmCenter = new THREE.Vector3(0, 0, 0);
const swarmRadius = 30;
const swarmSpeed = 0.0001;

function updateDronePositions(time) {
    drones.forEach((drone, index) => {
        const angle = (index / drones.length) * Math.PI * 2 + time * swarmSpeed;
        const radius = swarmRadius + Math.sin(time * 0.001 + index) * 10;
        
        drone.position.x = Math.cos(angle) * radius;
        drone.position.y = Math.sin(angle) * radius;
        drone.position.z = Math.sin(time * 0.001 + index * 0.1) * 20;
        
        drone.lookAt(swarmCenter);
        drone.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    });
}

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);

    starField.rotation.y += 0.0001;
    updateDronePositions(time);

    renderer.render(scene, camera);
}

animate();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Responsive design
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// GSAP animations for enhanced interactivity
gsap.from('.logo', { duration: 1, y: -50, opacity: 0, ease: 'power3.out' });
gsap.from('nav ul li', { duration: 1, y: -50, opacity: 0, stagger: 0.2, ease: 'power3.out' });
gsap.from('#hero h1', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.5 });
gsap.from('#hero p', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.7 });
gsap.from('.cta-button', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.9 });

// Hover effect for feature items
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(item, { duration: 0.3, y: -5, boxShadow: '0 5px 15px rgba(0, 255, 0, 0.3)' });
    });
    item.addEventListener('mouseleave', () => {
        gsap.to(item, { duration: 0.3, y: 0, boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)' });
    });
});

// Parallax effect for background
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;
    
    gsap.to(scene.position, {
        duration: 1,
        x: mouseX * 10,
        y: -mouseY * 10,
        ease: 'power2.out'
    });
});

// Live simulation
const simulationContainer = document.getElementById('simulation-container');
const startSimulationBtn = document.getElementById('start-simulation');
const stopSimulationBtn = document.getElementById('stop-simulation');

let simulationRunning = false;
let simulationDrones = [];
const numOurDrones = 30;
const numOtherDrones = 20;
const containerWidth = simulationContainer.clientWidth;
const containerHeight = simulationContainer.clientHeight;

function createSimulationDrone(isOurDrone, index) {
    const drone = document.createElement('div');
    drone.className = 'simulation-drone';
    drone.style.backgroundColor = isOurDrone ? 'var(--primary-color)' : 'var(--accent-color)';
    simulationContainer.appendChild(drone);
    return {
        element: drone,
        isOurDrone: isOurDrone,
        index: index,
        x: isOurDrone ? Math.random() * (containerWidth / 2) : (containerWidth / 2) + Math.random() * (containerWidth / 2),
        y: Math.random() * containerHeight,
        vx: 0,
        vy: 0
    };
}

function updateSimulationDrone(drone, time) {
    if (drone.isOurDrone) {
        // Our drones move in a cohesive swarm pattern
        const centerX = containerWidth / 4;
        const centerY = containerHeight / 2;
        const angle = (drone.index / numOurDrones) * Math.PI * 2 + time * 0.001;
        const radius = Math.min(containerWidth / 4, containerHeight / 2) * 0.8;
        drone.x = centerX + Math.cos(angle) * radius;
        drone.y = centerY + Math.sin(angle) * radius;
    } else {
        // Other drones move randomly
        drone.vx += (Math.random() - 0.5) * 0.5;
        drone.vy += (Math.random() - 0.5) * 0.5;
        drone.vx *= 0.99;
        drone.vy *= 0.99;
        drone.x += drone.vx;
        drone.y += drone.vy;

        // Keep other drones on the right side
        if (drone.x < containerWidth / 2) drone.x = containerWidth / 2;
        if (drone.x > containerWidth) drone.x = containerWidth;
        if (drone.y < 0) drone.y = 0;
        if (drone.y > containerHeight) drone.y = containerHeight;
    }

    drone.element.style.left = `${drone.x}px`;
    drone.element.style.top = `${drone.y}px`;
}

function startSimulation() {
    if (!simulationRunning) {
        simulationRunning = true;
        simulationDrones = [];
        for (let i = 0; i < numOurDrones; i++) {
            simulationDrones.push(createSimulationDrone(true, i));
        }
        for (let i = 0; i < numOtherDrones; i++) {
            simulationDrones.push(createSimulationDrone(false, i));
        }
        animateSimulation();
    }
}

function stopSimulation() {
    simulationRunning = false;
    simulationDrones.forEach(drone => drone.element.remove());
    simulationDrones = [];
}

function animateSimulation(time) {
    if (simulationRunning) {
        simulationDrones.forEach(drone => updateSimulationDrone(drone, time));
        requestAnimationFrame(animateSimulation);
    }
}

startSimulationBtn.addEventListener('click', startSimulation);
stopSimulationBtn.addEventListener('click', stopSimulation);

// Loading screen
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
});