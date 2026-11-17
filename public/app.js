import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
import { STYLES, LENGTHS, SHAPE_INFO } from "./styles.js";

const $ = (id) => document.getElementById(id);
const canvas = $("canvas"), ctx = canvas.getContext("2d");
let landmarker, faceImg = null, shapeKey = null;

// ---------- загрузка фото ----------
getLandmarker().catch(() => {}); // прогрев модели при открытии страницы
$("drop").onclick = () => $("file").click();
$("drop").ondragover = (e) => { e.preventDefault(); $("drop").classList.add("over"); };
$("drop").ondragleave = () => $("drop").classList.remove("over");
$("drop").ondrop = (e) => { e.preventDefault(); $("drop").classList.remove("over"); loadFile(e.dataTransfer.files[0]); };
$("file").onchange = (e) => loadFile(e.target.files[0]);

function loadFile(f) {
  if (!f || !f.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, 768 / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * s); canvas.height = Math.round(img.height * s);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.hidden = false; $("dropText").hidden = true;
    faceImg = canvas.toDataURL("image/jpeg", 0.92);
    $("analyze").disabled = false; $("results").hidden = true; $("status").textContent = "";
  };
  img.src = URL.createObjectURL(f);
}

async function getLandmarker() {
  if (landmarker) return landmarker;
  const fs = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
  landmarker = await FaceLandmarker.createFromOptions(fs, {
    baseOptions: { modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" },
    runningMode: "IMAGE", numFaces: 1,
  });
  return landmarker;
}

// ---------- анализ ----------
$("analyze").onclick = async () => {
  $("analyze").disabled = true; $("status").textContent = "Загружаю модель и анализирую…";
  try {
    const lm = await getLandmarker();
    const img = new Image(); img.src = faceImg; await img.decode();
    const res = lm.detect(img);
    if (!res.faceLandmarks.length) throw new Error("Лицо не найдено. Попробуйте фото анфас с хорошим светом.");
    ctx.drawImage(img, 0, 0);
    analyze(res.faceLandmarks[0]);
    $("status").textContent = "";
    $("results").hidden = false;
    $("results").scrollIntoView({ behavior: "smooth" });
  } catch (e) { $("status").textContent = "⚠ " + e.message; }
  $("analyze").disabled = false;
};

function analyze(L) {
  const W = canvas.width, H = canvas.height;
  const P = (i) => ({ x: L[i].x * W, y: L[i].y * H });
  const d = (a, b) => Math.hypot(P(a).x - P(b).x, P(a).y - P(b).y);
  const avgY = (...ix) => ix.reduce((s, i) => s + P(i).y, 0) / ix.length;

  // Landmark 10 лежит чуть ниже линии роста волос — добавляем ~12% лба
  const chinY = P(152).y, topMesh = P(10).y;
  const browY = avgY(105, 334, 66, 296);
  const noseBaseY = P(94).y;
  const foreheadExt = (browY - topMesh) * 0.12;
  const topY = topMesh - foreheadExt;
  const t1 = browY - topY, t2 = noseBaseY - browY, t3 = chinY - noseBaseY, total = chinY - topY;

  const Wf = d(54, 284), Wc = d(234, 454), Wj = d(58, 288), len = total;
  const r = len / Wc, jf = Wj / Wc, ff = Wf / Wc;

  let key;
  if (r >= 1.45) key = "oblong";
  else if (ff - jf > 0.08 && r > 1.2) key = "heart";
  else if (ff < 0.8 && jf < 0.8) key = "diamond";
  else if (r < 1.25) key = jf >= 0.86 ? "square" : "round";
  else key = jf >= 0.9 ? "square" : "oval";
  shapeKey = key;

  $("shape").innerHTML = `<div class="badge">${SHAPE_INFO[key][0]}</div><p>${SHAPE_INFO[key][1]}</p>
    <small>Длина/ширина скул: ${r.toFixed(2)} · лоб/скулы: ${ff.toFixed(2)} · челюсть/скулы: ${jf.toFixed(2)}</small>`;

  // трети
  const parts = [["Верхняя (лоб)", t1], ["Средняя (брови–нос)", t2], ["Нижняя (нос–подбородок)", t3]];
  const ideal = total / 3;
  $("thirds").innerHTML = `<div class="bars">` + parts.map(([n, v]) => {
    const p = (v / total) * 100;
    return `<div class="bar"><span class="name">${n}</span><div class="track"><div class="fill" style="width:${p}%"></div></div><span class="pct">${p.toFixed(0)}%</span></div>`;
  }).join("") + `</div><p class="muted">${thirdsText(t1, t2, t3, ideal)}</p>
    <small>Идеал — по 33% каждая. Верхняя треть оценивается приблизительно (линия волос).</small>`;

  // факты
  const eyeW = (d(33, 133) + d(263, 362)) / 2, eyeGap = d(133, 362);
  const noseW = d(49, 279), mouthW = d(61, 291);
  const sym = symmetry(P);
  const facts = [
    `Расстояние между глазами ${(eyeGap / eyeW).toFixed(2)} ширины глаза — ${eyeGap / eyeW > 1.15 ? "широко посаженные глаза" : eyeGap / eyeW < 0.9 ? "близко посаженные глаза" : "стандартная посадка глаз"}.`,
    `Ширина носа ≈ ${(noseW / eyeGap).toFixed(2)} расстояния между глазами (${noseW / eyeGap > 1.1 ? "широковат" : noseW / eyeGap < 0.85 ? "узкий" : "пропорциональный"}).`,
    `Рот ${(mouthW / noseW).toFixed(2)} ширины носа — норма 1.4–1.6.`,
    `Лоб ${ff > 0.88 ? "широкий" : ff < 0.78 ? "узкий" : "средний"} относительно скул; челюсть ${jf > 0.88 ? "выраженная и широкая" : jf < 0.75 ? "узкая" : "средняя"}.`,
    `Симметрия лица ≈ ${sym.toFixed(0)}% (по ключевым точкам; зависит от наклона головы).`,
    key === "round" || key === "oblong" ? "Совет по бороде/чёлке: подбирайте форму, которая компенсирует форму лица." : "Совет: короткие бока с объёмом сверху работают с большинством форм.",
  ];
  $("facts").innerHTML = facts.map((f) => `<li>${f}</li>`).join("");

  // отрисовка линий трети
  ctx.lineWidth = Math.max(2, W / 400);
  [[topY, "#22d3ee"], [browY, "#8b5cf6"], [noseBaseY, "#8b5cf6"], [chinY, "#22d3ee"]].forEach(([y, c]) => {
    ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(W * 0.1, y); ctx.lineTo(W * 0.9, y); ctx.stroke();
  });

  renderStyles();
}

function thirdsText(a, b, c, i) {
  const f = (v) => (v > i * 1.1 ? "длиннее" : v < i * 0.9 ? "короче" : "в норме");
  return `Верхняя треть ${f(a)}, средняя ${f(b)}, нижняя ${f(c)}.` +
    (a > i * 1.1 ? " Высокий лоб — подойдёт чёлка." : "") + (c > i * 1.1 ? " Длинный низ — добавьте объём по бокам." : "");
}

function symmetry(P) {
  const mid = (P(10).x + P(152).x) / 2;
  const pairs = [[33, 263], [133, 362], [61, 291], [234, 454], [105, 334], [58, 288]];
  const w = Math.abs(P(234).x - P(454).x);
  const diff = pairs.reduce((s, [a, b]) => s + Math.abs(Math.abs(P(a).x - mid) - Math.abs(P(b).x - mid)), 0) / pairs.length;
  return Math.max(0, 100 - (diff / w) * 400);
}

// ---------- причёски ----------
function renderStyles() {
  const g = $("gender").value, set = STYLES[g][shapeKey];
  $("styles").innerHTML = LENGTHS.map(([k, title]) => `
    <div class="style"><h3>${title}</h3>
      ${set[k].map(([ru, en]) => {
        const q = encodeURIComponent(`${en} hairstyle ${g === "male" ? "men" : "women"}`);
        return `<a class="btn" target="_blank" href="https://www.google.com/search?tbm=isch&q=${q}">🔎 ${ru}</a>`;
      }).join("")}
    </div>`).join("");
}
$("gender").onchange = () => shapeKey && renderStyles();
