(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".nav-panel");

  function desktopNav() {
    return window.matchMedia("(min-width: 960px)").matches;
  }

  function closeMenu() {
    if (!toggle || !panel) return;
    panel.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    panel.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    const first = panel.querySelector("a");
    if (first) first.focus();
  }

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open") && !desktopNav()) {
        closeMenu();
        toggle.focus();
      }
    });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });
    window.addEventListener("resize", function () {
      if (desktopNav()) closeMenu();
    });
  }

  const dialog = document.querySelector(".lightbox");
  const shot = dialog ? dialog.querySelector("img") : null;
  const caption = dialog ? dialog.querySelector(".lightbox-caption") : null;
  const source = dialog ? dialog.querySelector(".lightbox-source") : null;
  let active = [];
  let index = 0;

  function openers() {
    return Array.from(document.querySelectorAll(".ig-open, .banner-open")).filter(function (button) {
      const figure = button.closest("figure");
      return !figure || !figure.hidden;
    });
  }

  function show(i) {
    active = openers();
    if (!active.length || !dialog || !shot) return;
    index = (i + active.length) % active.length;
    const button = active[index];
    const max = Number(button.getAttribute("data-w")) || 640;
    shot.src = button.getAttribute("data-full");
    shot.alt = button.getAttribute("data-alt") || "";
    shot.removeAttribute("width");
    shot.removeAttribute("height");
    shot.style.maxWidth = max + "px";
    shot.style.width = "auto";
    shot.style.height = "auto";
    if (caption) caption.textContent = button.getAttribute("data-caption") || "";
    if (source) {
      const href = button.getAttribute("data-href") || "";
      source.href = href || "#";
      source.hidden = !href;
      source.textContent = button.getAttribute("data-label") || "Open the source";
    }
    if (!dialog.open) dialog.showModal();
  }

  document.querySelectorAll(".ig-open, .banner-open").forEach(function (button) {
    button.addEventListener("click", function () {
      active = openers();
      show(active.indexOf(button));
    });
  });

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      const control = event.target.closest("[data-lightbox]");
      if (!control) return;
      const action = control.getAttribute("data-lightbox");
      if (action === "close") dialog.close();
      if (action === "next") show(index + 1);
      if (action === "prev") show(index - 1);
    });
  }

  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    const key = group.getAttribute("data-filter-group");
    const buttons = group.querySelectorAll(".filter");
    const param = group.getAttribute("data-param") || "show";

    function apply(name, push) {
      group.querySelectorAll("[data-kind]").forEach(function (item) {
        const kind = item.getAttribute("data-kind");
        item.hidden = name !== "all" && kind !== name;
      });
      buttons.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-filter") === name ? "true" : "false");
      });
      const empty = group.querySelector(".filter-empty");
      if (empty) {
        const any = group.querySelector("[data-kind]:not([hidden])");
        empty.hidden = Boolean(any);
      }
      const url = new URL(window.location.href);
      if (name === "all") url.searchParams.delete(param);
      else url.searchParams.set(param, name);
      if (push) history.replaceState(null, "", url);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        apply(button.getAttribute("data-filter"), true);
      });
    });

    const initial = new URL(window.location.href).searchParams.get(param);
    const known = Array.from(buttons).some(function (button) {
      return button.getAttribute("data-filter") === initial;
    });
    apply(known ? initial : "all", false);
  });

  const form = document.getElementById("consult-form");
  if (form) {
    const status = document.getElementById("form-status");
    const fields = [
      { id: "name", test: function (value) { return value.trim().length >= 2; }, message: "Enter your name." },
      { id: "email", test: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }, message: "Enter a valid email." },
      { id: "phone", test: function (value) { return value.replace(/\D/g, "").length >= 10; }, message: "Enter a phone number with the area code." },
      { id: "project", test: function (value) { return value.trim() !== ""; }, message: "Choose a project type." }
    ];

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let first = null;
      fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        const error = document.getElementById(field.id + "-error");
        const ok = field.test(input.value);
        input.setAttribute("aria-invalid", ok ? "false" : "true");
        if (error) error.textContent = ok ? "" : field.message;
        if (!ok && !first) first = input;
      });
      if (first) {
        if (status) status.textContent = "";
        first.focus();
        return;
      }
      if (status) {
        status.textContent = "This preview does not send the form. Call (778) 589-9125 or email info@elegantbath.ca.";
      }
    });
  }

  if (header) header.dataset.ready = "true";
})();
