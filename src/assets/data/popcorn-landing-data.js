/**
 * Landing page content. Edit here to update hero, terminal, stats, and Current cards.
 * Loaded before popcorn-landing.js
 */
window.POPCORN_LANDING = {
    hero: {
        kicker: "x86-64 · UEFI-first",
        brand: "Popcorn",
        tag: "The Exo/Mono Hybrid",
        line: "Building the next kernel. Boots on modern UEFI machines. Layered core, growing outward.",
        primaryCta: { label: "Repository", hrefKey: "repo" },
        secondaryCta: { label: "About", page: "about" },
    },

    stats: [
        { value: "UEFI", label: "boots on modern PCs" },
        { value: "x86-64", label: "GRUB path too" },
        { value: "C + Rust", label: "mixed language" },
        { value: "v0.7", label: "current release" },
    ],

    focusSeq: [
        { kind: "cmd", text: "sysinfo" },
        { kind: "out", text: "cpu      x86_64" },
        { kind: "out", text: "boot     UEFI (and GRUB)" },
        { kind: "out", text: "loader   BOOTX64.EFI" },
        { kind: "out", text: "langs    C + Rust" },
        { kind: "out", text: "memory   up to 16 GiB tracked" },
        { kind: "out", text: "time     timer + sleep" },
        { kind: "out", text: "tasks    preempt + wait" },
        { kind: "cmd", text: "drive list" },
        { kind: "out", text: "screen  serial  keyboard  clock  …" },
        { kind: "cmd", text: "" },
    ],

    current: {
        title: "Current",
        subtitle: "What works in the tree today.",
        items: [
            {
                title: "UEFI boot",
                blurb: "Boots with a real UEFI app, not only old BIOS tricks.",
                more: "Ships BOOTX64.EFI, draws text on modern display modes, and CI checks the UEFI image on every push.",
            },
            {
                title: "GRUB path",
                blurb: "Still builds a classic ISO for older bring-up.",
                more: "Same kernel, different loader. Handy for testing both ways next to UEFI.",
            },
            {
                title: "Console",
                blurb: "Text shell with history and scrollback.",
                more: "Works on old VGA text and on UEFI framebuffers. Status bar and tab completion stay in C; the screen drawing moved to Rust.",
            },
            {
                title: "Memory",
                blurb: "Tracks physical frames and sets up page tables.",
                more: "Keeps a map of usable RAM, builds 4-level page tables, and gives each task its own address space when needed.",
            },
            {
                title: "Interrupts",
                blurb: "Timer, keyboard, and crash dumps that help debug.",
                more: "Hardware events land in one table. Bad faults print useful info on serial instead of hanging silently.",
            },
            {
                title: "Scheduling",
                blurb: "Tasks can run, sleep, and wake on events.",
                more: "The timer can preempt work. Drivers can park a task until an interrupt shows up.",
            },
            {
                title: "Syscalls",
                blurb: "Open, read, write, and wait through one bridge.",
                more: "File-like calls reach registered devices. Time and sleep are wired. Full user programs come later.",
            },
            {
                title: "Rust drivers",
                blurb: "Devices register in Rust and show up as drives.",
                more: "Screen, serial, keyboard, clock, and more. New hardware can land without growing the C shell loop.",
            },
            {
                title: "Block I/O",
                blurb: "Talks to ramdisk, virtio, NVMe, and USB storage.",
                more: "Disk picks are gated so internal drives stay locked until you unlock them on purpose.",
            },
            {
                title: "Pop modules",
                blurb: "Small add-ons for sysinfo, cpu, memory, uptime.",
                more: "Same registration shape for C or Rust. Dolphin is still the in-kernel editor.",
            },
            {
                title: "Catalog",
                blurb: "Lists drives, interrupts, and syscalls from inside.",
                more: "A live inventory you can print from the shell while bringing things up.",
            },
            {
                title: "CI",
                blurb: "Build and UEFI boot checks on every push.",
                more: "GitHub Actions builds the kernel and smokes both UEFI and GRUB paths.",
            },
        ],
    },
};
