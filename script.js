const ticketCountInput = document.getElementById("ticketCount");
const fixedRedsInput = document.getElementById("fixedReds");
const excludedRedsInput = document.getElementById("excludedReds");
const fixedBlueInput = document.getElementById("fixedBlue");
const excludedBluesInput = document.getElementById("excludedBlues");
const generateBtn = document.getElementById("generateBtn");
const randomPresetBtn = document.getElementById("randomPresetBtn");
const resetBtn = document.getElementById("resetBtn");
const ticketsEl = document.getElementById("tickets");
const statusEl = document.getElementById("status");
const drawTimeEl = document.getElementById("drawTime");

function parseNumbers(value, min, max) {
  const parts = value.split(/[\s,]+/).filter(Boolean);
  const unique = new Set();

  for (const part of parts) {
    const num = Number(part);
    if (Number.isInteger(num) && num >= min && num <= max) {
      unique.add(num);
    }
  }

  return [...unique].sort((a, b) => a - b);
}

function pickUniqueNumbers(pool, count) {
  const items = [...pool];

  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items.slice(0, count).sort((a, b) => a - b);
}

function formatBall(num) {
  return String(num).padStart(2, "0");
}

function updateTimestamp() {
  const now = new Date();
  drawTimeEl.textContent = now.toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderEmpty(message) {
  ticketsEl.innerHTML = `<div class="empty">${message}</div>`;
}

function renderTickets(tickets) {
  if (!tickets.length) {
    renderEmpty("조건에 맞는 조합을 만들 수 없습니다. 제외 번호를 줄이거나 고정 번호를 다시 확인하세요.");
    return;
  }

  ticketsEl.innerHTML = tickets.map((ticket, index) => `
    <article class="ticket" style="animation-delay: ${index * 60}ms">
      <div class="ticket-top">
        <strong>${index + 1}번째 추천</strong>
        <span class="badge">합계 ${ticket.reds.reduce((sum, n) => sum + n, 0)} / 홀수 ${ticket.reds.filter((n) => n % 2).length}개</span>
      </div>
      <div class="balls">
        ${ticket.reds.map((num) => `<span class="ball red">${formatBall(num)}</span>`).join("")}
        <span class="ball blue">${formatBall(ticket.blue)}</span>
      </div>
    </article>
  `).join("");
}

function generateTickets() {
  const ticketCount = Math.min(20, Math.max(1, Number(ticketCountInput.value) || 5));
  ticketCountInput.value = ticketCount;

  const fixedReds = parseNumbers(fixedRedsInput.value, 1, 33);
  const excludedReds = parseNumbers(excludedRedsInput.value, 1, 33);
  const excludedBlues = parseNumbers(excludedBluesInput.value, 1, 16);
  const fixedBlueCandidates = parseNumbers(fixedBlueInput.value, 1, 16);
  const fixedBlue = fixedBlueCandidates[0];

  if (fixedReds.length > 6) {
    statusEl.textContent = "고정 빨간 공은 6개까지만 사용할 수 있습니다.";
    renderTickets([]);
    return;
  }

  if (fixedBlueCandidates.length > 1) {
    statusEl.textContent = "고정 파란 공은 1개만 입력해 주세요.";
    renderTickets([]);
    return;
  }

  const redPool = [];
  for (let i = 1; i <= 33; i += 1) {
    if (!excludedReds.includes(i) || fixedReds.includes(i)) {
      redPool.push(i);
    }
  }

  const missingRedCount = 6 - fixedReds.length;
  const availableReds = redPool.filter((num) => !fixedReds.includes(num));

  if (missingRedCount < 0 || availableReds.length < missingRedCount) {
    statusEl.textContent = "빨간 공 조건이 너무 엄격합니다. 고정/제외 번호를 조정해 주세요.";
    renderTickets([]);
    return;
  }

  const bluePool = [];
  for (let i = 1; i <= 16; i += 1) {
    if (!excludedBlues.includes(i) || i === fixedBlue) {
      bluePool.push(i);
    }
  }

  if ((fixedBlue && !bluePool.includes(fixedBlue)) || (!fixedBlue && bluePool.length === 0)) {
    statusEl.textContent = "파란 공 조건이 너무 엄격합니다. 고정/제외 번호를 조정해 주세요.";
    renderTickets([]);
    return;
  }

  const tickets = Array.from({ length: ticketCount }, () => {
    const reds = [...fixedReds, ...pickUniqueNumbers(availableReds, missingRedCount)].sort((a, b) => a - b);
    const blue = fixedBlue || bluePool[Math.floor(Math.random() * bluePool.length)];
    return { reds, blue };
  });

  renderTickets(tickets);
  statusEl.textContent = `${ticketCount}개 조합을 생성했습니다. 고정 빨간 공 ${fixedReds.length}개, 제외 빨간 공 ${excludedReds.length}개가 반영되었습니다.`;
  updateTimestamp();
}

function fillRandomPreset() {
  const sampleRedPool = Array.from({ length: 33 }, (_, i) => i + 1);
  const presetFixed = pickUniqueNumbers(sampleRedPool, 2);
  const presetExcluded = pickUniqueNumbers(sampleRedPool.filter((n) => !presetFixed.includes(n)), 4);
  const presetBlue = Math.ceil(Math.random() * 16);
  const presetExcludedBlue = pickUniqueNumbers(
    Array.from({ length: 16 }, (_, i) => i + 1).filter((n) => n !== presetBlue),
    2
  );

  ticketCountInput.value = String(5 + Math.floor(Math.random() * 4));
  fixedRedsInput.value = presetFixed.join(", ");
  excludedRedsInput.value = presetExcluded.join(", ");
  fixedBlueInput.value = String(presetBlue);
  excludedBluesInput.value = presetExcludedBlue.join(", ");
  statusEl.textContent = "랜덤 조건을 채웠습니다. 바로 번호 추천을 눌러 조합을 생성할 수 있습니다.";
}

function resetForm() {
  ticketCountInput.value = 5;
  fixedRedsInput.value = "";
  excludedRedsInput.value = "";
  fixedBlueInput.value = "";
  excludedBluesInput.value = "";
  renderEmpty("아직 생성된 조합이 없습니다. 왼쪽에서 조건을 입력한 뒤 번호 추천을 실행하세요.");
  statusEl.textContent = "입력값을 초기화했습니다.";
  updateTimestamp();
}

generateBtn.addEventListener("click", generateTickets);
randomPresetBtn.addEventListener("click", fillRandomPreset);
resetBtn.addEventListener("click", resetForm);

updateTimestamp();
