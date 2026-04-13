const quotes = [
  ["Dnes nehledej motivaci. Hledej příležitost.", "Prachy většinou přijdou po akci, ne po přemýšlení."],
  ["Disciplína vydělává víc než nálada.", "Když se ti nechce, právě tehdy se odděluje průměr od výsledků."],
  ["Jedna zpráva může otevřít nový příjem.", "Napiš člověku, zavolej, nabídni řešení. Peníze mají rády pohyb."],
  ["Nečekej na dokonalý plán. Udělej tah.", "Rychlost a konzistence porazí váhání."],
  ["Každý den bez kroku je den pro někoho jiného.", "Buď ten, kdo bere šance dřív než ostatní."],
  ["Mysli jako někdo, kdo buduje cashflow.", "Dnešní rozhodnutí je základ zítřejších peněz."],
  ["Peníze milují lidi, kteří řeší problémy.", "Najdi problém a nabídni řešení rychleji než ostatní."],
];

const focuses = [
  "Najdi 1 způsob, jak vydělat víc.",
  "Ozvi se 3 lidem kvůli práci nebo kšeftu.",
  "Udělaj 1 tah, který může nést peníze i za týden.",
  "Dnes nic neodkládej. Jedna akce hned.",
  "Vyčisti chaos a soustřeď se na nejvýdělečnější krok.",
];

const taskPool = [
  "Napiš jednomu člověku, který ti může přinést práci.",
  "Mrkni na 3 nové příležitosti nebo inzeráty.",
  "Pošli jednu nabídku nebo připomeň se klientovi.",
  "Sepiš si jeden skill, který můžeš zpeněžit.",
  "Udělej 20 minut soustředěné práce bez rozptylování.",
  "Zeptej se sám sebe: co mi dnes může vydělat nejvíc?",
  "Vymysli jednu věc, kterou můžeš prodávat nebo nabídnout.",
  "Omez scroll a nahraď ho akcí, která něco přinese.",
  "Zkontroluj rozpracované věci a dotáhni jednu do konce.",
];

const inspo = [
  "Nejde o to být motivovaný celý den. Jde o to udělat tah i bez nálady.",
  "Peníze často přijdou až po sérii nudných kroků, které ostatní neudělají.",
  "Když dnes vyhraješ nad odkládáním, zítra máš náskok.",
  "Největší posun dělá pravidelnost, ne jednorázový hype.",
  "I malý krok se počítá, pokud míří správným směrem.",
];

const $ = (id) => document.getElementById(id);
const today = new Date().toISOString().slice(0, 10);
const quoteIndex = new Date().getDate() % quotes.length;
const focusIndex = new Date().getDate() % focuses.length;

function initTheme() {
  const savedTheme = localStorage.getItem("cashdrive-theme");
  if (savedTheme === "light") document.body.classList.add("light");
  $("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("cashdrive-theme", document.body.classList.contains("light") ? "light" : "dark");
  });
}

function updateQuote() {
  const [q, s] = quotes[quoteIndex];
  $("dailyQuote").textContent = q;
  $("quoteSub").textContent = s;
  $("focusValue").textContent = focuses[focusIndex];
}

function shuffle(list, n = 3) {
  return [...list].sort(() => Math.random() - 0.5).slice(0, n);
}

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem("cashdrive-tasks") || "null");
  let taskDate = localStorage.getItem("cashdrive-task-date");
  if (!tasks || taskDate !== today) {
    tasks = shuffle(taskPool).map((text, i) => ({ id: i + 1, text, done: false }));
    localStorage.setItem("cashdrive-tasks", JSON.stringify(tasks));
    localStorage.setItem("cashdrive-task-date", today);
  }

  const wrapper = $("tasks");
  wrapper.innerHTML = "";
  tasks.forEach((task, index) => {
    const item = document.createElement("label");
    item.className = `task ${task.done ? "done" : ""}`;
    item.innerHTML = `<input type="checkbox" ${task.done ? "checked" : ""}><span>${task.text}</span>`;
    const checkbox = item.querySelector("input");
    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      localStorage.setItem("cashdrive-tasks", JSON.stringify(tasks));
      renderTasks();
    });
    wrapper.appendChild(item);
  });
}

function updateStreak() {
  const lastOpen = localStorage.getItem("cashdrive-last-open");
  let streak = Number(localStorage.getItem("cashdrive-streak") || 0);

  if (lastOpen !== today) {
    if (lastOpen) {
      const diffDays = Math.floor((new Date(today) - new Date(lastOpen)) / (1000 * 60 * 60 * 24));
      streak = diffDays === 1 ? streak + 1 : 1;
    } else {
      streak = 1;
    }
    localStorage.setItem("cashdrive-last-open", today);
    localStorage.setItem("cashdrive-streak", String(streak));
  }

  $("streakValue").textContent = streak;
}

function initNotes() {
  const savedDate = localStorage.getItem("cashdrive-note-date");
  const savedText = localStorage.getItem("cashdrive-note") || "";
  if (savedDate === today) {
    $("winInput").value = savedText;
    $("savedNote").textContent = savedText ? `Dnešní uložená výhra:\n${savedText}` : "";
  }

  $("saveNoteBtn").addEventListener("click", saveNote);
  $("saveWinBtn").addEventListener("click", () => {
    $("winInput").focus();
    $("winInput").scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function saveNote() {
  const text = $("winInput").value.trim();
  localStorage.setItem("cashdrive-note", text);
  localStorage.setItem("cashdrive-note-date", today);
  $("savedNote").textContent = text ? `Dnešní uložená výhra:\n${text}` : "Nic jsi zatím neuložil.";
}

function initBoost() {
  $("boostBtn").addEventListener("click", () => {
    const [q, s] = quotes[Math.floor(Math.random() * quotes.length)];
    $("dailyQuote").textContent = q;
    $("quoteSub").textContent = s;
    window.navigator.vibrate?.(40);
  });
  $("newTasksBtn").addEventListener("click", () => {
    localStorage.removeItem("cashdrive-tasks");
    localStorage.removeItem("cashdrive-task-date");
    renderTasks();
  });
}

function renderInspo() {
  const list = $("inspoList");
  list.innerHTML = shuffle(inspo, 4).map((item) => `<li>${item}</li>`).join("");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

initTheme();
updateQuote();
renderTasks();
updateStreak();
initNotes();
initBoost();
renderInspo();
