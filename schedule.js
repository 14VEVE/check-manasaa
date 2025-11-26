const TASKS_KEY = "mindflow_tasks";

/* Load tasks from storage */
function loadTasks() {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse tasks from storage", e);
    return [];
  }
}

const tasks = loadTasks();

/* DOM references */

const moodCards = document.querySelectorAll(".mood-card");
const alertBox = document.getElementById("scheduleAlert");
const generateBtn = document.getElementById("generateMoodSchedule");

let selectedMoodId = null;
let selectedCategory = null;
let selectedMoodTitle = null;

/* Helpers */

function setAlertWarning() {
  alertBox.classList.remove("info");
  alertBox.classList.add("warning");
  alertBox.innerHTML = `
    <div class="alert-icon">⚠️</div>
    <p class="alert-text">
      Please select a mood above to generate your personalized schedule.
    </p>
  `;
}

function setAlertInfo(title, category) {
  alertBox.classList.remove("warning");
  alertBox.classList.add("info");
  alertBox.innerHTML = `
    <div class="alert-icon">ℹ️</div>
    <p class="alert-text">
      You're feeling <strong>${title}</strong>. We'll prioritize your <strong>${category}</strong> tasks
      and sort them by urgency and duration.
    </p>
  `;
}

/* Mood card selection */

moodCards.forEach((card) => {
  card.addEventListener("click", () => {
    moodCards.forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");

    selectedMoodId = card.dataset.moodId;
    selectedCategory = card.dataset.category;
    selectedMoodTitle = card.querySelector(".mood-title").textContent.trim();

    setAlertInfo(selectedMoodTitle, selectedCategory);
    generateBtn.disabled = false;
  });
});

/* Generate schedule (simple prioritization) */

generateBtn.addEventListener("click", () => {
  if (!selectedMoodId || !selectedCategory) return;

  const relevant = tasks
    .filter((t) => !t.completed && t.category === selectedCategory)
    .sort((a, b) => {
      const da = new Date(a.deadline).getTime();
      const db = new Date(b.deadline).getTime();
      if (da !== db) return da - db;
      return (b.estimatedTime || 0) - (a.estimatedTime || 0);
    });

  if (!relevant.length) {
    alert(
      `You don't have any pending tasks in the "${selectedCategory}" category yet.\n\nTry adding a few tasks first.`
    );
    return;
  }

  const summary = relevant
    .map(
      (t, index) =>
        `${index + 1}. ${t.name} – ${t.estimatedTime} min – due ${t.deadline}`
    )
    .join("\n");

  alert(
    `Here is your recommended schedule for "${selectedMoodTitle}":\n\n${summary}\n\n(You can later replace this alert with a full schedule UI.)`
  );
});

/* Initial message */
setAlertWarning();
