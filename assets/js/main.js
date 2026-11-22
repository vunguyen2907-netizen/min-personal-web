/**
 * INTERACTIVE LOGIC & GOOGLE ANALYTICS 4 EVENT TRACKING
 */

// Helper: Gửi sự kiện tùy chỉnh về Google Analytics 4 (nếu gtag đã sẵn sàng)
function trackGAEvent(eventName, params = {}) {
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
    }
}

// Lưu trạng thái danh sách hiện tại (sẽ được đồng bộ từ Supabase nếu kết nối thành công)
let currentProjects = [...SITE_DATA.projects];
let currentTrekkingLogs = [...SITE_DATA.trekkingLogs];
let activeProjectFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderManagementPillars();
    renderProjects(activeProjectFilter);
    renderTrekkingLogs();
    renderConqueredPeaks();
    renderHealingGetaways();
    renderPackingChecklist();

    initNavbar();
    initMobileMenu();
    initProjectFilters();
    initModalHandlers();
    initCopyEmail();
    initContactForm();
    initScrollReveal();
    initBackToTop();

    // Đồng bộ dữ liệu động & lượt xem từ Supabase
    syncWithSupabase();
});

async function syncWithSupabase() {
    if (typeof SupabaseAPI === 'undefined') return;

    try {
        const [projects, treks, settings, viewCount] = await Promise.all([
            SupabaseAPI.fetchProjects().catch(() => null),
            SupabaseAPI.fetchTrekkingLogs().catch(() => null),
            SupabaseAPI.fetchSiteSettings().catch(() => null),
            SupabaseAPI.recordAndGetPageViews('/').catch(() => null)
        ]);

        if (Array.isArray(projects) && projects.length > 0) {
            currentProjects = projects;
            renderProjects(activeProjectFilter);
        }

        if (Array.isArray(treks) && treks.length > 0) {
            currentTrekkingLogs = treks;
            renderTrekkingLogs();
        }

        if (settings) {
            applySiteSettings(settings);
        }

        const viewCountEl = document.getElementById('live-view-count');
        if (viewCountEl && typeof viewCount === 'number') {
            viewCountEl.textContent = viewCount.toLocaleString('vi-VN');
        }
    } catch (_) {
        // Fallback mượt mà về SITE_DATA cục bộ nếu mất mạng
    }
}

