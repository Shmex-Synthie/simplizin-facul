const columns = [
    { key: "novo", label: "Novo", className: "novo" },
    { key: "pendente", label: "Pendente", className: "pendente" },
    { key: "concluido", label: "Concluído", className: "concluido" },
    { key: "backlog", label: "Backlog", className: "backlog" },
  ];
  
  const state = {
    tasks: JSON.parse(localStorage.getItem("simplizin_tasks")) || sampleTasks,
    search: "",
  };
  
  const board = document.getElementById("board");
  const taskForm = document.getElementById("taskForm");
  const stats = document.getElementById("stats");
  const searchInput = document.getElementById("search");
  
  function saveTasks() {
    localStorage.setItem("simplizin_tasks", JSON.stringify(state.tasks));
  }
  
  function moveTask(id, direction) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
  
    const index = columns.findIndex((c) => c.key === task.status);
    const newIndex = index + direction;
  
    if (newIndex < 0 || newIndex >= columns.length) return;
  
    task.status = columns[newIndex].key;
    saveTasks();
    render();
  }
  
  function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }
  
  function addComment(id, text) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task || !text.trim()) return;
  
    task.comments.push(text.trim());
    saveTasks();
    render();
  }
  
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  
  function createTaskCard(task) {
    const card = document.createElement("div");
    card.className = `task-card ${task.checked ? "checked" : ""}`;
  
    const columnIndex = columns.findIndex((c) => c.key === task.status);
  
    card.innerHTML = `
      <div class="task-top">
        <div>
          <p class="task-title">${escapeHtml(task.title)}</p>
          <div class="task-meta">Criada em: ${escapeHtml(task.createdAt)}</div>
        </div>
      </div>
  
      <div class="task-desc">${escapeHtml(task.description || "Sem descrição.")}</div>
  
      <div class="task-actions">
        <button class="btn-soft" ${columnIndex === 0 ? "disabled" : ""} data-action="left">← Mover</button>
        <button class="btn-soft" ${columnIndex === columns.length - 1 ? "disabled" : ""} data-action="right">Mover →</button>
        <button class="btn-danger" data-action="delete">Excluir</button>
      </div>
  
      <div class="comments">
        <h4>Anotações</h4>
        <div>
          ${
            task.comments.length
              ? task.comments
                  .map((comment) => `<div class="comment-item">${escapeHtml(comment)}</div>`)
                  .join("")
              : '<div class="comment-item">Nenhuma anotação registrada.</div>'
          }
        </div>
  
        <div class="comment-form">
          <input type="text" placeholder="Adicionar comentário" data-comment-input />
          <button class="btn-soft" data-action="comment">Salvar</button>
        </div>
      </div>
    `;
  
    card.querySelector('[data-action="left"]').addEventListener("click", () => moveTask(task.id, -1));
    card.querySelector('[data-action="right"]').addEventListener("click", () => moveTask(task.id, 1));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteTask(task.id));
    card.querySelector('[data-action="comment"]').addEventListener("click", () => {
      const input = card.querySelector("[data-comment-input]");
      addComment(task.id, input.value);
    });
  
    return card;
  }
  
  function render() {
    const filtered = state.tasks.filter((task) => {
      const content = `${task.title} ${task.description}`.toLowerCase();
      return content.includes(state.search.toLowerCase());
    });
  
    stats.textContent = `${filtered.length} tarefa(s) exibida(s) • ${state.tasks.length} no total`;
    board.innerHTML = "";
  
    columns.forEach((column) => {
      const wrapper = document.createElement("section");
      wrapper.className = "column";
  
      const tasksInColumn = filtered.filter((task) => task.status === column.key);
  
      wrapper.innerHTML = `
        <div class="column-header ${column.className}">${column.label} (${tasksInColumn.length})</div>
        <div class="column-body"></div>
      `;
  
      const body = wrapper.querySelector(".column-body");
  
      if (!tasksInColumn.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Nenhuma tarefa nesta fila.";
        body.appendChild(empty);
      } else {
        tasksInColumn.forEach((task) => body.appendChild(createTaskCard(task)));
      }
  
      board.appendChild(wrapper);
    });
  }
  
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
  
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status").value;
  
    if (!title) return;
  
    state.tasks.unshift({
      id: crypto.randomUUID(),
      title,
      description,
      status,
      createdAt: new Date().toLocaleString("pt-BR"),
      comments: [],
    });
  
    saveTasks();
    taskForm.reset();
    render();
  });
  
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });
  
  render();