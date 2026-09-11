const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const state = {
  running: false,
  gameOver: false,
  score: 0,
  best: Number(localStorage.getItem("neonArcadeBest") || 0),
  elapsed: 0,
  lastTime: 0,
  spawnTimer: 0,
  meteors: [],
  particles: [],
  keys: new Set(),
  pointerX: null,
  dpr: 1,
  width: 0,
  height: 0,
  raf: 0
};

const ship = { x: 0, y: 0, width: 28, height: 36, speed: 390 };

const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#bestScore");
const overlay = document.querySelector("#gameOverlay");
const startButton = document.querySelector("#startButton");

bestEl.textContent = state.best;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = rect.width;
  state.height = rect.height;
  canvas.width = Math.floor(rect.width * state.dpr);
  canvas.height = Math.floor(rect.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  ship.y = state.height - 58;
  if (!state.running) ship.x = state.width / 2;
}

function resetGame() {
  state.running = true;
  state.gameOver = false;
  state.score = 0;
  state.elapsed = 0;
  state.spawnTimer = 0;
  state.meteors.length = 0;
  state.particles.length = 0;
  ship.x = state.width / 2;
  scoreEl.textContent = "0";
  overlay.classList.add("hidden");
  cancelAnimationFrame(state.raf);
  state.lastTime = performance.now();
  state.raf = requestAnimationFrame(loop);
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  state.best = Math.max(state.best, state.score);
  localStorage.setItem("neonArcadeBest", String(state.best));
  bestEl.textContent = state.best;
  saveScore(state.score);
  overlay.querySelector(".overlay-icon").textContent = "☄";
  overlay.querySelector(".eyebrow").textContent = "GAME OVER";
  overlay.querySelector("h3").textContent = `Score: ${state.score}`;
  overlay.querySelector("p:not(.eyebrow)").textContent = "Ready for another run? Dodge longer and beat your best.";
  startButton.textContent = "Play again";
  overlay.classList.remove("hidden");
}

function spawnMeteor() {
  const size = 12 + Math.random() * 17;
  state.meteors.push({
    x: size + Math.random() * (state.width - size * 2),
    y: -size - 10,
    r: size,
    speed: 130 + Math.random() * 100 + state.elapsed * 3,
    drift: (Math.random() - 0.5) * 35,
    rotation: Math.random() * Math.PI
  });
}

function createParticles(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - .5) * 80,
      vy: (Math.random() - .5) * 80,
      life: .4 + Math.random() * .4
    });
  }
}

function drawBackground() {
  ctx.fillStyle = "#050711";
  ctx.fillRect(0, 0, state.width, state.height);

  const gradient = ctx.createRadialGradient(
    state.width * .5, state.height * .75, 10,
    state.width * .5, state.height * .75, state.height
  );
  gradient.addColorStop(0, "rgba(130,70,210,.20)");
  gradient.addColorStop(1, "rgba(5,7,17,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.strokeStyle = "rgba(255,255,255,.035)";
  ctx.lineWidth = 1;
  const gap = 34;
  for (let x = 0; x < state.width; x += gap) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke();
  }
  for (let y = 0; y < state.height; y += gap) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke();
  }

  for (let i = 0; i < 32; i++) {
    const x = (i * 97 + state.elapsed * (8 + i % 4)) % state.width;
    const y = (i * 53) % state.height;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.fillRect(x, y, 1.2, 1.2);
  }
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#39e6ff";
  ctx.fillStyle = "#39e6ff";
  ctx.beginPath();
  ctx.moveTo(0, -ship.height / 2);
  ctx.lineTo(ship.width / 2, ship.height / 2);
  ctx.lineTo(0, ship.height / 3);
  ctx.lineTo(-ship.width / 2, ship.height / 2);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#f7f8ff";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,92,207,.75)";
  ctx.beginPath();
  ctx.moveTo(-5, ship.height / 2);
  ctx.lineTo(0, ship.height / 2 + 13 + Math.random() * 8);
  ctx.lineTo(5, ship.height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMeteor(m) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rotation);
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#ff725c";
  ctx.fillStyle = "#ff725c";
  ctx.beginPath();
  const points = 8;
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const radius = m.r * (.78 + Math.sin(i * 3.2) * .12);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function collides(m) {
  const dx = m.x - ship.x;
  const dy = m.y - ship.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < m.r + 15;
}

