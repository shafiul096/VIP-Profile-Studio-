(() => {
  const MAX_REPEATS = 5000;
  const MAX_OUTPUT_CHARS = 1000000;
  const themes = ["midnight", "aurora", "rose", "gold"];

  function mount() {
    if (document.getElementById("vps-repeater-launcher")) return;

    const launcher = document.createElement("button");
    launcher.id = "vps-repeater-launcher";
    launcher.type = "button";
    launcher.className = "vps-repeater-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "vps-repeater-panel");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> Text Repeater';

    const panel = document.createElement("section");
    panel.id = "vps-repeater-panel";
    panel.className = "vps-repeater-panel";
    panel.dataset.theme = "midnight";
    panel.setAttribute("aria-label", "Text repeater");
    panel.hidden = true;
    panel.innerHTML = `
      <header class="vps-repeater-header">
        <div>
          <span class="vps-repeater-eyebrow">PROFILE STUDIO TOOL</span>
          <h2>Text Repeater</h2>
          <p>Make a clean, ready-to-copy vertical text block.</p>
        </div>
        <button class="vps-repeater-close" type="button" aria-label="Close text repeater">×</button>
      </header>
      <div class="vps-repeater-controls">
        <label class="vps-repeater-field">
          <span>Your text</span>
          <textarea data-field="text" rows="2" maxlength="1000" placeholder="Type your name or any text…" spellcheck="false"></textarea>
        </label>
        <div class="vps-repeater-row">
          <label class="vps-repeater-field vps-repeater-count">
            <span>Repeat count <small>(1–5,000)</small></span>
            <input data-field="count" type="number" min="1" max="${MAX_REPEATS}" step="1" value="100" inputmode="numeric">
          </label>
          <label class="vps-repeater-field vps-repeater-separator">
            <span>Between each repeat</span>
            <select data-field="separator">
              <option value="newline">New line</option>
              <option value="space">Space</option>
              <option value="dot">Middle dot</option>
            </select>
          </label>
        </div>
        <div class="vps-repeater-presets" aria-label="Quick repeat counts">
          <button type="button" data-count="100">100</button>
          <button type="button" data-count="200">200</button>
          <button type="button" data-count="500">500</button>
          <button type="button" data-count="1000">1,000</button>
          <span>quick counts</span>
        </div>
        <label class="vps-repeater-field">
          <span>Style</span>
          <select data-field="theme">
            <option value="midnight">Midnight glass</option>
            <option value="aurora">Aurora</option>
            <option value="rose">Rose glow</option>
            <option value="gold">Royal gold</option>
          </select>
        </label>
      </div>
      <div class="vps-repeater-output-wrap">
        <div class="vps-repeater-output-heading">
          <span>Live preview</span>
          <span data-field="status" aria-live="polite">0 lines · 0 characters</span>
        </div>
        <textarea data-field="output" rows="7" readonly aria-label="Repeated text preview" placeholder="Your repeated text will appear here…"></textarea>
      </div>
      <p class="vps-repeater-message" data-field="message" aria-live="polite"></p>
      <footer class="vps-repeater-actions">
        <button type="button" class="vps-repeater-copy" data-action="copy">Copy text</button>
        <button type="button" class="vps-repeater-download" data-action="download">Download .txt</button>
      </footer>
    `;

    document.body.append(launcher, panel);

    const textInput = panel.querySelector('[data-field="text"]');
    const countInput = panel.querySelector('[data-field="count"]');
    const separatorInput = panel.querySelector('[data-field="separator"]');
    const themeInput = panel.querySelector('[data-field="theme"]');
    const output = panel.querySelector('[data-field="output"]');
    const status = panel.querySelector('[data-field="status"]');
    const message = panel.querySelector('[data-field="message"]');
    const copyButton = panel.querySelector('[data-action="copy"]');
    const downloadButton = panel.querySelector('[data-action="download"]');
    const closeButton = panel.querySelector(".vps-repeater-close");
    let generatedText = "";

    function update() {
      const count = Math.min(MAX_REPEATS, Math.max(1, Number.parseInt(countInput.value, 10) || 1));
      const text = textInput.value;
      const separator = separatorInput.value === "space"
        ? " "
        : separatorInput.value === "dot"
          ? " · "
          : "\n";
      const size = text ? text.length * count + separator.length * (count - 1) : 0;

      if (countInput.value !== "" && Number(countInput.value) > MAX_REPEATS) {
        countInput.value = String(MAX_REPEATS);
      }

      if (size > MAX_OUTPUT_CHARS) {
        generatedText = "";
        output.value = "";
        status.textContent = `${count.toLocaleString()} repeats · output limit reached`;
        message.textContent = "This result is too large to preview. Shorten the text or lower the repeat count.";
        copyButton.disabled = true;
        downloadButton.disabled = true;
        return;
      }

      generatedText = text ? Array(count).fill(text).join(separator) : "";
      output.value = generatedText;
      status.textContent = `${count.toLocaleString()} repeats · ${generatedText.length.toLocaleString()} characters`;
      message.textContent = "";
      copyButton.disabled = !generatedText;
      downloadButton.disabled = !generatedText;
    }

    function setOpen(open) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) textInput.focus();
    }

    launcher.addEventListener("click", () => setOpen(panel.hidden));
    closeButton.addEventListener("click", () => {
      setOpen(false);
      launcher.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        setOpen(false);
        launcher.focus();
      }
    });
    textInput.addEventListener("input", update);
    countInput.addEventListener("input", update);
    countInput.addEventListener("change", () => {
      countInput.value = String(Math.min(MAX_REPEATS, Math.max(1, Number.parseInt(countInput.value, 10) || 1)));
      update();
    });
    separatorInput.addEventListener("change", update);
    themeInput.addEventListener("change", () => {
      if (themes.includes(themeInput.value)) panel.dataset.theme = themeInput.value;
    });
    panel.querySelectorAll("[data-count]").forEach((button) => {
      button.addEventListener("click", () => {
        countInput.value = button.dataset.count;
        update();
      });
    });
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(generatedText);
        message.textContent = "Copied to clipboard.";
      } catch {
        output.focus();
        output.select();
        const copied = document.execCommand("copy");
        message.textContent = copied ? "Copied to clipboard." : "Copy failed. Select the preview and copy it manually.";
      }
    });
    downloadButton.addEventListener("click", () => {
      const file = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "repeated-text.txt";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
