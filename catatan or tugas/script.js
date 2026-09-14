let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);

  initBackgroundColor();
  tampilkanTugas();

  document.getElementById("btnTambah").addEventListener("click", tambahTugas);
  document.getElementById("searchInput").addEventListener("input", tampilkanTugas);
  document.getElementById("btnHapusSelesai").addEventListener("click", hapusSelesai);

  const filterBtns = document.querySelectorAll(".btn-filter");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      filterBtns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      currentFilter = e.target.getAttribute("data-filter");
      tampilkanTugas();
    });
  });
});

function initBackgroundColor() {
  const bgPicker = document.getElementById("bgPicker");
  const savedBgColor = localStorage.getItem("custom_bg_color");

  if (savedBgColor) {
    document.body.style.backgroundColor = savedBgColor;
    bgPicker.value = savedBgColor;
  }

  bgPicker.addEventListener("input", (e) => {
    const selectedColor = e.target.value;
    document.body.style.backgroundColor = selectedColor;
    localStorage.setItem("custom_bg_color", selectedColor);
  });
}

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("id-ID", { hour12: false }) + " WIB";
  document.getElementById("clock").innerText = timeString;
}

function tambahTugas() {
  const matkulInput = document.getElementById("matkul");
  const deskripsiInput = document.getElementById("deskripsi");
  const deadlineInput = document.getElementById("deadline");

  const matkul = matkulInput.value.trim();
  const deskripsi = deskripsiInput.value.trim();
  const deadline = deadlineInput.value;

  if (!matkul || !deskripsi) {
    alert("Harap isi mata kuliah dan deskripsi tugas ya!");
    return;
  }

  const newTask = {
    id: Date.now(),
    matkul: matkul,
    deskripsi: deskripsi,
    deadline: deadline,
    completed: false
  };

  let tasks = JSON.parse(localStorage.getItem("campus_tasks")) || [];
  tasks.push(newTask);
  localStorage.setItem("campus_tasks", JSON.stringify(tasks));

  matkulInput.value = "";
  deskripsiInput.value = "";
  deadlineInput.value = "";

  tampilkanTugas();
}

function tampilkanTugas() {
  const taskList = document.getElementById("taskList");
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();
  let tasks = JSON.parse(localStorage.getItem("campus_tasks")) || [];

  let filtered = tasks.filter(t => 
    t.matkul.toLowerCase().includes(searchQuery) || 
    t.deskripsi.toLowerCase().includes(searchQuery)
  );

  if (currentFilter === "pending") {
    filtered = filtered.filter(t => !t.completed);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter(t => t.completed);
  }

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    taskList.innerHTML = `<div class="empty-state">Tidak ada catatan...</div>`;
  } else {
    filtered.forEach(task => {
      const item = document.createElement("div");
      item.className = `task-item ${task.completed ? "completed" : ""}`;
      item.innerHTML = `
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id})">
          <div class="task-details">
            <span class="task-title">${escapeHtml(task.matkul)}</span>
            <span class="task-desc">${escapeHtml(task.deskripsi)}</span>
            ${task.deadline ? `<span class="task-deadline">⏳ DL: ${task.deadline}</span>` : ''}
          </div>
        </div>
        <button class="btn-del-item" onclick="hapusTugasId(${task.id})">✕</button>
      `;
      taskList.appendChild(item);
    });
  }

  const pendingCount = tasks.filter(t => !t.completed).length;
  document.getElementById("counterText").innerText = `${pendingCount} tugas tersisa`;
}

function toggleTask(id) {
  let tasks = JSON.parse(localStorage.getItem("campus_tasks")) || [];
  tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  localStorage.setItem("campus_tasks", JSON.stringify(tasks));
  tampilkanTugas();
}

function hapusTugasId(id) {
  let tasks = JSON.parse(localStorage.getItem("campus_tasks")) || [];
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem("campus_tasks", JSON.stringify(tasks));
  tampilkanTugas();
}

function hapusSelesai() {
  let tasks = JSON.parse(localStorage.getItem("campus_tasks")) || [];
  tasks = tasks.filter(t => !t.completed);
  localStorage.setItem("campus_tasks", JSON.stringify(tasks));
  tampilkanTugas();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text;
  return div.innerHTML;
}