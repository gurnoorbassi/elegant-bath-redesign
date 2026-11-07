import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, realpath, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const chromeBin = process.env.CHROME || "/usr/local/bin/google-chrome";
const pages = ["index.html", "about.html", "products.html", "portfolio.html", "design.html", "contact.html"];
const failures = [];

function fail(message) {
  failures.push(message);
  console.error("FAIL", message);
}

const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405).end("method");
      return;
    }
    const url = new URL(req.url, "http://127.0.0.1");
    let path = resolve(root, "." + decodeURIComponent(url.pathname));
    const rel = relative(root, path);
    if (rel.startsWith("..") || isAbsolute(rel)) {
      res.writeHead(403).end();
      return;
    }
    path = await realpath(path);
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;

const userData = await mkdtemp(join(tmpdir(), "eb-chrome-"));
const child = spawn(chromeBin, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--disable-background-networking", "--force-device-scale-factor=1", "--remote-debugging-port=0",
  `--user-data-dir=${userData}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
const port = await new Promise((resolvePort, reject) => {
  let logs = "";
  const timer = setTimeout(() => reject(new Error("Chrome did not open")), 12000);
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
    const match = logs.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
    if (match) {
      clearTimeout(timer);
      resolvePort(Number(match[1]));
    }
  });
});
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = targets.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolveOpen, reject) => {
  ws.addEventListener("open", resolveOpen);
  ws.addEventListener("error", () => reject(new Error("socket")));
});
let next = 0;
const pending = new Map();
const posts = [];
ws.addEventListener("message", (event) => {
  const data = JSON.parse(event.data);
  if (data.method === "Network.requestWillBeSent" && data.params.request.method === "POST") {
    posts.push(data.params.request.url);
  }
  if (data.id && pending.has(data.id)) {
    const { resolve: done, reject } = pending.get(data.id);
    pending.delete(data.id);
    if (data.error) reject(new Error(data.error.message));
    else done(data.result || {});
  }
});
const send = (method, params = {}) => new Promise((done, reject) => {
  const id = ++next;
  pending.set(id, { resolve: done, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
await send("Page.enable");
await send("Network.enable");
await send("Runtime.enable");

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "eval failed");
  return result.result?.value;
}

async function open(path, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  const loaded = new Promise((resolveLoaded) => {
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Page.loadEventFired") {
        ws.removeEventListener("message", onMessage);
        resolveLoaded();
      }
    };
    ws.addEventListener("message", onMessage);
  });
  await send("Page.navigate", { url: `${origin}/${path}` });
  await Promise.race([loaded, new Promise((resolveLoaded) => setTimeout(resolveLoaded, 8000))]);
  await evaluate(`(async () => {
    if (document.fonts) await document.fonts.ready;
    const images = [...document.images];
    for (const img of images) {
      if (img.loading === "lazy") img.loading = "eager";
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await Promise.all(images.map((img) => img.decode().catch(() => {})));
    window.scrollTo(0, 0);
  })()`);
}

for (const path of pages) {
  for (const width of [390, 1440]) {
    await open(path, width, width < 600 ? 844 : 900);
    const report = await evaluate(`(() => {
      const broken = [...document.images].filter((img) => img.getAttribute("src") && (!img.complete || img.naturalWidth < 1)).map((img) => img.currentSrc || img.getAttribute("src"));
      const upscaled = [...document.querySelectorAll(".ig-card img")].filter((img) => img.getBoundingClientRect().width > img.naturalWidth + 1).map((img) => img.currentSrc);
      return { title: document.title, h1: document.querySelectorAll("h1").length, broken, upscaled, scroll: document.documentElement.scrollWidth, inner: window.innerWidth, cta: !!document.querySelector(".hero .button") };
    })()`);
    if (report.h1 !== 1) fail(`${path} @${width} h1 ${report.h1}`);
    if (report.broken.length) fail(`${path} @${width} broken images ${report.broken.join(" ")}`);
    if (report.upscaled.length) fail(`${path} @${width} upscaled IG ${report.upscaled.join(" ")}`);
    if (report.scroll > report.inner + 1) fail(`${path} @${width} horizontal overflow ${report.scroll}>${report.inner}`);
    if (!report.cta) fail(`${path} @${width} hero CTA missing`);
  }
}

await open("index.html", 390, 844);
const menu = await evaluate(`(() => {
  const button = document.querySelector(".menu-toggle");
  button.focus();
  button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  button.click();
  const open = button.getAttribute("aria-expanded") === "true" && document.querySelector("#nav-panel").classList.contains("is-open");
  const link = document.querySelector("#nav-panel a");
  link.focus();
  const focused = document.activeElement === link;
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  const closed = button.getAttribute("aria-expanded") === "false";
  return { open, focused, closed, active: document.activeElement === button };
})()`);
if (!menu.open || !menu.focused || !menu.closed) fail(`menu keyboard ${JSON.stringify(menu)}`);

await open("portfolio.html", 390, 844);
const light = await evaluate(`(() => {
  document.querySelector('[data-filter="product"]').click();
  const visible = [...document.querySelectorAll(".ig-card")].filter((card) => !card.hidden).length;
  const button = [...document.querySelectorAll(".ig-open")].find((item) => !item.closest("figure").hidden);
  button.focus();
  button.click();
  const dialog = document.querySelector(".lightbox");
  const width = dialog.querySelector("img").getBoundingClientRect().width;
  return { visible, opened: dialog.open, width, cap: Number(button.getAttribute("data-w")) };
})()`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
const lightClosed = await evaluate(`!document.querySelector(".lightbox").open`);
if (light.visible !== 1) fail(`product filter showed ${light.visible}`);
if (!light.opened || light.width > light.cap + 1 || !lightClosed) fail(`lightbox ${JSON.stringify({ ...light, closed: lightClosed })}`);

await open("design.html", 390, 844);
const form = await evaluate(`(() => {
  const form = document.querySelector("#consult-form");
  form.requestSubmit();
  const error = document.querySelector("#name-error").textContent;
  const focused = document.activeElement.id;
  document.querySelector("#name").value = "Avery Chan";
  document.querySelector("#email").value = "avery@example.com";
  document.querySelector("#phone").value = "(778) 555-0199";
  document.querySelector("#project").value = "Bathroom renovation";
  form.requestSubmit();
  return { error, focused, status: document.querySelector("#form-status").textContent };
})()`);
if (!form.error || form.focused !== "name") fail(`empty form ${JSON.stringify(form)}`);
if (!form.status.includes("does not send a message")) fail(`valid form ${form.status}`);
if (posts.length) fail(`form sent ${posts.join(" ")}`);

await open("contact.html", 390, 844);
const contact = await evaluate(`({ tel: !!document.querySelector('a[href^="tel:"]'), address: document.body.innerText.includes("13260 78") })`);
if (!contact.tel || !contact.address) fail(`contact ${JSON.stringify(contact)}`);

child.kill("SIGKILL");
server.close();
await rm(userData, { recursive: true, force: true });
if (failures.length) {
  console.log(`RESULT FAIL ${failures.length}`);
  process.exit(1);
}
console.log("interact ok");
