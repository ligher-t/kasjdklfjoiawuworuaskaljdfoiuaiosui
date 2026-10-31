// Log dates remain untouched: save/restore serializes the original <b> and body.
let LIFE_LOG_FIRST_VISIBLE = null;
let LIFE_LOG_VISIBLE_FILTER = "";
function lifeLogYear(li) {
  const match = /テラ暦(\d+)年/.exec(li?.querySelector("b")?.textContent || "");
  return match ? match[1] : "";
}
function lifeLogMatchesFilter(li, mode) {
  if (mode === "f-gd") return !!li.querySelector(".gd");
  if (mode === "f-bad") return !!li.querySelector(".bad");
  if (mode === "f-n") return !li.querySelector(".gd,.bad");
  return true;
}
function decorateLifeLogYears() {
  const list = document.getElementById("lg");
  if (!list) return;
  let prior = null, firstVisible = null;
  const mode = list.className;
  for (const li of list.querySelectorAll("li")) {
    const visible = lifeLogMatchesFilter(li, mode);
    const year = lifeLogYear(li);
    li.dataset.lifeYear = year;
    li.dataset.lifeYearLabel = year ? "テラ暦" + year + "年" : "";
    li.classList.toggle("ui-year-start", visible && !!year && year !== prior);
    if (visible) {
      if (!firstVisible) firstVisible = li;
      prior = year;
    }
  }
  LIFE_LOG_VISIBLE_FILTER = mode;
  LIFE_LOG_FIRST_VISIBLE = firstVisible;
}
function markNewLifeLogYear(li) {
  if (!li) return;
  const list = document.getElementById("lg");
  const mode = list?.className || "";
  if (mode !== LIFE_LOG_VISIBLE_FILTER ||
      (LIFE_LOG_FIRST_VISIBLE && LIFE_LOG_FIRST_VISIBLE.isConnected === false)) {
    decorateLifeLogYears();
    return;
  }
  const year = lifeLogYear(li);
  li.dataset.lifeYear = year;
  li.dataset.lifeYearLabel = year ? "テラ暦" + year + "年" : "";
  if (!lifeLogMatchesFilter(li, mode)) {
    li.classList.remove("ui-year-start");
    return;
  }
  const previous = mode ? LIFE_LOG_FIRST_VISIBLE : li.nextElementSibling;
  const previousYear = previous?.dataset.lifeYear || lifeLogYear(previous);
  // The newest visible record always starts the visible year section.
  li.classList.toggle("ui-year-start", !!year);
  if (previous && year && previousYear === year)
    previous.classList.remove("ui-year-start");
  LIFE_LOG_FIRST_VISIBLE = li;
}
function L(t) {
  const services = LOG_SERVICES;
  if (services.HL) return;
  const { S } = services,
    year = Number.isInteger(S.year) ? `テラ暦${S.year}年` : "テラ暦・年未記録",
    age = `${Number.isFinite(S.age) ? S.age : "年齢未記録"}歳`,
    month = Number.isInteger(S.mo) && S.mo >= 1 && S.mo <= 12 ? `${S.mo}月` : "月未記録";
  const list = services.$("lg");
  list.insertAdjacentHTML(
      "afterbegin",
      `<li><b class="ui-log-date">${year} · ${age} · ${month}</b>${t}</li>`
    );
  // O(1) for a new event even while filtered; full scans occur only on filter
  // changes and same-version restores, never on every simulation tick.
  markNewLifeLogYear(list.firstElementChild);
}