function applySiteSettings(settings) {
    if (settings.email) {
        SITE_DATA.profile.email = settings.email;
        const emailLink = document.getElementById('contact-email-link');
        if (emailLink) {
            emailLink.href = `mailto:${settings.email}`;
            emailLink.textContent = settings.email;
        }
    }
    const socialMap = {
        'social-facebook': settings.facebook_url,
        'social-zalo': settings.zalo_url,
        'social-tiktok': settings.tiktok_url,
        'social-linkedin': settings.linkedin_url,
        'social-github': settings.github_url
    };
    Object.entries(socialMap).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (url && url.trim()) {
            el.href = url.trim();
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

/* =========================================================
   1. RENDER MANAGEMENT & STRATEGY
   ========================================================= */
function renderManagementPillars() {
    const container = document.getElementById('management-grid');
    if (!container) return;

    container.innerHTML = SITE_DATA.managementPillars.map(item => `
        <div class="reveal bg-rustic-bg/5 border border-rustic-bg/15 p-7 hover:bg-rustic-bg/10 transition-all duration-300 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-xs font-mono font-semibold uppercase tracking-widest text-terracotta-soft bg-terracotta/30 border border-terracotta-light/40 px-3 py-1">
                    ${item.metric}
                </span>
            </div>
            <h3 class="text-xl font-semibold text-white mb-3">${item.title}</h3>
            <p class="text-gray-200 text-sm leading-relaxed mb-5 flex-grow">${item.description}</p>
            <ul class="space-y-2 border-t border-rustic-bg/15 pt-4 text-xs text-gray-200">
                ${item.highlights.map(h => `
                    <li class="flex items-start gap-2">
                        <span class="text-terracotta-light mt-0.5">▸</span>
                        <span>${h}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}

/* =========================================================
   2. RENDER PROJECTS (DATA & AUTOMATION) + FILTER
   ========================================================= */
function getProjectIcon(type) {
    const icons = {
        chart: `<svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
        code: `<svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>`,
        chip: `<svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>`,
        database: `<svg class="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/></svg>`
    };
    return icons[type] || icons.code;
}

function renderProjects(filterCategory) {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filtered = filterCategory === 'all'
        ? currentProjects
        : currentProjects.filter(p => p.category === filterCategory);

    container.innerHTML = filtered.map(project => `
        <article class="group bg-rustic-bg/5 border border-rustic-bg/15 p-8 hover:bg-rustic-bg/10 hover:border-terracotta-light/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
            <div class="flex items-start justify-between mb-6">
                <div class="text-terracotta-light">${getProjectIcon(project.icon)}</div>
                <span class="text-xs font-mono text-gray-200 border border-rustic-bg/25 px-2.5 py-1">
                    ${project.categoryLabel}
                </span>
            </div>
            <h3 class="text-xl font-semibold text-white mb-3 group-hover:text-terracotta-soft transition-colors">
                ${project.title}
            </h3>
            <p class="text-gray-200 text-sm leading-relaxed mb-6 flex-grow">
                ${project.shortDesc}
            </p>
            <div class="flex flex-wrap gap-2 mb-6">
                ${project.tags.map(tag => `
                    <span class="text-xs px-2.5 py-1 bg-rustic-bg/15 text-rustic-bg rounded-full">${tag}</span>
                `).join('')}
            </div>
            <button
                type="button"
                data-project-id="${project.id}"
                class="open-project-btn mt-auto inline-flex items-center gap-2 text-sm font-semibold text-terracotta-light hover:text-white transition-colors text-left"
            >
                Xem chi tiết Case Study
                <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
            </button>
        </article>
    `).join('');

    container.querySelectorAll('.open-project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const project = currentProjects.find(p => p.id === btn.dataset.projectId);
            if (project) openProjectModal(project);
        });
    });
}

function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeProjectFilter = btn.dataset.filter;
            renderProjects(activeProjectFilter);
            trackGAEvent('filter_projects', { category: activeProjectFilter });
        });
    });
}

/* =========================================================
   3. RENDER TREKKING LOGS (BENTO GRID)
   ========================================================= */
function renderTrekkingLogs() {
    const container = document.getElementById('trekking-grid');
    if (!container || currentTrekkingLogs.length === 0) return;

    const [mainLog, ...otherLogs] = currentTrekkingLogs;

    container.innerHTML = `
        <!-- Main Featured Trek -->
        <button
            type="button"
            data-trek-id="${mainLog.id}"
            class="open-trek-btn md:col-span-2 md:row-span-2 relative group overflow-hidden bg-forest text-left min-h-[360px] md:min-h-[520px] cursor-pointer"
        >
            <img src="${mainLog.image}" alt="${mainLog.title}" loading="lazy"
                 class="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/35 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-7 md:p-9 w-full">
                <div class="flex flex-wrap items-center gap-2 mb-3">
                    <span class="inline-block px-3 py-1 bg-terracotta text-white text-xs font-semibold uppercase tracking-wider">${mainLog.tag}</span>
                    <span class="inline-block px-2.5 py-1 bg-black/35 backdrop-blur-sm text-rustic-bg text-xs font-mono">${mainLog.stats.elevation}</span>
                </div>
                <h3 class="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-rustic-bg transition-colors">${mainLog.title}</h3>
                <p class="text-gray-200 text-sm md:text-base line-clamp-2 max-w-xl mb-4">${mainLog.excerpt}</p>
                <span class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta bg-rustic-bg px-3 py-1.5">
                    Đọc nhật ký
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </span>
            </div>
        </button>

        <!-- Secondary Treks -->
        ${otherLogs.map(log => `
            <button
                type="button"
                data-trek-id="${log.id}"
                class="open-trek-btn relative group overflow-hidden bg-forest text-left min-h-[250px] cursor-pointer"
            >
                <img src="${log.image}" alt="${log.title}" loading="lazy"
                     class="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/35 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-6 w-full">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="inline-block px-2.5 py-0.5 bg-rustic-bg text-forest text-[11px] font-semibold uppercase tracking-wider">${log.tag}</span>
                        <span class="text-xs font-mono text-gray-200">${log.stats.elevation}</span>
                    </div>
                    <h3 class="text-lg md:text-xl font-bold text-white mb-1">${log.title}</h3>
                    <p class="text-gray-200 text-xs line-clamp-2">${log.excerpt}</p>
                </div>
            </button>
        `).join('')}
    `;

    container.querySelectorAll('.open-trek-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const log = currentTrekkingLogs.find(l => l.id === btn.dataset.trekId);
            if (log) openTrekModal(log);
        });
    });
}

