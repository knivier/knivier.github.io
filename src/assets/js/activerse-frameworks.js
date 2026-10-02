/**
 * Activerse Frameworks: Origin | Frontier swipe switcher.
 */
(function () {
    var root = document.getElementById("framework-switch");
    var track = document.getElementById("framework-track");
    var viewport = document.getElementById("framework-viewport");
    var originPanel = document.getElementById("panel-origin");
    var frontierPanel = document.getElementById("panel-frontier");
    var tabs = root ? root.querySelectorAll(".framework-tab") : [];
    if (!root || !track || !viewport) return;

    var active = "origin";
    var startX = 0;
    var startY = 0;
    var dragging = false;
    var lockedAxis = null;

    function syncViewportHeight() {
        var panel = active === "frontier" ? frontierPanel : originPanel;
        if (!panel) return;
        viewport.style.height = panel.offsetHeight + "px";
    }

    function setFramework(name, pushHash) {
        if (name !== "origin" && name !== "frontier") return;
        active = name;
        root.setAttribute("data-active", name);
        root.classList.toggle("is-frontier", name === "frontier");

        tabs.forEach(function (tab) {
            var on = tab.getAttribute("data-framework") === name;
            tab.classList.toggle("is-active", on);
            tab.setAttribute("aria-selected", on ? "true" : "false");
        });

        originPanel.hidden = false;
        frontierPanel.hidden = false;
        originPanel.setAttribute("aria-hidden", name !== "origin" ? "true" : "false");
        frontierPanel.setAttribute("aria-hidden", name !== "frontier" ? "true" : "false");
        track.style.transform = name === "frontier" ? "translateX(-50%)" : "translateX(0)";
        syncViewportHeight();

        if (pushHash !== false) {
            var hash = name === "frontier" ? "#frontier" : "#origin";
            if (window.location.hash !== hash) {
                history.replaceState(null, "", hash);
            }
        }
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            setFramework(tab.getAttribute("data-framework"));
        });
    });

    viewport.addEventListener(
        "touchstart",
        function (e) {
            if (!e.touches[0]) return;
            dragging = true;
            lockedAxis = null;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        },
        { passive: true }
    );

    viewport.addEventListener(
        "touchmove",
        function (e) {
            if (!dragging || !e.touches[0]) return;
            var dx = e.touches[0].clientX - startX;
            var dy = e.touches[0].clientY - startY;
            if (!lockedAxis) {
                if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                    lockedAxis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
                }
            }
        },
        { passive: true }
    );

    viewport.addEventListener(
        "touchend",
        function (e) {
            if (!dragging) return;
            dragging = false;
            var t = e.changedTouches[0];
            if (!t || lockedAxis !== "x") return;
            var dx = t.clientX - startX;
            if (dx < -48) setFramework("frontier");
            else if (dx > 48) setFramework("origin");
        },
        { passive: true }
    );

    // Mouse drag support (desktop swipe)
    var mouseDown = false;
    var mouseStartX = 0;
    viewport.addEventListener("mousedown", function (e) {
        mouseDown = true;
        mouseStartX = e.clientX;
    });
    window.addEventListener("mouseup", function (e) {
        if (!mouseDown) return;
        mouseDown = false;
        var dx = e.clientX - mouseStartX;
        if (dx < -64) setFramework("frontier");
        else if (dx > 64) setFramework("origin");
    });

    function updateDevelopmentDays() {
        var startDate = new Date(2026, 6, 30);
        var today = new Date();
        var startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        var currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        var days = Math.max(1, Math.floor((currentDay - startDay) / 86400000) + 1);
        var el = document.getElementById("dev-days");
        if (el) el.textContent = "Day " + days + " in development";
    }

    function fromHash() {
        var h = (window.location.hash || "").toLowerCase();
        if (h === "#frontier" || h === "#ultra") setFramework("frontier", false);
        else setFramework("origin", false);
    }

    window.addEventListener("hashchange", fromHash);
    window.addEventListener("resize", syncViewportHeight);
    updateDevelopmentDays();
    fromHash();
    requestAnimationFrame(syncViewportHeight);
})();
