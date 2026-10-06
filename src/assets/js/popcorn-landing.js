/**
 * Landing page runtime: render from POPCORN_LANDING, 3D scroll terminal, feature expand.
 */
(function () {
    var DATA = window.POPCORN_LANDING;
    var SITE = window.POPCORN_SITE;
    if (!DATA) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function esc(s) {
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function sleep(ms) {
        return new Promise(function (r) {
            setTimeout(r, ms);
        });
    }

    function resolveHref(cta) {
        if (!cta) return "#";
        if (cta.href) return cta.href;
        if (cta.hrefKey && SITE && SITE.external) return SITE.external[cta.hrefKey] || "#";
        if (cta.page && SITE && SITE.pages) return (SITE.pathPrefix || "") + (SITE.pages[cta.page] || "#");
        return "#";
    }

    /* ---------- mount static content ---------- */
    function mountHero() {
        var h = DATA.hero;
        var root = document.getElementById("hero-mount");
        if (!root || !h) return;
        root.innerHTML =
            '<p class="hero-kicker">' +
            esc(h.kicker) +
            "</p>" +
            '<h1 id="hero-brand">' +
            '<span class="brand-name">' +
            esc(h.brand) +
            "</span>" +
            '<span class="brand-tag">' +
            esc(h.tag) +
            "</span>" +
            "</h1>" +
            '<p class="hero-line">' +
            esc(h.line) +
            "</p>" +
            '<div class="hero-cta">' +
            '<a class="btn btn--primary" href="' +
            esc(resolveHref(h.primaryCta)) +
            '" rel="noopener noreferrer" target="_blank">' +
            esc(h.primaryCta.label) +
            "</a>" +
            '<a class="btn btn--ghost" href="' +
            esc(resolveHref(h.secondaryCta)) +
            '">' +
            esc(h.secondaryCta.label) +
            "</a>" +
            "</div>";
    }

    function mountStats() {
        var row = document.getElementById("stat-row");
        if (!row || !DATA.stats) return;
        row.innerHTML = DATA.stats
            .map(function (s) {
                return (
                    "<li><strong>" +
                    esc(s.value) +
                    "</strong><span>" +
                    esc(s.label) +
                    "</span></li>"
                );
            })
            .join("");
    }

    function mountCurrent() {
        var block = DATA.current;
        var head = document.getElementById("features-heading");
        var sub = document.getElementById("features-sub");
        var grid = document.getElementById("feature-grid");
        if (!block || !grid) return;
        if (head) head.textContent = block.title;
        if (sub) sub.textContent = block.subtitle;
        grid.innerHTML = block.items
            .map(function (item, i) {
                return (
                    '<li class="feature-card" style="--i:' +
                    i +
                    '" tabindex="0">' +
                    "<h3>" +
                    esc(item.title) +
                    "</h3>" +
                    '<p class="feature-blurb">' +
                    esc(item.blurb) +
                    "</p>" +
                    '<p class="feature-more">' +
                    esc(item.more) +
                    "</p>" +
                    "</li>"
                );
            })
            .join("");
    }

    /* ---------- terminal typing ---------- */
    function lineCmd(text, typing) {
        return (
            '<span class="t-prompt">popcorn&gt;</span> <span class="t-cmd">' +
            esc(text || "") +
            "</span>" +
            (typing ? '<span class="t-cursor"></span>' : "") +
            "\n"
        );
    }

    function lineOut(text, typing) {
        return (
            '<span class="t-out">' +
            esc(text || "") +
            "</span>" +
            (typing ? '<span class="t-cursor"></span>' : "") +
            "\n"
        );
    }

    var focusEl = document.getElementById("term-focus-body");
    var focusToken = 0;
    var focusPlayed = false;
    var statsEl = document.getElementById("stat-row");

    async function runFocus() {
        if (!focusEl || !DATA.focusSeq) return;
        var my = ++focusToken;
        var html = "";
        focusEl.innerHTML = "";
        var seq = DATA.focusSeq;
        for (var i = 0; i < seq.length; i++) {
            if (my !== focusToken) return;
            var step = seq[i];
            if (step.kind === "cmd") {
                if (step.text === "") {
                    html += lineCmd("", true).replace("\n", "");
                    focusEl.innerHTML = html;
                    break;
                }
                if (!reduced) {
                    for (var n = 1; n <= step.text.length; n++) {
                        if (my !== focusToken) return;
                        focusEl.innerHTML = html + lineCmd(step.text.slice(0, n), true).replace(/\n$/, "");
                        await sleep(36);
                    }
                }
                html += lineCmd(step.text, false);
                focusEl.innerHTML = html;
                await sleep(reduced ? 0 : 260);
            } else {
                if (!reduced) {
                    for (var c = 1; c <= step.text.length; c++) {
                        if (my !== focusToken) return;
                        focusEl.innerHTML = html + lineOut(step.text.slice(0, c), true).replace(/\n$/, "");
                        await sleep(11);
                    }
                }
                html += lineOut(step.text, false);
                focusEl.innerHTML = html;
                await sleep(reduced ? 0 : 140);
            }
        }
        if (my === focusToken && statsEl) statsEl.classList.add("stat-row--in");
    }

    /* ---------- Hero ambient boot lines (pre-scroll) ---------- */
    var bootEl = document.getElementById("hero-boot");
    var bootLines = [
        "uefi: BOOTX64.EFI",
        "gop: framebuffer ready",
        "rust: driver network online",
        "irq: pic + pit claimed",
        "mem: pmm / vmm up",
        "shell: waiting…",
    ];
    var bootToken = 0;

    async function runHeroBoot() {
        if (!bootEl) return;
        if (reduced) {
            bootEl.textContent = bootLines.join("\n");
            return;
        }
        var my = ++bootToken;
        while (my === bootToken) {
            var shown = [];
            for (var i = 0; i < bootLines.length; i++) {
                if (my !== bootToken) return;
                var line = bootLines[i];
                for (var n = 1; n <= line.length; n++) {
                    if (my !== bootToken) return;
                    bootEl.textContent = shown.concat([line.slice(0, n)]).join("\n");
                    await sleep(18);
                }
                shown.push(line);
                bootEl.textContent = shown.join("\n");
                await sleep(420);
            }
            await sleep(1600);
            for (var fade = shown.length; fade >= 0; fade--) {
                if (my !== bootToken) return;
                bootEl.textContent = shown.slice(0, fade).join("\n");
                await sleep(90);
            }
            await sleep(700);
        }
    }

    /* ---------- Product scroll: approach, then snap at ~75% ---------- */
    var stage = document.getElementById("stage");
    var product = document.getElementById("term-product");
    var stageSticky = document.querySelector(".stage-sticky");
    var SNAP_AT = 0.75;
    var UNSNAP_AT = 0.58;
    var snapped = false;
    var settled = false; /* after snap finishes, stay put (no scrollback jitter) */
    var snapAnim = null;
    var FINAL_TRANSFORM =
        "translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1.12)";

    function clamp01(n) {
        return Math.min(1, Math.max(0, n));
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function poseAt(a) {
        var rotateX = 68 * (1 - a);
        var rotateY = -22 * (1 - a);
        var rotateZ = 5 * (1 - a);
        var scale = 0.34 + 0.72 * a;
        var translateZ = -680 * (1 - a);
        var translateY = 56 * (1 - a);
        var opacity = 0.45 + 0.45 * a;
        return {
            transform:
                "translate3d(0," +
                translateY.toFixed(1) +
                "px," +
                translateZ.toFixed(1) +
                "px) rotateX(" +
                rotateX.toFixed(2) +
                "deg) rotateY(" +
                rotateY.toFixed(2) +
                "deg) rotateZ(" +
                rotateZ.toFixed(2) +
                "deg) scale(" +
                scale.toFixed(3) +
                ")",
            opacity: opacity,
            glow: 0.15 + 0.4 * a,
            p: a,
        };
    }

    function applyPose(pose) {
        product.style.setProperty("--p", pose.p.toFixed(4));
        product.style.transform = pose.transform;
        product.style.opacity = String(pose.opacity);
        if (stageSticky) stageSticky.style.setProperty("--glow", pose.glow.toFixed(3));
    }

    function clearSnapAnim() {
        if (!snapAnim) return;
        try {
            if (typeof snapAnim.commitStyles === "function") snapAnim.commitStyles();
            snapAnim.cancel();
        } catch (err) {}
        snapAnim = null;
    }

    function holdFinalPose() {
        clearSnapAnim();
        product.classList.add("is-snapped");
        product.style.transform = FINAL_TRANSFORM;
        product.style.opacity = "1";
        product.style.setProperty("--p", "1");
        if (stageSticky) stageSticky.style.setProperty("--glow", "0.7");
    }

    function startTerminalAfterSnap() {
        if (focusPlayed) return;
        focusPlayed = true;
        runFocus();
    }

    function lockSnap() {
        if (snapped || settled || !product) return;
        snapped = true;

        if (reduced) {
            holdFinalPose();
            settled = true;
            startTerminalAfterSnap();
            return;
        }

        var fromTransform = product.style.transform || poseAt(0.82).transform;
        var fromOpacity = parseFloat(product.style.opacity || "0.9");
        clearSnapAnim();

        product.classList.add("is-snapped");
        product.style.setProperty("--p", "1");
        if (stageSticky) stageSticky.style.setProperty("--glow", "0.7");

        if (typeof product.animate === "function") {
            snapAnim = product.animate(
                [
                    { transform: fromTransform, opacity: fromOpacity },
                    { transform: FINAL_TRANSFORM, opacity: 1 },
                ],
                {
                    duration: 680,
                    easing: "cubic-bezier(0.14, 1.15, 0.24, 1)",
                    fill: "forwards",
                }
            );
            snapAnim.onfinish = function () {
                holdFinalPose();
                settled = true;
                startTerminalAfterSnap();
            };
        } else {
            product.style.transition =
                "transform 0.68s cubic-bezier(0.14, 1.15, 0.24, 1), opacity 0.35s ease";
            requestAnimationFrame(function () {
                product.style.transform = FINAL_TRANSFORM;
                product.style.opacity = "1";
            });
            setTimeout(function () {
                product.style.transition = "";
                holdFinalPose();
                settled = true;
                startTerminalAfterSnap();
            }, 700);
        }
    }

    function unlockSnap() {
        /* Only reverse if snap has not finished yet */
        if (!snapped || settled || !product) return;
        snapped = false;
        product.classList.remove("is-snapped");
        clearSnapAnim();
        product.style.transition = "";
    }

    function onScroll() {
        if (!stage || !product) return;
        if (settled) return;

        var rect = stage.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        var stageH = stage.offsetHeight || 1;
        var raw = (-rect.top) / Math.max(1, stageH - vh);
        var p = clamp01(raw);

        if (reduced) {
            lockSnap();
            return;
        }

        if (p >= SNAP_AT) {
            lockSnap();
            return;
        }

        if (p < UNSNAP_AT) {
            unlockSnap();
        }

        if (snapped) return;

        var e = easeOutCubic(clamp01(p / SNAP_AT)) * 0.82;
        applyPose(poseAt(e));
    }

    /* feature cards: hover/focus expand via CSS; ensure keyboard toggle on click for touch */
    function bindCards() {
        var grid = document.getElementById("feature-grid");
        if (!grid) return;
        grid.addEventListener("click", function (ev) {
            var card = ev.target.closest(".feature-card");
            if (!card) return;
            var open = card.classList.contains("is-open");
            grid.querySelectorAll(".feature-card.is-open").forEach(function (c) {
                c.classList.remove("is-open");
            });
            if (!open) card.classList.add("is-open");
        });
    }

    function revealCards() {
        var cards = document.querySelectorAll(".feature-card");
        if (!("IntersectionObserver" in window)) {
            cards.forEach(function (el) {
                el.classList.add("is-in");
            });
            return;
        }
        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) e.target.classList.add("is-in");
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        cards.forEach(function (el) {
            io.observe(el);
        });
    }

    mountHero();
    mountStats();
    mountCurrent();
    bindCards();
    revealCards();
    runHeroBoot();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
})();
