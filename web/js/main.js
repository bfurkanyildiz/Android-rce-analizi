/* ===================================================
   Android CVE Analizi — Dashboard JavaScript
   Terminal simülasyonu, scroll animasyonları, accordion
   =================================================== */

(function () {
    'use strict';

    // ─── DOM Ready ───
    document.addEventListener('DOMContentLoaded', function () {
        initNavbar();
        initMobileMenu();
        initScrollAnimations();
        initAccordion();
        initTerminalSimulation();
        initActiveNavHighlight();
    });

    // ─── Navbar Scroll Effect ───
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        if (!navbar) return;

        var scrollThreshold = 50;

        function handleScroll() {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
    }

    // ─── Mobile Menu Toggle ───
    function initMobileMenu() {
        var toggle = document.getElementById('mobileToggle');
        var navLinks = document.getElementById('navLinks');
        if (!toggle || !navLinks) return;

        toggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });

        // Close menu when a link is clicked
        var links = navLinks.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                navLinks.classList.remove('open');
            });
        }
    }

    // ─── Scroll Animations (Intersection Observer) ───
    function initScrollAnimations() {
        var elements = document.querySelectorAll('.fade-in');
        if (elements.length === 0) return;

        // Fallback for older browsers
        if (!('IntersectionObserver' in window)) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.add('visible');
            }
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('visible');
                    observer.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        for (var j = 0; j < elements.length; j++) {
            observer.observe(elements[j]);
        }
    }

    // ─── Accordion ───
    function initAccordion() {
        var triggers = document.querySelectorAll('.accordion-trigger');

        for (var i = 0; i < triggers.length; i++) {
            triggers[i].addEventListener('click', function () {
                var item = this.closest('.accordion-item');
                var content = item.querySelector('.accordion-content');
                var isActive = item.classList.contains('active');

                // Close all other items
                var allItems = document.querySelectorAll('.accordion-item');
                for (var j = 0; j < allItems.length; j++) {
                    if (allItems[j] !== item) {
                        allItems[j].classList.remove('active');
                        allItems[j].querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
                        allItems[j].querySelector('.accordion-content').style.maxHeight = '0';
                    }
                }

                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    this.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = '0';
                } else {
                    item.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    }

    // ─── Active Nav Link Highlight ───
    function initActiveNavHighlight() {
        var sections = document.querySelectorAll('.section, .hero');
        var navLinks = document.querySelectorAll('.nav-links a');
        if (sections.length === 0 || navLinks.length === 0) return;

        if (!('IntersectionObserver' in window)) return;

        var observer = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    var id = entries[i].target.getAttribute('id');
                    setActiveNavLink(id);
                }
            }
        }, {
            threshold: 0.2,
            rootMargin: '-64px 0px -50% 0px'
        });

        for (var j = 0; j < sections.length; j++) {
            observer.observe(sections[j]);
        }

        function setActiveNavLink(sectionId) {
            for (var k = 0; k < navLinks.length; k++) {
                navLinks[k].classList.remove('active');
                var href = navLinks[k].getAttribute('href');
                if (href === '#' + sectionId) {
                    navLinks[k].classList.add('active');
                }
            }
        }
    }

    // ─── Terminal Simulation ───
    function initTerminalSimulation() {
        var terminalBody = document.getElementById('terminalBody');
        if (!terminalBody) return;

        // Terminal lines data
        var lines = [
            { text: '$ python src/detector.py', classes: 'term-green term-bold' },
            { text: '', classes: '' },
            { text: '==================================================', classes: 'term-blue term-bold' },
            { text: '    Android CVE-2024-0044 Logcat Saldiri Tespit    ', classes: 'term-blue term-bold' },
            { text: '==================================================', classes: 'term-blue term-bold' },
            { text: '', classes: '' },
            { text: '[*] Baslangic Zamani: 2026-06-05 15:30:12', classes: 'term-green' },
            { text: '[*] Izlenen Anahtar Kelimeler: SIGSEGV, SIGABRT, died, has died', classes: 'term-green' },
            { text: '[*] Durum: Log akisi dinleniyor...', classes: 'term-green' },
            { text: '', classes: '' },
            { text: '[INFO] Canli ADB baglantisi kuruluyor (127.0.0.1:5555)...', classes: 'term-blue' },
            { text: '[HATA] ADB baglantisi veya logcat baslatilamadi.', classes: 'term-red' },
            { text: '[IPUCU] Standart girdi ile calistirmak icin:', classes: 'term-yellow' },
            { text: '       adb logcat | python src/detector.py', classes: 'term-dim' },
            { text: '', classes: '' },
            { text: '[INFO] Manuel girdiler icin bekleniyor...', classes: 'term-blue' },
            { text: '', classes: '' },
            { text: '───────────────────────────────────────────────────', classes: 'term-dim' },
            { text: '  Test #1 Girdisi girildi:', classes: 'term-dim' },
            { text: '  W AndroidRuntime: SIGSEGV in run-as process', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '[TEHLIKE - ALARM 15:31:04] SIGSEGV tespiti yapildi!', classes: 'term-red' },
            { text: '+-- Log Satiri: W AndroidRuntime: SIGSEGV in run-as process', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '───────────────────────────────────────────────────', classes: 'term-dim' },
            { text: '  Test #2 Girdisi girildi:', classes: 'term-dim' },
            { text: '  E installd: SIGABRT caught in packages.list write', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '[TEHLIKE - ALARM 15:31:18] SIGABRT tespiti yapildi!', classes: 'term-red' },
            { text: '+-- Log Satiri: E installd: SIGABRT caught in packages.list write', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '───────────────────────────────────────────────────', classes: 'term-dim' },
            { text: '  Test #3 Girdisi girildi:', classes: 'term-dim' },
            { text: '  I ActivityManager: Process com.banka.app has died', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '[TEHLIKE - ALARM 15:31:35] has died tespiti yapildi!', classes: 'term-red' },
            { text: '+-- Log Satiri: I ActivityManager: Process com.banka.app has died', classes: 'term-yellow' },
            { text: '', classes: '' },
            { text: '───────────────────────────────────────────────────', classes: 'term-dim' },
            { text: '', classes: '' },
            { text: '[SONUC] 3/3 saldiri imzasi basariyla tespit edildi.', classes: 'term-green term-bold' },
            { text: '[INFO] Tespit motoru kapatiliyor.', classes: 'term-blue' }
        ];

        // Build all terminal lines (hidden initially)
        for (var i = 0; i < lines.length; i++) {
            var lineEl = document.createElement('div');
            lineEl.className = 'terminal-line';
            if (lines[i].classes) {
                var extraClasses = lines[i].classes.split(' ');
                for (var c = 0; c < extraClasses.length; c++) {
                    lineEl.classList.add(extraClasses[c]);
                }
            }
            lineEl.textContent = lines[i].text || '\u00A0'; // non-breaking space for empty lines
            terminalBody.appendChild(lineEl);
        }

        // Add blinking cursor at the end
        var cursorLine = document.createElement('div');
        cursorLine.className = 'terminal-line';
        cursorLine.innerHTML = '<span class="terminal-cursor"></span>';
        cursorLine.style.opacity = '0';
        terminalBody.appendChild(cursorLine);

        // Animate lines when terminal section is in view
        var terminalSection = document.getElementById('detector');
        if (!terminalSection) {
            // Fallback: show all immediately
            showAllLines(terminalBody);
            return;
        }

        var hasAnimated = false;

        if (!('IntersectionObserver' in window)) {
            showAllLines(terminalBody);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateTerminalLines(terminalBody);
                observer.unobserve(terminalSection);
            }
        }, {
            threshold: 0.3
        });

        observer.observe(terminalSection);
    }

    function showAllLines(container) {
        var allLines = container.querySelectorAll('.terminal-line');
        for (var i = 0; i < allLines.length; i++) {
            allLines[i].classList.add('visible');
            allLines[i].style.opacity = '1';
            allLines[i].style.transform = 'translateY(0)';
        }
    }

    function animateTerminalLines(container) {
        var allLines = container.querySelectorAll('.terminal-line');
        var delay = 0;
        var baseDelay = 80; // ms between lines
        var alarmDelay = 200; // extra delay for alarm lines

        for (var i = 0; i < allLines.length; i++) {
            (function (lineEl, lineDelay) {
                setTimeout(function () {
                    lineEl.classList.add('visible');
                    // Auto-scroll terminal body
                    container.scrollTop = container.scrollHeight;
                }, lineDelay);
            })(allLines[i], delay);

            // Add extra delay after alarm lines for dramatic effect
            if (allLines[i].classList.contains('term-red')) {
                delay += alarmDelay;
            } else {
                delay += baseDelay;
            }
        }
    }

})();
