// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Intro Scene
const introDiv = document.getElementById('intro');
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const neonLight = new THREE.PointLight(0xff00ff, 1, 100);
neonLight.position.set(0, 10, 10);
scene.add(neonLight);

// Car Model (Simple Cube for Now)
const carGeometry = new THREE.BoxGeometry(2, 1, 0.5);
const carMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
const car = new THREE.Mesh(carGeometry, carMaterial);
scene.add(car);
camera.position.set(0, 5, 10);
camera.lookAt(car.position);

// Background Plane (Cyberpunk City Feel)
const bgGeometry = new THREE.PlaneGeometry(100, 100);
const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
const bg = new THREE.Mesh(bgGeometry, bgMaterial);
bg.position.z = -50;
scene.add(bg);

// Intro Animation
function animateIntro() {
    requestAnimationFrame(animateIntro);
    car.rotation.y += 0.02;
    renderer.render(scene, camera);
}
animateIntro();

// Start Game on Tap
introDiv.addEventListener('click', () => {
    introDiv.style.display = 'none';
    startGame();
});

// Game Variables
let speed = 0, maxSpeed = 0.2, turnSpeed = 0.05;
let drifting = false, nitro = 100;
const joystick = { x: 0, y: 0, active: false };

// Game Scene Setup
function startGame() {
    scene.clear();
    scene.add(new THREE.AmbientLight(0x404040));
    const roadGeometry = new THREE.PlaneGeometry(10, 100);
    const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    scene.add(road);
    scene.add(car);
    camera.position.set(0, 5, 10);
    camera.lookAt(car.position);

    // HUD (Simple Text)
    const hud = document.createElement('div');
    hud.style.position = 'absolute';
    hud.style.color = '#00ffff';
    hud.style.top = '10px';
    hud.style.left = '10px';
    hud.innerHTML = 'Speed: 0 | Drift: 0 | Nitro: 100';
    document.body.appendChild(hud);

    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') car.rotation.y += turnSpeed;
        if (e.key === 'ArrowRight') car.rotation.y -= turnSpeed;
        if (e.key === 'ArrowUp') speed = Math.min(speed + 0.01, maxSpeed);
        if (e.key === 'ArrowDown') speed = Math.max(speed - 0.01, 0);
        if (e.key === ' ') drifting = true;
        if (e.key === 'Shift' && nitro > 0) { speed *= 2; nitro -= 1; }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === ' ') drifting = false;
    });

    // Joystick (Touch Controls)
    const joystickDiv = document.createElement('div');
    joystickDiv.style.position = 'absolute';
    joystickDiv.style.width = '100px';
    joystickDiv.style.height = '100px';
    joystickDiv.style.bottom = '20px';
    joystickDiv.style.left = '20px';
    joystickDiv.style.background = 'rgba(255, 0, 255, 0.2)';
    joystickDiv.style.borderRadius = '50%';
    document.body.appendChild(joystickDiv);

    joystickDiv.addEventListener('touchstart', (e) => {
        joystick.active = true;
        updateJoystick(e.touches[0]);
    });
    joystickDiv.addEventListener('touchmove', (e) => updateJoystick(e.touches[0]));
    joystickDiv.addEventListener('touchend', () => joystick.active = false);

    function updateJoystick(touch) {
        const rect = joystickDiv.getBoundingClientRect();
        joystick.x = (touch.clientX - rect.left - 50) / 50; // -1 to 1
        joystick.y = (touch.clientY - rect.top - 50) / 50; // -1 to 1
    }

    // Game Loop
    function animateGame() {
        requestAnimationFrame(animateGame);
        if (joystick.active) {
            car.rotation.y -= joystick.x * turnSpeed;
            speed = Math.min(-joystick.y * maxSpeed, maxSpeed);
        }
        car.position.z += speed * Math.cos(car.rotation.y);
        car.position.x += speed * Math.sin(car.rotation.y);
        camera.position.z = car.position.z + 10;
        camera.position.x = car.position.x;
        hud.innerHTML = `Speed: ${Math.round(speed * 100)} | Drift: ${drifting ? 'ON' : 'OFF'} | Nitro: ${Math.round(nitro)}`;
        renderer.render(scene, camera);
    }
    animateGame();
}
