const TASKS_KEY = "mindflow_tasks";

/* Storage helpers */
function loadTasks() {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse tasks from storage", e);
    return [];
  }
}

function saveTasks(list) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(list));
}

/* FORMAT HELPERS */

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const options = { month: "short", day: "numeric", year: "numeric" };
  return d.toLocaleDateString(undefined, options);
}

function formatMinutes(totalMin) {
  if (!totalMin || totalMin <= 0) return "0m";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/* DOM REFS */

const tasksContainer = document.getElementById("tasksContainer");
const taskCountEl = document.getElementById("taskCount");
const totalTasksValueEl = document.getElementById("totalTasksValue");
const totalTimeValueEl = document.getElementById("totalTimeValue");
const avgTimeValueEl = document.getElementById("avgTimeValue");

const sortPills = document.querySelectorAll("#sortPills .pill-btn");
const categoryPills = document.querySelectorAll("#categoryPills .pill-btn");

let sortBy = "deadline";
let categoryFilter = "All";

let tasks = loadTasks();

/* Auto-select category if all tasks share the same */
(function setInitialCategoryFilter() {
  const activeTasks = tasks.filter((t) => !t.completed);
  const categories = [...new Set(activeTasks.map((t) => t.category))];
  if (categories.length === 1) {
    categoryFilter = categories[0];
    categoryPills.forEach((btn) => {
      btn.classList.toggle("pill-active", btn.dataset.category === categoryFilter);
    });
  }
})();

/* SORT PILLS */

sortPills.forEach((btn) => {
  btn.addEventListener("click", () => {
    sortPills.forEach((b) => b.classList.remove("pill-active"));
    btn.classList.add("pill-active");
    sortBy = btn.dataset.sort;
    renderTasks();
  });
});

/* CATEGORY PILLS */

categoryPills.forEach((btn) => {
  btn.addEventListener("click", () => {
    categoryPills.forEach((b) => b.classList.remove("pill-active"));
    btn.classList.add("pill-active");
    categoryFilter = btn.dataset.category;
    renderTasks();
  });
});

/* RENDERING */

function getVisibleTasks() {
  let list = tasks.filter((t) => !t.completed);

  if (categoryFilter !== "All") {
    list = list.filter((t) => t.category === categoryFilter);
  }

  switch (sortBy) {
    case "time":
      list.sort((a, b) => b.estimatedTime - a.estimatedTime);
      break;
    case "newest":
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      break;
    case "deadline":
    default:
      list.sort((a, b) => {
        const da = new Date(a.deadline).getTime();
        const db = new Date(b.deadline).getTime();
        return da - db;
      });
  }

  return list;
}

function renderStats(list) {
  const totalTasks = list.length;
  const totalMinutes = list.reduce((s, t) => s + (t.estimatedTime || 0), 0);
  const avgMinutes = totalTasks ? Math.round(totalMinutes / totalTasks) : 0;

  taskCountEl.textContent = totalTasks;
  totalTasksValueEl.textContent = totalTasks;
  totalTimeValueEl.textContent = formatMinutes(totalMinutes);
  avgTimeValueEl.textContent = formatMinutes(avgMinutes);
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";

  card.innerHTML = `
    <div class="task-header-row">
      <div>
        <div class="task-title">${task.name}</div>
        <div class="task-meta-top">
          <span class="category-tag">${task.category}</span>
        </div>
      </div>
      <button class="task-complete-btn" data-id="${task.id}">
        <span class="task-complete-btn-icon">✓</span>
        <span>Complete</span>
      </button>
    </div>
    <div class="task-meta-bottom">
      <div class="task-meta-item">
        <span class="meta-icon">📅</span>
        <span>${formatDate(task.deadline)}</span>
      </div>
      <div class="task-meta-item">
        <span class="meta-icon">⏱️</span>
        <span>${formatMinutes(task.estimatedTime)}</span>
      </div>
    </div>
  `;

  const btn = card.querySelector(".task-complete-btn");
  btn.addEventListener("click", () => {
    tasks = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: true } : t
    );
    saveTasks(tasks);
    renderTasks();
  });

  return card;
}

function renderTasks() {
  const list = getVisibleTasks();
  tasksContainer.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("div");
    empty.style.fontSize = "14px";
    empty.style.color = "#6b7280";
    empty.textContent = "No tasks found. Try changing your filters or add a new task.";
    tasksContainer.appendChild(empty);
  } else {
    list.forEach((task) => {
      tasksContainer.appendChild(createTaskCard(task));
    });
  }

  renderStats(list);
}

/* FOOTER BUTTONS */

document.getElementById("generateSchedule").addEventListener("click", () => {
  // Take user directly to the mood-based schedule page
  window.location.href = "schedule.html";
});

document.getElementById("viewRecommended").addEventListener("click", () => {
  alert(
    "This would show your saved recommended schedule.\n(You can wire this up to another page later.)"
  );
});

/* INITIAL RENDER */
renderTasks();