function update(dt) {
  state.elapsed += dt;
  state.score = Math.floor(state.elapsed);
  scoreEl.textContent = state.score;

  let direction = 0;
  if (state.keys.has("ArrowLeft") || state.keys.has("a")) direction -= 1;
  if (state.keys.has("ArrowRight") || state.keys.has("d")) direction += 1;

  if (state.pointerX !== null) {
    ship.x += (state.pointerX - ship.x) * Math.min(1, dt * 9);
  } else {
    ship.x += direction * ship.speed * dt;
  }
  ship.x = Math.max(22, Math.min(state.width - 22, ship.x));

  state.spawnTimer += dt;
  const spawnEvery = Math.max(.28, .82 - state.elapsed * .012);
  if (state.spawnTimer >= spawnEvery) {
    state.spawnTimer = 0;
    spawnMeteor();
  }

  for (let i = state.meteors.length - 1; i >= 0; i--) {
    const m = state.meteors[i];
    m.y += m.speed * dt;
    m.x += m.drift * dt;
    m.rotation += dt;
    if (collides(m)) {
      createParticles(ship.x, ship.y, 18);
      endGame();
      return;
    }
    if (m.y - m.r > state.height) state.meteors.splice(i, 1);
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

function draw() {
  drawBackground();
  state.meteors.forEach(drawMeteor);
  drawShip();
  state.particles.forEach(p => {
    ctx.fillStyle = `rgba(57,230,255,${Math.max(0,p.life)})`;
    ctx.fillRect(p.x, p.y, 2, 2);
  });
}

function loop(time) {
  if (!state.running) {
    draw();
    return;
  }
  const dt = Math.min((time - state.lastTime) / 1000, .033);
  state.lastTime = time;
  update(dt);
  draw();
  state.raf = requestAnimationFrame(loop);
}

function setPointer(clientX) {
  const rect = canvas.getBoundingClientRect();
  state.pointerX = Math.max(20, Math.min(state.width - 20, clientX - rect.left));
}

function saveScore(score) {
  if (score <= 0) return;
  const scores = JSON.parse(localStorage.getItem("neonArcadeScores") || "[]");
  scores.push(score);
  scores.sort((a, b) => b - a);
  localStorage.setItem("neonArcadeScores", JSON.stringify(scores.slice(0, 5)));
  renderLeaderboard();
}

function renderLeaderboard() {
  const list = document.querySelector("#leaderboard");
  const scores = JSON.parse(localStorage.getItem("neonArcadeScores") || "[]");
  list.innerHTML = "";
  const display = scores.length ? scores : [0, 0, 0];
  display.slice(0, 5).forEach(score => {
    const li = document.createElement("li");
    li.innerHTML = `<span>PLAYER</span><strong>${score}</strong>`;
    list.appendChild(li);
  });
}

startButton.addEventListener("click", resetGame);
window.addEventListener("resize", resizeCanvas);

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
    event.preventDefault();
    state.keys.add(event.key);
  }
  if (event.key === " " && !state.running) resetGame();
});
window.addEventListener("keyup", (event) => state.keys.delete(event.key));

canvas.addEventListener("pointerdown", (event) => {
  if (!state.running) return;
  canvas.setPointerCapture?.(event.pointerId);
  setPointer(event.clientX);
});
canvas.addEventListener("pointermove", (event) => {
  if (event.buttons || event.pointerType === "touch") setPointer(event.clientX);
});
canvas.addEventListener("pointerup", () => { state.pointerX = null; });

document.addEventListener("visibilitychange", () => {
  if (document.hidden) state.lastTime = performance.now();
});

window.addEventListener("beforeunload", () => cancelAnimationFrame(state.raf));

resizeCanvas();
renderLeaderboard();
draw();
