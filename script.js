const CLASSES = {
  knight: { vit: 15, end: 12, str: 14 },
  warrior: { vit: 12, end: 10, str: 18 },
  pyro: { vit: 10, end: 14, str: 8 },
  hollow: { vit: 8, end: 8, str: 8 },
};

const stats = {
  vit: 10,
  end: 10,
  str: 10,
};

const tooltip = document.getElementById("classTooltip");
const tooltipName = document.getElementById("className");
const tooltipDesc = document.getElementById("classDesc");

let lockedClass = null;
let lockedGift = null;

const giftDesc = document.getElementById("giftDesc");

document.querySelectorAll(".classes button").forEach((btn) => {
  const key = btn.dataset.class;

  btn.addEventListener("mouseenter", () => {
    if (lockedClass) return;

    const lore = CLASS_LORE[key];
    if (!lore) return;

    tooltipName.textContent = lore.name;
    tooltipDesc.textContent = lore.desc;
    tooltip.classList.add("show");
  });

  btn.addEventListener("mouseleave", () => {
    if (lockedClass) return;
    tooltip.classList.remove("show");
  });
});

const calc = () => {
  const hp = stats.vit * 30 + 200;
  const stamina = stats.end * 2 + 80;
  const level = stats.vit + stats.end + stats.str;

  document.getElementById("hp").textContent = hp;
  document.getElementById("stamina").textContent = stamina;
  document.getElementById("level").textContent = level;
};

document.querySelectorAll("input[type=range]").forEach((slider) => {
  slider.addEventListener("input", (e) => {
    const key = e.target.dataset.stat;
    stats[key] = +e.target.value;
    document.getElementById(key).textContent = stats[key];
    calc();
  });
});

function applyClass(name) {
  const preset = CLASSES[name];
  if (!preset) return;

  Object.keys(preset).forEach((stat) => {
    stats[stat] = preset[stat];
    document.querySelector(`input[data-stat="${stat}"]`).value = preset[stat];
    document.getElementById(stat).textContent = preset[stat];
  });

  document
    .querySelectorAll(".classes button")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.class === name)
    );

  calc();
}

function checkReady() {
  const btn = document.getElementById("beginBtn");
  if (lockedClass && lockedGift) {
    btn.disabled = false;
    btn.classList.add("enabled");
  } else {
    btn.disabled = true;
    btn.classList.remove("enabled");
  }
}

document.querySelectorAll(".classes button").forEach((btn) => {
  btn.addEventListener("click", () => {
    lockedClass = btn.dataset.class;

    applyClass(lockedClass);

    const equipmentList = document.getElementById("equipmentList");
    equipmentList.innerHTML = "";

    (CLASS_EQUIPMENT[lockedClass] || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      equipmentList.appendChild(li);
    });

    const panel = document.getElementById("equipmentPanel");
    panel.classList.remove("inactive");
    panel.classList.add("active");

    const giftPanel = document.getElementById("giftPanel");
    giftPanel.classList.remove("inactive");

    const lore = CLASS_LORE[lockedClass];
    tooltipName.textContent = lore.name;
    tooltipDesc.textContent = lore.desc;

    tooltip.classList.add("show", "locked");

    // Reset gift selection when picking a class
    lockedGift = null;
    document.querySelectorAll(".gifts button").forEach((b) => {
      b.classList.remove("active");
      b.classList.remove("locked");
    });
    document.getElementById("giftPanel").classList.remove("locked");
    giftDesc.textContent = "—";
    checkReady();

    document.getElementById("classHint").textContent =
      "Fate chosen. Stats may still be altered.";
  });
});

// Register gift button listeners once (avoid re-attaching on every class selection)
document.querySelectorAll(".gifts button").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (lockedGift) return;

    lockedGift = btn.dataset.gift;

    document.querySelectorAll(".gifts button").forEach((b) => {
      b.classList.remove("active");
      b.classList.add("locked");
    });

    btn.classList.add("active");
    btn.classList.remove("locked");

    giftDesc.textContent = GIFTS[lockedGift].desc;

    document.getElementById("giftPanel").classList.add("locked");
    checkReady();
  });
});