/* =========================================================
   4. CONQUERED PEAKS GOOGLE MAPS EMBED
   ========================================================= */
function renderConqueredPeaks() {
    const listEl = document.getElementById('peaks-list');
    const iframeEl = document.getElementById('peaks-map-iframe');
    const mapLinkEl = document.getElementById('peaks-map-link');
    const activeNoteEl = document.getElementById('peaks-active-note');

    if (!listEl || !iframeEl) return;

    function selectPeak(peak) {
        iframeEl.src = `https://maps.google.com/maps?q=${peak.query}&t=p&z=11&ie=UTF8&iwloc=&output=embed`;
        if (mapLinkEl) {
            mapLinkEl.href = `https://www.google.com/maps/search/?api=1&query=${peak.query}`;
        }
        if (activeNoteEl) {
            activeNoteEl.textContent = `${peak.name} (${peak.elevation}) — ${peak.note}`;
        }

        listEl.querySelectorAll('.peak-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.peakId === peak.id);
        });
    }

    listEl.innerHTML = SITE_DATA.conqueredPeaks.map((peak, index) => `
        <button
            type="button"
            data-peak-id="${peak.id}"
            class="peak-btn ${index === 0 ? 'active' : ''} w-full text-left p-4 border border-forest/15 bg-white/70 hover:border-forest transition-all duration-200"
        >
            <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-sm">${peak.name}</span>
                <span class="text-xs font-mono px-2 py-0.5 bg-terracotta/15 text-terracotta font-semibold">${peak.elevation}</span>
            </div>
            <div class="peak-meta text-xs text-gray-500 mt-1 flex items-center justify-between">
                <span>${peak.region}</span>
                <span class="font-mono">${peak.date}</span>
            </div>
        </button>
    `).join('');

    listEl.querySelectorAll('.peak-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const peak = SITE_DATA.conqueredPeaks.find(p => p.id === btn.dataset.peakId);
            if (peak) {
                selectPeak(peak);
                trackGAEvent('select_mountain_peak', { peak_name: peak.name });
            }
        });
    });

    // Load default first peak
    selectPeak(SITE_DATA.conqueredPeaks[0]);
}

/* =========================================================
   5. HEALING GETAWAYS
   ========================================================= */
function renderHealingGetaways() {
    const container = document.getElementById('healing-grid');
    if (!container) return;

    container.innerHTML = SITE_DATA.healingGetaways.map(item => `
        <article class="reveal bg-white/75 border border-forest/10 p-7 hover:border-terracotta/50 transition-all duration-300 flex flex-col">
            <span class="inline-block w-fit px-3 py-1 bg-forest/10 text-forest text-xs font-semibold uppercase tracking-wider mb-4">
                ${item.badge}
            </span>
            <h3 class="text-xl font-bold text-forest mb-3">${item.title}</h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-5">${item.summary}</p>
            <ul class="space-y-2.5 text-sm text-gray-700 border-t border-forest/10 pt-4 mt-auto">
                ${item.tips.map(tip => `
                    <li class="flex items-start gap-2.5">
                        <span class="text-terracotta font-bold mt-0.5">•</span>
                        <span>${tip}</span>
                    </li>
                `).join('')}
            </ul>
        </article>
    `).join('');
}

