/**
 * Popcorn operation map: interactive tree + detail panel (v0.7).
 */
(function () {
    const KERNEL_TREE = {
        id: "root",
        label: "Popcorn v0.7 · operation map",
        detail:
            "UEFI-first exo/mono hybrid. Firmware or GRUB loads the kernel ELF, asm enters long mode, init brings up memory + Rust drivers, then the shell runs.\n\nSelect a node for notes.",
        children: [
            {
                id: "repo-roles",
                label: "0 · Layout",
                detail:
                    "Popcorn/\n├── scripts/           # core.sh, popcorn_build/, QEMU\n├── src/\n│   ├── link.ld\n│   ├── core/          # C + asm\n│   ├── rust/          # popcorn_kernel crate\n│   ├── uefi/          # BOOTX64.EFI\n│   ├── pops/          # Dolphin (C)\n│   └── includes/\n└── target/            # outputs\n\nGuest runs the linked ELF (+ UEFI loader). Scripts stay on the host.",
            },
            {
                id: "boot",
                label: "1 · Boot",
                detail:
                    "UEFI path (primary):\n  BOOTX64.EFI → handoff tags → kernel entry\n\nGRUB path:\n  Multiboot2 ISO → ELF @ 0x100000 → start\n\nkernel.asm start:\n  save handoff → paging / long mode → kmain\n\nCI: test-uefi smokes both paths.",
                children: [
                    {
                        id: "uefi-loader",
                        label: "1.1 · UEFI loader",
                        detail:
                            "src/uefi/bootx64.c builds BOOTX64.EFI.\nGOP framebuffer when present.\nFirmware keyboard fallback until /dev/kbd is live.",
                    },
                    {
                        id: "mb2-header",
                        label: "1.2 · Multiboot2",
                        detail:
                            "GRUB loads the Multiboot2 ELF.\nTags feed memory map + boot info into multiboot2.c / init.",
                    },
                ],
            },
            {
                id: "runtime",
                label: "2 · Ring-0 runtime",
                detail:
                    "┌──────────────────────────────────────────┐\n│ Popcorn ring 0                            │\n├──────────────────────────────────────────┤\n│ Console UX (C) → Rust tty0 / fb0          │\n│ PMM ≤16 GiB · VMM 4-level · PML4/CR3      │\n│ IRQ table · PIT · /dev/kbd                │\n│ Rust driver registry + catalog            │\n│ Syscalls → device bridge                  │\n│ Shell + pops                              │\n└──────────────────────────────────────────┘",
                children: [
                    {
                        id: "console",
                        label: "Console / screen",
                        detail:
                            "core/console.c keeps scrollback, history, status bar.\nRust backends/screen + vga/fb own drawing (tty0 / fb0).",
                    },
                    {
                        id: "vmm",
                        label: "Virtual memory",
                        detail:
                            "core/vmm.c: 4-level map, direct map, process PML4 clones, CR3 on switch.\nPDE splitter can overlay 4K on large pages.",
                    },
                    {
                        id: "pmm",
                        label: "Physical memory",
                        detail:
                            "core/memory.c: bitmap PMM from UEFI/Multiboot mmap, track up to 16 GiB.\nkmalloc pools for kernel structures; Rust alloc shim uses kmalloc.",
                    },
                    {
                        id: "irq",
                        label: "Interrupts",
                        detail:
                            "IDT + PIC. Central irq_register table (C + Rust claims).\nExceptions dump on serial. IRQ0 timer, IRQ1 → kbd drive.",
                    },
                    {
                        id: "timer",
                        label: "Timer",
                        detail:
                            "core/timer.c owns PIT IRQ for now.\nRust clock drive exposes uptime/info. Tick handler → scheduler_tick.",
                    },
                    {
                        id: "sched",
                        label: "Scheduler",
                        detail:
                            "Preemption with bootstrap guards, wait queues, sleep/yield.\nStatic task pool; private PML4 for non-idle tasks.",
                    },
                    {
                        id: "drivers",
                        label: "Rust driver network",
                        detail:
                            "rust/popcorn_kernel: registry, PCI walk, char/block/fb classes.\nBuiltins: null, zero, ttyS0, tty0, fb0, kbd, clock, mem, cpu.\nBlock: ram0, virtio, NVMe, USB MSC (write-gated disk picker).",
                    },
                    {
                        id: "syscall",
                        label: "Syscalls",
                        detail:
                            "int 0x80 → syscall_dispatch.\nopen/read/write/ioctl hit devices.\ngettime, sleep, yield wired. Ring-3 ABI still ahead.",
                    },
                    {
                        id: "shell",
                        label: "Shell",
                        detail:
                            "core/shell.c: line editing, builtins, drive/dev/disk/catalog.\nKeys from /dev/kbd. HLT when idle.",
                    },
                    {
                        id: "pops-reg",
                        label: "Pops",
                        detail:
                            "Rust: shimjapii, spinner, uptime, sysinfo, cpu, memory.\nC: Dolphin editor.\nShared PopModule ABI; save/restore console cursor.",
                    },
                ],
            },
            {
                id: "kmain",
                label: "3 · kmain / init",
                detail:
                    "kmain is thin.\ninit brings up memory, IDT, rust_init (drives + pops), timer/scheduler, then console handoff into the shell loop.",
            },
            {
                id: "catalog",
                label: "4 · Catalog",
                detail:
                    "In-kernel registry DB (catalog.rs):\ndrives, /dev nodes, pops, IRQs, syscalls.\nShell: catalog",
            },
            {
                id: "host-build",
                label: "5 · Host → QEMU",
                detail:
                    "./scripts/core.sh build | test-uefi | …\npopcorn_build Python package for toolchain/ISO/img.\nQEMU: UEFI img (OVMF) and/or GRUB ISO.",
            },
            {
                id: "reading",
                label: "6 · Reading map",
                detail:
                    "Entry → core/kernel.asm, link.ld\nUEFI → uefi/bootx64.c\nInit/shell → core/init.c, shell.c, kernel.c\nMemory → memory.c, vmm.c\nIRQ/time/sched → idt.c, irq.c, timer.c, scheduler.c\nSyscalls → syscall.c\nDrivers/pops → rust/popcorn_kernel/src/\nBuild → scripts/core.sh",
            },
            {
                id: "caveats",
                label: "7 · Caveats",
                detail:
                    "Pre-1.0: soak on your host.\nNo full userspace yet.\nInternal disks locked until install … YES.\nEarly PIT ticks gated by bootstrap helpers.",
            },
        ],
    };

    const treeRoot = document.getElementById("tree-root");
    const detailTitle = document.getElementById("detail-title");
    const detailBody = document.getElementById("detail-body");

    let selectedLi = null;

    function renderDetail(node) {
        detailTitle.textContent = node.label;
        detailBody.innerHTML = "";
        const pre = document.createElement("pre");
        pre.className = "detail-panel__pre";
        pre.textContent = node.detail || "";
        detailBody.appendChild(pre);
    }

    function clearSelection() {
        if (selectedLi) selectedLi.classList.remove("is-selected");
        selectedLi = null;
    }

    function buildNode(node) {
        const li = document.createElement("li");
        li.className = "tree-node";
        if (!node.children || node.children.length === 0) {
            li.classList.add("is-leaf");
        }

        const row = document.createElement("button");
        row.type = "button";
        row.className = "tree-node__row";

        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = node.children && node.children.length ? "▸" : "·";

        const label = document.createElement("span");
        label.className = "tree-node__label";
        label.textContent = node.label;

        row.appendChild(chevron);
        row.appendChild(label);

        row.addEventListener("click", function (e) {
            e.stopPropagation();
            clearSelection();
            li.classList.add("is-selected");
            selectedLi = li;
            renderDetail(node);
            if (node.children && node.children.length) {
                li.classList.toggle("is-open");
            }
        });

        li.appendChild(row);

        if (node.children && node.children.length) {
            const ul = document.createElement("ul");
            ul.className = "tree-children";
            node.children.forEach(function (child) {
                ul.appendChild(buildNode(child));
            });
            li.appendChild(ul);
        }

        return li;
    }

    function initTree() {
        if (!treeRoot) return;
        const ul = document.createElement("ul");
        ul.className = "tree";
        ul.appendChild(buildNode(KERNEL_TREE));
        treeRoot.appendChild(ul);
        renderDetail(KERNEL_TREE);
        const first = treeRoot.querySelector(".tree-node");
        if (first) {
            first.classList.add("is-selected", "is-open");
            selectedLi = first;
        }
    }

    async function initMermaid() {
        if (typeof mermaid === "undefined") return;
        mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            securityLevel: "loose",
            themeVariables: {
                primaryColor: "#0f1a16",
                primaryTextColor: "#00ff9d",
                primaryBorderColor: "#00ff9d",
                lineColor: "#5ee0ad",
                secondaryColor: "#141414",
                tertiaryColor: "#0a0a0a",
                background: "#0a0a0a",
                mainBkg: "#101010",
                nodeBorder: "#00ff9d",
                clusterBkg: "#151515",
                titleColor: "#e8e8e8",
                edgeLabelBackground: "#101010",
                nodeTextColor: "#e0fff4",
            },
            flowchart: { curve: "basis", padding: 14, useMaxWidth: true },
        });
        try {
            await mermaid.run({ querySelector: ".mermaid" });
        } catch (e) {
            console.error(e);
        }
    }

    initTree();
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMermaid);
    } else {
        initMermaid();
    }
    window.addEventListener("load", initMermaid);
})();
