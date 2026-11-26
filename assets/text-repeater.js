(() => {
  const MAX_REPEATS = 5000;
  const MAX_OUTPUT_CHARS = 1000000;
  const themes = ["midnight", "aurora", "rose", "gold"];
  const frames = [
    ["꧁༺ ", " ༻꧂"], ["『 ", " 』"], ["★彡 ", " 彡★"], ["✦ ", " ✦"],
    ["♛ ", " ♛"], ["༺ ", " ༻"], ["【 ", " 】"], ["ღ ", " ღ"],
    ["⫷ ", " ⫸"], ["◈ ", " ◈"], ["꧁ ", " ꧂"], ["⚡ ", " ⚡"],
  ];
  const suffixes = [
    ["", ""], [" ✨", ""], [" 👑", ""], [" • VIP", ""], [" ♛", ""], [" ★", ""],
    [" | Official", ""], [" ⚡", ""], [" ♡", ""], [" 💎", ""], [" ™", ""], [" 𓆩♡𓆪", ""],
  ];
  const fontStyles = [
    { name: "Bold", upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce },
    { name: "Italic", upper: 0x1d434, lower: 0x1d44e },
    { name: "Bold italic", upper: 0x1d468, lower: 0x1d482 },
    { name: "Script", upper: 0x1d49c, lower: 0x1d4b6 },
    { name: "Fraktur", upper: 0x1d504, lower: 0x1d51e },
    { name: "Double-struck", upper: 0x1d538, lower: 0x1d552 },
    { name: "Sans", upper: 0x1d5a0, lower: 0x1d5ba, digits: 0x1d7e2 },
    { name: "Sans bold", upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec },
    { name: "Monospace", upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6 },
    { name: "Full width", fullWidth: true },
    { name: "Circled", circled: true },
    { name: "Small caps", smallCaps: true },
  ];
  const STYLE_COUNT = fontStyles.length * frames.length * suffixes.length;

  function stylize(text, style) {
    return Array.from(text, (character) => {
      const code = character.codePointAt(0);
      if (style.fullWidth && code >= 0x21 && code <= 0x7e) {
        return String.fromCodePoint(code + 0xfee0);
      }
      if (style.circled && code >= 65 && code <= 90) {
        return String.fromCodePoint(0x24b6 + code - 65);
      }
      if (style.circled && code >= 97 && code <= 122) {
        return String.fromCodePoint(0x24d0 + code - 97);
      }
      if (style.smallCaps) {
        const small = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
        const index = character.toLowerCase().charCodeAt(0) - 97;
        if (index >= 0 && index < small.length) return small[index];
      }
      if (code >= 65 && code <= 90 && style.upper) {
        return String.fromCodePoint(style.upper + code - 65);
      }
      if (code >= 97 && code <= 122 && style.lower) {
        return String.fromCodePoint(style.lower + code - 97);
      }
      if (code >= 48 && code <= 57 && style.digits) {
        return String.fromCodePoint(style.digits + code - 48);
      }
      return character;
    }).join("");
  }

  function buildStyle(text, index) {
    const frameIndex = index % frames.length;
    const suffixIndex = Math.floor(index / frames.length) % suffixes.length;
    const fontIndex = Math.floor(index / (frames.length * suffixes.length)) % fontStyles.length;
    const frame = frames[frameIndex];
    const suffix = suffixes[suffixIndex];
    const styled = stylize(text, fontStyles[fontIndex]);
    return {
      text: `${frame[0]}${styled}${suffix[0]}${frame[1]}${suffix[1]}`,
      name: `${fontStyles[fontIndex].name} · Style ${index + 1}`,
    };
  }

  function transformText(text, action) {
    switch (action) {
      case "upper": return text.toLocaleUpperCase();
      case "lower": return text.toLocaleLowerCase();
      case "title": return text.toLocaleLowerCase().replace(/(^|[\s-])\p{L}/gu, (part) => part.toLocaleUpperCase());
      case "reverse": return Array.from(text).reverse().join("");
      case "alternate": return Array.from(text, (char, index) =>
        index % 2 ? char.toLocaleLowerCase() : char.toLocaleUpperCase()).join("");
      case "trim": return text.replace(/[ \t]+/g, " ").trim();
      case "unique": return [...new Set(text.split(/\r?\n/))].join("\n");
      case "sort": return text.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join("\n");
      default: return text;
    }
  }

  function mount() {
    if (document.getElementById("vps-repeater-launcher")) return;

    const launcher = document.createElement("button");
    launcher.id = "vps-repeater-launcher";
    launcher.type = "button";
    launcher.className = "vps-repeater-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "vps-repeater-panel");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> VIP Tools';

    const panel = document.createElement("section");
    panel.id = "vps-repeater-panel";
    panel.className = "vps-repeater-panel";
    panel.dataset.theme = "midnight";
    panel.setAttribute("aria-label", "VIP Profile Studio tools");
    panel.hidden = true;
    panel.innerHTML = `
      <header class="vps-repeater-header">
        <div>
          <span class="vps-repeater-eyebrow">VIP PROFILE STUDIO</span>
          <h2>Premium Toolbox</h2>
          <p>Creative profile tools, all in one place.</p>
        </div>
        <div class="vps-repeater-head-actions">
          <select data-field="theme" aria-label="Choose toolbox color theme">
            <option value="midnight">Midnight</option>
            <option value="aurora">Aurora</option>
            <option value="rose">Rose</option>
            <option value="gold">Gold</option>
          </select>
          <button class="vps-repeater-close" type="button" aria-label="Close VIP tools">×</button>
        </div>
      </header>
      <div class="vps-repeater-badge">✧ ${STYLE_COUNT.toLocaleString()}+ name style combinations</div>
      <nav class="vps-repeater-tabs" aria-label="Tool categories">
        <button type="button" data-tab="repeat" aria-selected="true">Repeat</button>
        <button type="button" data-tab="styles" aria-selected="false">Name styles</button>
        <button type="button" data-tab="textlab" aria-selected="false">Text lab</button>
        <button type="button" data-tab="bio" aria-selected="false">Bio builder</button>
      </nav>

      <section class="vps-repeater-view" data-view="repeat">
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
        </div>
        <div class="vps-repeater-output-wrap">
          <div class="vps-repeater-output-heading">
            <span>Live preview</span>
            <span data-field="status" aria-live="polite">0 repeats · 0 characters</span>
          </div>
          <textarea data-field="output" rows="6" readonly aria-label="Repeated text preview" placeholder="Your repeated text will appear here…"></textarea>
        </div>
        <div class="vps-repeater-actions">
          <button type="button" class="vps-repeater-copy" data-action="copy-repeat">Copy text</button>
          <button type="button" data-action="download-repeat">Download .txt</button>
        </div>
      </section>

      <section class="vps-repeater-view" data-view="styles" hidden>
        <label class="vps-repeater-field">
          <span>Name or text to style</span>
          <input data-field="style-input" maxlength="120" placeholder="Enter your name">
        </label>
        <div class="vps-style-card">
          <span class="vps-repeater-eyebrow" data-field="style-name">STYLE 1</span>
          <output data-field="style-output" aria-live="polite">Your name style appears here</output>
        </div>
        <div class="vps-style-navigation">
          <button type="button" data-style-step="-1" aria-label="Previous style">← Previous</button>
          <span data-field="style-count">1 / ${STYLE_COUNT.toLocaleString()}</span>
          <button type="button" data-style-step="1">Next →</button>
        </div>
        <div class="vps-repeater-actions">
          <button type="button" data-action="random-style">Surprise me</button>
          <button type="button" class="vps-repeater-copy" data-action="copy-style">Copy style</button>
        </div>
        <p class="vps-repeater-hint">Unicode font, frame, and symbol combinations work in most profile fields.</p>
      </section>

      <section class="vps-repeater-view" data-view="textlab" hidden>
        <label class="vps-repeater-field">
          <span>Text to edit</span>
          <textarea data-field="lab-input" rows="3" maxlength="5000" placeholder="Paste text or multiple lines…"></textarea>
        </label>
        <div class="vps-tool-grid" aria-label="Text tools">
          <button type="button" data-transform="upper">UPPERCASE</button>
          <button type="button" data-transform="lower">lowercase</button>
          <button type="button" data-transform="title">Title Case</button>
          <button type="button" data-transform="alternate">aLtErNaTe</button>
          <button type="button" data-transform="reverse">Reverse</button>
          <button type="button" data-transform="trim">Clean spaces</button>
          <button type="button" data-transform="unique">Remove duplicates</button>
          <button type="button" data-transform="sort">Sort lines</button>
        </div>
        <div class="vps-repeater-output-wrap">
          <div class="vps-repeater-output-heading">
            <span>Result</span>
            <span data-field="lab-status" aria-live="polite">0 characters</span>
          </div>
          <textarea data-field="lab-output" rows="5" readonly placeholder="Choose a text tool to see the result…"></textarea>
        </div>
        <div class="vps-repeater-actions">
          <button type="button" data-action="copy-lab" class="vps-repeater-copy">Copy result</button>
          <button type="button" data-action="download-lab">Download .txt</button>
        </div>
      </section>

      <section class="vps-repeater-view" data-view="bio" hidden>
        <label class="vps-repeater-field">
          <span>Display name</span>
          <input data-field="bio-name" maxlength="80" placeholder="Your name">
        </label>
        <label class="vps-repeater-field">
          <span>Tagline</span>
          <textarea data-field="bio-tagline" rows="2" maxlength="180" placeholder="A short line that describes you"></textarea>
        </label>
        <label class="vps-repeater-field">
          <span>Bio design</span>
          <select data-field="bio-design">
            <option value="royal">Royal</option>
            <option value="minimal">Minimal</option>
            <option value="cyber">Cyber</option>
            <option value="elegant">Elegant</option>
          </select>
        </label>
        <div class="vps-repeater-output-wrap">
          <div class="vps-repeater-output-heading">
            <span>Profile bio preview</span>
            <span data-field="bio-status" aria-live="polite">0 characters</span>
          </div>
          <textarea data-field="bio-output" rows="5" readonly placeholder="Your profile bio will appear here…"></textarea>
        </div>
        <div class="vps-repeater-actions">
          <button type="button" data-action="copy-bio" class="vps-repeater-copy">Copy bio</button>
          <button type="button" data-action="download-bio">Download .txt</button>
        </div>
      </section>
      <p class="vps-repeater-message" data-field="message" aria-live="polite"></p>
    `;

    document.body.append(launcher, panel);

    const query = (selector) => panel.querySelector(selector);
    const message = query('[data-field="message"]');
    let repeatResult = "";
    let styleIndex = 0;
    let styleResult = "";
    let labResult = "";
    let bioResult = "";

    function updateRepeat() {
      const input = query('[data-field="text"]');
      const countInput = query('[data-field="count"]');
      const count = Math.min(MAX_REPEATS, Math.max(1, Number.parseInt(countInput.value, 10) || 1));
      const text = input.value;
      const separatorValue = query('[data-field="separator"]').value;
      const separator = separatorValue === "space" ? " " : separatorValue === "dot" ? " · " : "\n";
      const size = text ? text.length * count + separator.length * (count - 1) : 0;
      if (countInput.value !== "" && Number(countInput.value) > MAX_REPEATS) countInput.value = String(MAX_REPEATS);
      const output = query('[data-field="output"]');
      const status = query('[data-field="status"]');
      if (size > MAX_OUTPUT_CHARS) {
        repeatResult = "";
        output.value = "";
        status.textContent = `${count.toLocaleString()} repeats · output limit reached`;
        message.textContent = "Result is too large to preview. Shorten the text or lower the repeat count.";
        return;
      }
      repeatResult = text ? Array(count).fill(text).join(separator) : "";
      output.value = repeatResult;
      status.textContent = `${count.toLocaleString()} repeats · ${repeatResult.length.toLocaleString()} characters`;
      message.textContent = "";
    }

    function updateStyle() {
      const text = query('[data-field="style-input"]').value.trim();
      const result = text ? buildStyle(text, styleIndex) : { text: "Your name style appears here", name: `Style ${styleIndex + 1}` };
      styleResult = text ? result.text : "";
      query('[data-field="style-output"]').textContent = result.text;
      query('[data-field="style-name"]').textContent = result.name.toUpperCase();
      query('[data-field="style-count"]').textContent = `${styleIndex + 1} / ${STYLE_COUNT.toLocaleString()}`;
    }

    function updateLab(action) {
      labResult = transformText(query('[data-field="lab-input"]').value, action);
      query('[data-field="lab-output"]').value = labResult;
      query('[data-field="lab-status"]').textContent = `${labResult.length.toLocaleString()} characters`;
    }

    function updateBio() {
      const name = query('[data-field="bio-name"]').value.trim();
      const tagline = query('[data-field="bio-tagline"]').value.trim();
      const design = query('[data-field="bio-design"]').value;
      const layouts = {
        royal: `꧁༺ ${name || "Your Name"} ༻꧂\n♛ ${tagline || "Write your tagline here"} ♛`,
        minimal: `${name || "Your Name"}\n${tagline || "Write your tagline here"}`,
        cyber: `⫷ ${name || "Your Name"} ⫸\n// ${tagline || "Write your tagline here"}_`,
        elegant: `✦ 𝒪𝒻𝒻𝒾𝒸𝒾𝒶𝓁 𝓅𝓇𝑜𝒻𝒾𝓁𝑒 ✦\n${name || "Your Name"} · ${tagline || "Write your tagline here"}`,
      };
      bioResult = layouts[design];
      query('[data-field="bio-output"]').value = bioResult;
      query('[data-field="bio-status"]').textContent = `${bioResult.length.toLocaleString()} characters`;
    }

    async function copy(value) {
      if (!value) {
        message.textContent = "Add some text before copying.";
        return;
      }
      try {
        await navigator.clipboard.writeText(value);
        message.textContent = "Copied to clipboard.";
      } catch {
        const activeView = panel.querySelector('[data-view]:not([hidden])');
        const output = activeView.querySelector("textarea[readonly]");
        if (output) {
          output.focus();
          output.select();
          message.textContent = document.execCommand("copy")
            ? "Copied to clipboard."
            : "Copy failed. Select the result and copy it manually.";
        } else {
          message.textContent = "Copy failed. Please try again in a secure browser context.";
        }
      }
    }

    function download(value, filename) {
      if (!value) {
        message.textContent = "Add some text before downloading.";
        return;
      }
      const file = new Blob([value], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function setOpen(open) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      if (open) panel.querySelector('[data-view]:not([hidden])').querySelector("input, textarea")?.focus();
    }

    launcher.addEventListener("click", () => setOpen(panel.hidden));
    query(".vps-repeater-close").addEventListener("click", () => {
      setOpen(false);
      launcher.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) {
        setOpen(false);
        launcher.focus();
      }
    });
    query('[data-field="theme"]').addEventListener("change", (event) => {
      if (themes.includes(event.target.value)) panel.dataset.theme = event.target.value;
    });
    panel.querySelectorAll("[data-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        panel.querySelectorAll("[data-tab]").forEach((button) => {
          button.setAttribute("aria-selected", String(button === tab));
        });
        panel.querySelectorAll("[data-view]").forEach((view) => {
          view.hidden = view.dataset.view !== tab.dataset.tab;
        });
        message.textContent = "";
      });
    });

    query('[data-field="text"]').addEventListener("input", updateRepeat);
    query('[data-field="count"]').addEventListener("input", updateRepeat);
    query('[data-field="count"]').addEventListener("change", (event) => {
      event.target.value = String(Math.min(MAX_REPEATS, Math.max(1, Number.parseInt(event.target.value, 10) || 1)));
      updateRepeat();
    });
    query('[data-field="separator"]').addEventListener("change", updateRepeat);
    panel.querySelectorAll("[data-count]").forEach((button) => {
      button.addEventListener("click", () => {
        query('[data-field="count"]').value = button.dataset.count;
        updateRepeat();
      });
    });
    query('[data-field="style-input"]').addEventListener("input", updateStyle);
    panel.querySelectorAll("[data-style-step]").forEach((button) => {
      button.addEventListener("click", () => {
        styleIndex = (styleIndex + Number(button.dataset.styleStep) + STYLE_COUNT) % STYLE_COUNT;
        updateStyle();
      });
    });
    query('[data-action="random-style"]').addEventListener("click", () => {
      styleIndex = Math.floor(Math.random() * STYLE_COUNT);
      updateStyle();
    });
    panel.querySelectorAll("[data-transform]").forEach((button) => {
      button.addEventListener("click", () => updateLab(button.dataset.transform));
    });
    query('[data-field="lab-input"]').addEventListener("input", () => updateLab("trim"));
    ["bio-name", "bio-tagline"].forEach((field) => query(`[data-field="${field}"]`).addEventListener("input", updateBio));
    query('[data-field="bio-design"]').addEventListener("change", updateBio);

    panel.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => {
        message.textContent = "";
        switch (button.dataset.action) {
          case "copy-repeat": copy(repeatResult); break;
          case "download-repeat": download(repeatResult, "repeated-text.txt"); break;
          case "copy-style": copy(styleResult); break;
          case "copy-lab": copy(labResult); break;
          case "download-lab": download(labResult, "text-lab-result.txt"); break;
          case "copy-bio": copy(bioResult); break;
          case "download-bio": download(bioResult, "profile-bio.txt"); break;
          default: break;
        }
      });
    });

    updateRepeat();
    updateStyle();
    updateBio();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