/* =========================================================
   6. INTERACTIVE 30L PACKING CHECKLIST (WITH LOCALSTORAGE)
   ========================================================= */
function renderPackingChecklist() {
    const container = document.getElementById('packing-checklist');
    const progressText = document.getElementById('checklist-progress-text');
    const progressBar = document.getElementById('checklist-progress-bar');
    const resetBtn = document.getElementById('checklist-reset-btn');
    if (!container) return;

    const STORAGE_KEY = 'min_trekking_checklist_v1';
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {
        saved = {};
    }

    function updateProgress() {
        const total = SITE_DATA.packingChecklist.length;
        const checked = SITE_DATA.packingChecklist.filter(item => saved[item.id]).length;
        const pct = Math.round((checked / total) * 100);
        if (progressText) progressText.textContent = `${checked}/${total} món (${pct}%)`;
        if (progressBar) progressBar.style.width = `${pct}%`;
    }

    container.innerHTML = SITE_DATA.packingChecklist.map(item => `
        <label class="checklist-item flex items-start gap-3 p-3 bg-white/70 border border-forest/10 hover:border-terracotta/50 cursor-pointer transition-colors">
            <input
                type="checkbox"
                data-item-id="${item.id}"
                ${saved[item.id] ? 'checked' : ''}
                class="mt-1 h-4 w-4 accent-[#A65D37] rounded-none cursor-pointer"
            >
            <span class="text-sm text-dark-gray leading-snug">
                <strong class="text-xs font-mono uppercase text-forest/70 mr-1.5">[${item.group}]</strong>
                ${item.text}
            </span>
        </label>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', () => {
            saved[input.dataset.itemId] = input.checked;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
            } catch (_) {}
            updateProgress();
            trackGAEvent('toggle_checklist_item', {
                item_id: input.dataset.itemId,
                checked: input.checked
            });
        });
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            saved = {};
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (_) {}
            container.querySelectorAll('input[type="checkbox"]').forEach(i => (i.checked = false));
            updateProgress();
        });
    }

    updateProgress();
}

/* =========================================================
   7. DETAIL MODAL (FOR CASE STUDIES & TREKKING LOGS)
   ========================================================= */
function openModal(title, badge, bodyHtml) {
    const modal = document.getElementById('detail-modal');
    const titleEl = document.getElementById('modal-title');
    const badgeEl = document.getElementById('modal-badge');
    const bodyEl = document.getElementById('modal-body');

    if (!modal) return;
    titleEl.textContent = title;
    badgeEl.textContent = badge;
    bodyEl.innerHTML = bodyHtml;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

function openProjectModal(project) {
    const cs = project.caseStudy;
    const html = `
        <div class="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
            <div class="flex flex-wrap gap-2">
                ${project.tags.map(t => `<span class="text-xs font-mono px-2.5 py-1 bg-forest/10 text-forest">${t}</span>`).join('')}
            </div>
            <div>
                <h4 class="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold mb-1.5">01. Bài toán thực tế</h4>
                <p>${cs.challenge}</p>
            </div>
            <div>
                <h4 class="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold mb-1.5">02. Giải pháp triển khai</h4>
                <p>${cs.solution}</p>
            </div>
            <div>
                <h4 class="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold mb-2">03. Kiến trúc & Công cụ</h4>
                <div class="grid sm:grid-cols-2 gap-2">
                    ${cs.architecture.map((step, i) => `
                        <div class="p-3 bg-rustic-bg border border-forest/10 text-sm flex items-start gap-2">
                            <span class="font-mono text-xs text-terracotta font-bold">0${i + 1}</span>
                            <span>${step}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="bg-forest text-rustic-bg p-5">
                <h4 class="text-xs font-mono uppercase tracking-wider text-terracotta-light font-semibold mb-2">04. Kết quả đạt được</h4>
                <ul class="space-y-2 text-sm">
                    ${cs.impact.map(imp => `<li class="flex items-start gap-2"><span class="text-terracotta-light">✓</span><span>${imp}</span></li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    openModal(project.title, `Case Study • ${project.categoryLabel}`, html);
    trackGAEvent('view_case_study', { project_id: project.id, project_title: project.title });
}

function openTrekModal(log) {
    const html = `
        <div class="space-y-6">
            <img src="${log.image}" alt="${log.title}" class="w-full h-56 md:h-72 object-cover">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-rustic-bg p-4 border border-forest/10">
                <div>
                    <div class="text-[11px] font-mono uppercase text-gray-500">Độ cao</div>
                    <div class="font-bold text-forest text-sm mt-0.5">${log.stats.elevation}</div>
                </div>
                <div>
                    <div class="text-[11px] font-mono uppercase text-gray-500">Quãng đường</div>
                    <div class="font-bold text-forest text-sm mt-0.5">${log.stats.distance}</div>
                </div>
                <div>
                    <div class="text-[11px] font-mono uppercase text-gray-500">Độ khó</div>
                    <div class="font-bold text-terracotta text-sm mt-0.5">${log.stats.difficulty}</div>
                </div>
                <div>
                    <div class="text-[11px] font-mono uppercase text-gray-500">Khu vực</div>
                    <div class="font-bold text-forest text-sm mt-0.5">${log.stats.location}</div>
                </div>
            </div>
            <div class="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
                ${log.story.map(p => `<p>${p}</p>`).join('')}
            </div>
        </div>
    `;
    openModal(log.title, log.tag, html);
    trackGAEvent('view_trekking_log', { trek_id: log.id, trek_title: log.title });
}

function initModalHandlers() {
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal) return;

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

/* =========================================================
   8. NAVBAR, MOBILE MENU, SCROLL SPY, COPY EMAIL & REVEAL
   ========================================================= */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], footer[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('shadow-sm');
            navbar.classList.replace('bg-rustic-bg/80', 'bg-rustic-bg/95');
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.classList.replace('bg-rustic-bg/95', 'bg-rustic-bg/80');
        }

        let currentId = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (window.scrollY >= top) {
                currentId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    });
}

