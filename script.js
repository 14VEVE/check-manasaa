const TASKS_KEY = "mindflow_tasks";
const tasks = loadTasks();

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

/* CATEGORY SELECTION */
const categoryOptions = document.querySelectorAll(".category-option");

categoryOptions.forEach((option) => {
  option.addEventListener("click", () => {
    categoryOptions.forEach((o) => o.classList.remove("selected"));
    option.classList.add("selected");
    const input = option.querySelector("input[type='radio']");
    if (input) input.checked = true;
  });
});

/* TOAST */
const toast = document.getElementById("toast");
let toastTimeout = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  void toast.offsetWidth;
  toast.classList.add("visible");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.classList.add("hidden"), 200);
  }, 2200);
}

/* FORM SUBMIT */
const form = document.getElementById("task-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("taskName").value.trim();
  const deadline = document.getElementById("deadline").value;
  const estimatedTime = parseInt(
    document.getElementById("estimatedTime").value,
    10
  );
  const categoryRadio = document.querySelector(
    "input[name='category']:checked"
  );
  const category = categoryRadio ? categoryRadio.value : null;

  if (!name || !deadline || !estimatedTime || !category) {
    showToast("Please fill all fields before adding a task.");
    return;
  }

  const task = {
    id: Date.now().toString(),
    name,
    deadline,
    estimatedTime,
    category,
    createdAt: Date.now(),
    completed: false,
  };

  tasks.push(task);
  saveTasks(tasks);

  form.reset();

  // Reset Deep Work as default selection
  categoryOptions.forEach((o) => o.classList.remove("selected"));
  const defaultOption = document
    .querySelector(".category-option input[value='Deep Work']")
    .closest(".category-option");
  defaultOption.classList.add("selected");
  defaultOption.querySelector("input").checked = true;

  showToast("Task added successfully!");
});

/* BOTTOM BUTTONS */

document.getElementById("openMoodPlanner").addEventListener("click", () => {
  // Go straight to the Plan Schedule page
  window.location.href = "schedule.html";
});

document.getElementById("viewAllTasks").addEventListener("click", () => {
  window.location.href = "tasks.html";
});
