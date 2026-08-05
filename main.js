const numObjects = 30;
const numInds = 2000;
let allInds = [];
let allObjects = [];

const k = 4;

let showPopulation = document.getElementById("showPopulation").checked;
let stepCounter = 0;

const world = document.getElementById("world");
const ctx = world.getContext("2d");
world.width = 450;
world.height = 450;

let mouseActive = false;
let lastMouseX = 0;
let lastMouseY = 0;

let dragTarget = null;

world.addEventListener("mousedown", (e) => {
  const rect = world.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let minDist = Infinity;

  for (let obj of allObjects) {
    const dx = mouseX - obj.x;
    const dy = mouseY - obj.y;
    let distSq = dx * dx + dy * dy;
    if (distSq < minDist && distSq < 15 ** 2) {
      dragTarget = obj;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      minDist = distSq;
    }
  }
});

world.addEventListener("mouseup", () => {
  dragTarget = null;
});

world.addEventListener("mousemove", (e) => {
  if (!dragTarget) return;

  const rect = world.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const dx = mouseX - lastMouseX;
  const dy = mouseY - lastMouseY;

  dragTarget.x += dx;
  dragTarget.y += dy;

  lastMouseX = mouseX;
  lastMouseY = mouseY;
});

function step() {
  for (let ind of allInds) {
    let f = 0;

    for (let i = 0; i < ind.path.length - 1; i++) {
      let x1 = allObjects[ind.path[i]].x;
      let y1 = allObjects[ind.path[i]].y;
      let x2 = allObjects[ind.path[i + 1]].x;
      let y2 = allObjects[ind.path[i + 1]].y;

      let dx = x2 - x1;
      let dy = y2 - y1;
      let dist = Math.sqrt(dx * dx + dy * dy);

      f += dist;
    }

    ind.totalDist = f;
  }

  allInds.sort((a, b) => a.totalDist - b.totalDist);

  stepCounter++;
  if (stepCounter >= 10) {
    stepCounter = 0;

    // console.log(allInds[0].path);
    // console.log(allInds[0].totalDist);
  }

  let newAllInds = [];
  for (let i = 0; i < numInds; i++) {
    if (i === 0) {
      newAllInds.push({ path: [...allInds[0].path], totalDist: 0 });
      continue;
    }

    let parent1 = tournament();
    let parent2 = parent1;

    while (parent2 === parent1) {
      parent2 = tournament();
    }

    let childPath = crossover(parent1, parent2);

    if (Math.random() < 0.25) mutateSwap(childPath);
    if (Math.random() < 0.25) mutate2opt(childPath);

    childPath = childPath.filter(x => x !== 0);
    childPath.unshift(0);

    newAllInds.push({ path: childPath, totalDist: 0 });
  }

  allInds = newAllInds;

  draw();
  // setTimeout(() => step(), 1);
  requestAnimationFrame(step);
}

function crossover(parent1, parent2) {
  let size = parent1.path.length;
  let cutPoint = Math.floor(Math.random() * size);
  let childPath = new Array(size).fill(null);

  for (let i = 0; i < cutPoint; i++) childPath[i] = parent1.path[i];

  let idx = 0;
  for (let i = cutPoint; i < size; i++) {
    while (childPath.includes(parent2.path[idx])) idx++;

    childPath[i] = parent2.path[idx];

    idx++;
  }

  return childPath;
}

function mutateSwap(path) {
  let i = Math.floor(Math.random() * path.length);
  let j = Math.floor(Math.random() * path.length);

  let temp = path[i];
  path[i] = path[j];
  path[j] = temp;
}

function mutate2opt(path) {
  let i = Math.floor(Math.random() * path.length);
  let j = Math.floor(Math.random() * path.length);

  if (i > j) {
    let temp = i;
    i = j;
    j = temp;
  }

  let newPath = [];

  for (let k = 0; k < i; k++) newPath.push(path[k]);
  for (let k = j; k >= i; k--) newPath.push(path[k]);
  for (let k = j + 1; k < path.length; k++) newPath.push(path[k]);
  for (let k = 0; k < path.length; k++) path[k] = newPath[k];
}

function tournament() {
  let best = allInds[Math.floor(Math.random() * allInds.length)];

  for (let i = 0; i < k; i++) {
    let ind = allInds[Math.floor(Math.random() * allInds.length)];
    if (ind.totalDist < best.totalDist) best = ind;
  }

  return best;
}

function handleInput() {
  showPopulation = document.getElementById("showPopulation").checked;
}

ctx.lineWidth = 2;

function draw() {
  ctx.clearRect(0, 0, world.width, world.height);
  ctx.strokeStyle = "black";

  let ind = allInds[0];

  for (let i = 0; i < ind.path.length; i++) {
    let obj = allObjects[ind.path[i]];

    if (i < allObjects.length - 1) {
      let x1 = obj.x;
      let y1 = obj.y;
      let x2 = allObjects[ind.path[i + 1]].x;
      let y2 = allObjects[ind.path[i + 1]].y;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  if (showPopulation) {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.007)";

    for (let ind of allInds) {
      for (let i = 0; i < ind.path.length; i++) {
        let obj = allObjects[ind.path[i]];

        if (i < allObjects.length - 1) {
          let x1 = obj.x;
          let y1 = obj.y;
          let x2 = allObjects[ind.path[i + 1]].x;
          let y2 = allObjects[ind.path[i + 1]].y;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
  }

  for (let i = 0; i < ind.path.length; i++) {
    let obj = allObjects[ind.path[i]];

    ctx.fillStyle = "blue";
    ctx.font = "14px Arial";
    ctx.fillText(i, obj.x + 10, obj.y + 5);

    ctx.beginPath();
    ctx.arc(obj.x, obj.y, 5, 0, Math.PI * 2);

    let shade = i / numObjects;
    ctx.fillStyle = `rgb(${255 * shade}, 0, 0)`;
    if (i === 0) ctx.fillStyle = "green";

    ctx.fill();
  }
}

function initializeObjects() {
  allObjects = [];

  for (let i = 0; i < numObjects; i++) {
    allObjects.push({
      x: Math.random() * world.width,
      y: Math.random() * world.height
    });
  }
}

function initializeInds() {
  allInds = [];

  for (let i = 0; i < numInds; i++) {
    let path = [];
    for (let j = 0; j < numObjects; j++) path.push(j);

    path.sort(() => Math.random() - 0.5);
    path = path.filter(x => x !== 0);
    path.unshift(0);

    allInds.push({ path: path, totalDist: 0 });
  }
}

initializeObjects();    
initializeInds();
step();