function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!toggleBtn || !mobileMenu) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            toggleBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

function initCopyEmail() {
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('copy-toast');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(SITE_DATA.profile.email);
            if (toast) {
                toast.classList.remove('opacity-0', 'pointer-events-none');
                setTimeout(() => toast.classList.add('opacity-0', 'pointer-events-none'), 2200);
            }
            trackGAEvent('copy_email', { email: SITE_DATA.profile.email });
        } catch (_) {
            window.location.href = `mailto:${SITE_DATA.profile.email}`;
        }
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const statusEl = document.getElementById('contact-form-status');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (typeof SupabaseAPI === 'undefined') return;

        const formData = new FormData(form);
        const payload = {
            sender_name: String(formData.get('sender_name') || ''),
            sender_email: String(formData.get('sender_email') || ''),
            topic: String(formData.get('topic') || 'general'),
            message: String(formData.get('message') || '')
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
        statusEl.textContent = '';
        statusEl.className = 'text-xs font-mono text-gray-300';

        try {
            await SupabaseAPI.submitContactMessage(payload);
            form.reset();
            statusEl.textContent = '✓ Cảm ơn bạn! Lời nhắn đã được gửi thành công.';
            statusEl.className = 'text-xs font-mono text-emerald-200 font-medium';
            trackGAEvent('submit_contact_form', { topic: payload.topic });
        } catch (_) {
            statusEl.textContent = '✗ Không thể gửi lúc này, vui lòng thử lại hoặc gửi email trực tiếp.';
            statusEl.className = 'text-xs font-mono text-amber-300';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Gửi lời nhắn';
        }
    });
}

function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
}

function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        } else {
            btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