document.getElementById("beginBtn").addEventListener("click", () => {
  const build = {
    class: lockedClass,
    gift: lockedGift,
    stats,
    timestamp: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(build));

  const overlay = document.getElementById("fadeOverlay");
  overlay.classList.add("show");
});

const CLASS_LORE = {
  knight: {
    name: "Knight",
    desc: "A disciplined warrior sworn to forgotten oaths. Balanced in strength and endurance.",
  },
  warrior: {
    name: "Warrior",
    desc: "A fierce combatant hardened by endless battle. Strength above all else.",
  },
  pyro: {
    name: "Pyromancer",
    desc: "A wanderer who manipulates flame through sheer will. Agile, yet fragile.",
  },
  hollow: {
    name: "Hollow",
    desc: "An empty vessel. No past. No future. Only the curse remains.",
  },
};

const CLASS_EQUIPMENT = {
  knight: ["Longsword", "Knight Shield", "Worn Plate Armor"],
  warrior: ["Battle Axe", "Leather Armor", "Throwing Knives ×5"],
  pyro: ["Hand Axe", "Pyromancy Flame", "Tattered Robe"],
  hollow: ["Broken Straight Sword", "Ragged Garments"],
};

const GIFTS = {
  life: {
    name: "Life Ring",
    desc: "A faintly warm ring. Slightly increases vitality.",
  },
  coin: {
    name: "Old Coin",
    desc: "A rusted coin of unknown origin. May prove useful.",
  },
  seed: {
    name: "Fire Seed",
    desc: "A smoldering seed. Strengthens the bonfire.",
  },
  none: {
    name: "None",
    desc: "You begin your journey with nothing extra.",
  },
};

calc();

// Initialize tooltip display to match default lore
tooltipName.textContent = CLASS_LORE.knight.name;
tooltipDesc.textContent = CLASS_LORE.knight.desc;
// Persisted key used to mark that the journey was started
const STORAGE_KEY = "souls_ui_started";

// Ensure overlay is hidden on startup (don't show until `Begin` is clicked)
const overlay = document.getElementById("fadeOverlay");
if (overlay) {
  overlay.classList.remove("show");
}

(function restoreBuild() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const build = JSON.parse(saved);

    // Restore class
    if (build.class) {
      lockedClass = build.class;
      applyClass(lockedClass);

      const lore = CLASS_LORE[lockedClass];
      tooltipName.textContent = lore.name;
      tooltipDesc.textContent = lore.desc;
      tooltip.classList.add("show", "locked");

      document
        .querySelectorAll(".classes button")
        .forEach((btn) =>
          btn.classList.toggle("active", btn.dataset.class === lockedClass)
        );

      // Activate equipment + gift panels
      document.getElementById("equipmentPanel").classList.remove("inactive");
      document.getElementById("giftPanel").classList.remove("inactive");
    }

    // Restore stats
    if (build.stats) {
      Object.keys(build.stats).forEach((stat) => {
        stats[stat] = build.stats[stat];
        document.querySelector(`input[data-stat="${stat}"]`).value =
          build.stats[stat];
        document.getElementById(stat).textContent = build.stats[stat];
      });
      calc();
    }

    // Restore gift
    if (build.gift) {
      lockedGift = build.gift;

      document.querySelectorAll(".gifts button").forEach((btn) => {
        btn.classList.add("locked");
        btn.classList.toggle("active", btn.dataset.gift === lockedGift);
      });

      giftDesc.textContent = GIFTS[lockedGift].desc;
      document.getElementById("giftPanel").classList.add("locked");
    }

    checkReady();
  } catch (e) {
    console.warn("Failed to restore build:", e);
  }
})();

// Do not auto-clear storage or reload the page — leaving persisted build intact.
