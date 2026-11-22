/**
 * ADMIN CMS LOGIC — SUPABASE AUTH + CRUD
 */

const SESSION_KEY = 'min_admin_session_v1';
let authSession = null;
let adminProjects = [];
let adminTreks = [];
let adminMessages = [];
let trekQuill = null;

async function uploadImageToSupabase(file, folder = 'articles') {
    if (!file) throw new Error('Không có tệp ảnh.');
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Ảnh vượt quá giới hạn 5MB. Vui lòng chọn ảnh nhẹ hơn.');
    }
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeBase = slugify(file.name.replace(/\.[^/.]+$/, '')).slice(0, 40) || 'image';
    const path = `${folder}/${Date.now()}-${safeBase}.${ext}`;

    const res = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/media/${path}`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_CONFIG.publishableKey,
            Authorization: `Bearer ${authSession.access_token}`,
            'Content-Type': file.type || 'image/jpeg',
            'x-upsert': 'true'
        },
        body: file
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Tải ảnh thất bại (${res.status})`);
    }
    return `${SUPABASE_CONFIG.url}/storage/v1/object/public/media/${path}`;
}

function initRichTextEditor() {
    const editorEl = document.getElementById('trek-editor');
    if (!editorEl || typeof Quill === 'undefined') return;

    trekQuill = new Quill('#trek-editor', {
        theme: 'snow',
        placeholder: 'Bắt đầu viết nhật ký hành trình, định dạng tiêu đề, in đậm, trích dẫn hoặc chèn ảnh...',
        modules: {
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ color: [] }, { background: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ align: [] }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean']
                ],
                handlers: {
                    image: () => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.click();
                        input.onchange = async () => {
                            const file = input.files?.[0];
                            if (!file) return;
                            const statusEl = document.getElementById('editor-upload-status');
                            if (statusEl) statusEl.textContent = 'Đang tải ảnh lên Supabase Storage...';
                            try {
                                const url = await uploadImageToSupabase(file, 'articles');
                                const range = trekQuill.getSelection(true) || { index: trekQuill.getLength() };
                                trekQuill.insertEmbed(range.index, 'image', url, 'user');
                                trekQuill.setSelection(range.index + 1);
                                if (statusEl) statusEl.textContent = '✓ Đã chèn ảnh thành công!';
                            } catch (err) {
                                showToast(err.message, 'error');
                                if (statusEl) statusEl.textContent = '✗ Lỗi tải ảnh.';
                            }
                        };
                    }
                }
            }
        }
    });
}

function getAuthHeaders(extra = {}) {
    return {
        apikey: SUPABASE_CONFIG.publishableKey,
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
        ...extra
    };
}

function showToast(message, type = 'success') {
    const el = document.getElementById('admin-toast');
    if (!el) return;
    el.textContent = message;
    el.className = `mb-6 px-4 py-3 text-sm font-medium border ${
        type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
    }`;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), 3500);
}

function slugify(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initTabs();
    initRichTextEditor();
    initProjectForm();
    initTrekForm();
    initSettingsForm();
    document.getElementById('refresh-messages-btn')?.addEventListener('click', loadMessages);
});

/* =========================================================
   1. AUTHENTICATION (SUPABASE AUTH)
   ========================================================= */
async function initAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    try {
        const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        if (stored && stored.access_token) {
            const valid = await verifyToken(stored.access_token);
            if (valid) {
                authSession = stored;
                enterDashboard(valid.email);
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    } catch (_) {
        localStorage.removeItem(SESSION_KEY);
    }

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-submit-btn');
        const errEl = document.getElementById('login-error');

        btn.disabled = true;
        btn.textContent = 'Đang đăng nhập...';
        errEl.classList.add('hidden');

        try {
            const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_CONFIG.publishableKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok || !data.access_token) {
                throw new Error(data.error_description || data.msg || 'Sai email hoặc mật khẩu.');
            }
            authSession = {
                access_token: data.access_token,
                email: data.user?.email || email
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(authSession));
            enterDashboard(authSession.email);
        } catch (err) {
            errEl.textContent = err.message;
            errEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Đăng nhập';
        }
    });

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        authSession = null;
        document.getElementById('admin-app').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('login-password').value = '';
    });
}

async function verifyToken(token) {
    const res = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/user`, {
        headers: {
            apikey: SUPABASE_CONFIG.publishableKey,
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) return null;
    return res.json();
}

function enterDashboard(email) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-app').classList.remove('hidden');
    document.getElementById('admin-user-email').textContent = email;
    loadAllData();
}

async function loadAllData() {
    await Promise.all([loadProjects(), loadTreks(), loadSettings(), loadMessages(), loadViewCount()]);
}

async function loadViewCount() {
    try {
        const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/page_view_events?select=id&limit=1`, {
            headers: { apikey: SUPABASE_CONFIG.publishableKey, Prefer: 'count=exact' }
        });
        const range = res.headers.get('content-range') || '';
        const match = range.match(/\/(\d+)$/);
        document.getElementById('stat-views').textContent = match ? Number(match[1]).toLocaleString('vi-VN') : '0';
    } catch (_) {}
}

/* =========================================================
   2. TABS
   ========================================================= */
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('bg-forest', 'text-rustic-bg');
                t.classList.add('bg-white', 'border', 'border-forest/15', 'text-forest');
            });
            tab.classList.add('bg-forest', 'text-rustic-bg');
            tab.classList.remove('bg-white', 'border', 'border-forest/15', 'text-forest');

            panels.forEach(p => p.classList.add('hidden'));
            document.getElementById(`tab-${tab.dataset.tab}`)?.classList.remove('hidden');
        });
    });
}

/* =========================================================
   3. PROJECTS CRUD
   ========================================================= */
async function loadProjects() {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects?select=*&order=sort_order.asc,id.desc`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) return showToast('Không tải được danh sách dự án.', 'error');
    adminProjects = await res.json();
    document.getElementById('stat-projects').textContent = adminProjects.length;

    const listEl = document.getElementById('admin-projects-list');
    listEl.innerHTML = adminProjects.map(p => `
        <div class="bg-white border border-forest/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-[11px] font-mono px-2 py-0.5 ${p.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">
                        ${p.is_published ? 'Công khai' : 'Bản nháp'}
                    </span>
                    <span class="text-xs font-mono text-terracotta">${escapeHtml(p.category_label)}</span>
                    <span class="text-xs font-mono text-gray-400">#${p.sort_order}</span>
                </div>
                <h4 class="font-bold text-forest">${escapeHtml(p.title)}</h4>
                <p class="text-xs text-gray-600 mt-1 line-clamp-1">${escapeHtml(p.short_desc)}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick="editProject(${p.id})" class="px-3 py-1.5 text-xs font-semibold border border-forest/20 hover:border-forest text-forest">Sửa</button>
                <button type="button" onclick="toggleProjectPublish(${p.id}, ${!p.is_published})" class="px-3 py-1.5 text-xs font-semibold border border-forest/20 hover:border-terracotta text-terracotta">
                    ${p.is_published ? 'Ẩn' : 'Đăng'}
                </button>
                <button type="button" onclick="deleteProject(${p.id})" class="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-50">Xóa</button>
            </div>
        </div>
    `).join('') || '<p class="text-sm text-gray-500">Chưa có dự án nào.</p>';
}

function initProjectForm() {
    const form = document.getElementById('project-form');
    const newBtn = document.getElementById('new-project-btn');
    const cancelBtn = document.getElementById('cancel-project-btn');
    const titleInput = document.getElementById('proj-title');
    const slugInput = document.getElementById('proj-slug');

    titleInput?.addEventListener('input', () => {
        if (!document.getElementById('proj-id').value) {
            slugInput.value = slugify(titleInput.value);
        }
    });

    newBtn?.addEventListener('click', () => {
        form.reset();
        document.getElementById('proj-id').value = '';
        document.getElementById('proj-published').checked = true;
        document.getElementById('project-form-title').textContent = 'Thêm dự án mới';
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    cancelBtn?.addEventListener('click', () => form.classList.add('hidden'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const payload = {
            slug: document.getElementById('proj-slug').value.trim(),
            category: document.getElementById('proj-category').value,
            category_label: document.getElementById('proj-category-label').value.trim(),
            title: document.getElementById('proj-title').value.trim(),
            short_desc: document.getElementById('proj-short-desc').value.trim(),
            tags: document.getElementById('proj-tags').value.split(',').map(s => s.trim()).filter(Boolean),
            icon: document.getElementById('proj-icon').value,
            sort_order: Number(document.getElementById('proj-sort').value) || 0,
            is_published: document.getElementById('proj-published').checked,
            case_study: {
                challenge: document.getElementById('proj-challenge').value.trim(),
                solution: document.getElementById('proj-solution').value.trim(),
                architecture: document.getElementById('proj-arch').value.split('\n').map(s => s.trim()).filter(Boolean),
                impact: document.getElementById('proj-impact').value.split('\n').map(s => s.trim()).filter(Boolean)
            }
        };

        const url = id
            ? `${SUPABASE_CONFIG.url}/rest/v1/projects?id=eq.${id}`
            : `${SUPABASE_CONFIG.url}/rest/v1/projects`;
        const res = await fetch(url, {
            method: id ? 'PATCH' : 'POST',
            headers: getAuthHeaders({ Prefer: 'return=minimal' }),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            return showToast('Lưu dự án thất bại (kiểm tra slug có bị trùng không).', 'error');
        }
        form.classList.add('hidden');
        showToast(id ? 'Đã cập nhật dự án thành công!' : 'Đã thêm dự án mới thành công!');
        loadProjects();
    });
}

window.editProject = (id) => {
    const p = adminProjects.find(item => item.id === id);
    if (!p) return;
    document.getElementById('proj-id').value = p.id;
    document.getElementById('proj-title').value = p.title;
    document.getElementById('proj-slug').value = p.slug;
    document.getElementById('proj-category').value = p.category;
    document.getElementById('proj-category-label').value = p.category_label;
    document.getElementById('proj-icon').value = p.icon;
    document.getElementById('proj-sort').value = p.sort_order;
    document.getElementById('proj-short-desc').value = p.short_desc;
    document.getElementById('proj-tags').value = (p.tags || []).join(', ');
    document.getElementById('proj-challenge').value = p.case_study?.challenge || '';
    document.getElementById('proj-solution').value = p.case_study?.solution || '';
    document.getElementById('proj-arch').value = (p.case_study?.architecture || []).join('\n');
    document.getElementById('proj-impact').value = (p.case_study?.impact || []).join('\n');
    document.getElementById('proj-published').checked = Boolean(p.is_published);
    document.getElementById('project-form-title').textContent = `Chỉnh sửa: ${p.title}`;

    const form = document.getElementById('project-form');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.toggleProjectPublish = async (id, nextState) => {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects?id=eq.${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify({ is_published: nextState })
    });
    if (res.ok) {
        showToast(nextState ? 'Đã công khai dự án.' : 'Đã chuyển dự án về bản nháp.');
        loadProjects();
    }
};

window.deleteProject = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa dự án này?')) return;
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/projects?id=eq.${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (res.ok) {
        showToast('Đã xóa dự án.');
        loadProjects();
    }
};

/* =========================================================
   4. TREKKING LOGS CRUD
   ========================================================= */
async function loadTreks() {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/trekking_logs?select=*&order=sort_order.asc,id.desc`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) return showToast('Không tải được danh sách nhật ký.', 'error');
    adminTreks = await res.json();
    document.getElementById('stat-treks').textContent = adminTreks.length;

    const listEl = document.getElementById('admin-treks-list');
    listEl.innerHTML = adminTreks.map(t => `
        <div class="bg-white border border-forest/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
                <img src="${escapeHtml(t.image_url)}" alt="" class="w-16 h-16 object-cover bg-forest/10 shrink-0">
                <div>
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                        <span class="text-[11px] font-mono px-2 py-0.5 ${t.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}">
                            ${t.is_published ? 'Công khai' : 'Bản nháp'}
                        </span>
                        <span class="text-xs font-mono text-terracotta">${escapeHtml(t.tag)}</span>
                        ${t.featured ? '<span class="text-[11px] font-mono px-2 py-0.5 bg-amber-100 text-amber-800">★ Nổi bật</span>' : ''}
                    </div>
                    <h4 class="font-bold text-forest">${escapeHtml(t.title)}</h4>
                    <p class="text-xs text-gray-600 mt-1 line-clamp-1">${escapeHtml(t.excerpt)}</p>
                </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick="editTrek(${t.id})" class="px-3 py-1.5 text-xs font-semibold border border-forest/20 hover:border-forest text-forest">Sửa</button>
                <button type="button" onclick="toggleTrekPublish(${t.id}, ${!t.is_published})" class="px-3 py-1.5 text-xs font-semibold border border-forest/20 hover:border-terracotta text-terracotta">
                    ${t.is_published ? 'Ẩn' : 'Đăng'}
                </button>
                <button type="button" onclick="deleteTrek(${t.id})" class="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-50">Xóa</button>
            </div>
        </div>
    `).join('') || '<p class="text-sm text-gray-500">Chưa có bài viết nào.</p>';
}

function updateCoverPreview(url) {
    const wrap = document.getElementById('trek-cover-preview-wrap');
    const img = document.getElementById('trek-cover-preview');
    if (!wrap || !img) return;
    if (url && url.trim()) {
        img.src = url.trim();
        wrap.classList.remove('hidden');
    } else {
        wrap.classList.add('hidden');
    }
}

function initTrekForm() {
    const form = document.getElementById('trek-form');
    const newBtn = document.getElementById('new-trek-btn');
    const cancelBtn = document.getElementById('cancel-trek-btn');
    const titleInput = document.getElementById('trek-title');
    const slugInput = document.getElementById('trek-slug');
    const imageInput = document.getElementById('trek-image');
    const coverUpload = document.getElementById('trek-cover-upload');
    const previewBtn = document.getElementById('preview-trek-btn');
    const previewModal = document.getElementById('preview-modal');
    const closePreviewBtn = document.getElementById('close-preview-btn');

    titleInput?.addEventListener('input', () => {
        if (!document.getElementById('trek-id').value) {
            slugInput.value = slugify(titleInput.value);
        }
    });

    imageInput?.addEventListener('input', () => updateCoverPreview(imageInput.value));

    coverUpload?.addEventListener('change', async () => {
        const file = coverUpload.files?.[0];
        if (!file) return;
        const statusEl = document.getElementById('trek-cover-status');
        if (statusEl) statusEl.textContent = 'Đang tải ảnh bìa...';
        try {
            const url = await uploadImageToSupabase(file, 'covers');
            imageInput.value = url;
            updateCoverPreview(url);
            if (statusEl) statusEl.textContent = '✓ Đã tải ảnh bìa lên Supabase!';
        } catch (err) {
            showToast(err.message, 'error');
            if (statusEl) statusEl.textContent = '✗ Tải ảnh thất bại.';
        } finally {
            coverUpload.value = '';
        }
    });

    previewBtn?.addEventListener('click', () => {
        const title = titleInput.value.trim() || 'Chưa có tiêu đề';
        const imgUrl = imageInput.value.trim();
        const htmlContent = trekQuill ? trekQuill.root.innerHTML : '';
        const safeHtml = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(htmlContent) : htmlContent;
        document.getElementById('preview-modal-body').innerHTML = `
            <div class="space-y-5">
                ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="" class="w-full h-56 object-cover">` : ''}
                <h2 class="text-2xl font-bold text-forest">${escapeHtml(title)}</h2>
                <div class="article-prose">${safeHtml}</div>
            </div>
        `;
        previewModal.classList.remove('hidden');
        previewModal.classList.add('flex');
    });

    closePreviewBtn?.addEventListener('click', () => {
        previewModal.classList.add('hidden');
        previewModal.classList.remove('flex');
    });
    previewModal?.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.classList.add('hidden');
            previewModal.classList.remove('flex');
        }
    });

    newBtn?.addEventListener('click', () => {
        form.reset();
        document.getElementById('trek-id').value = '';
        document.getElementById('trek-published').checked = true;
        document.getElementById('trek-form-title').textContent = 'Viết nhật ký mới';
        if (trekQuill) trekQuill.setContents([]);
        updateCoverPreview('');
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    cancelBtn?.addEventListener('click', () => form.classList.add('hidden'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('trek-id').value;
        const contentHtml = trekQuill ? trekQuill.root.innerHTML.trim() : '';
        const plainText = trekQuill ? trekQuill.getText().trim() : '';
        if (!plainText && !contentHtml.includes('<img')) {
            return showToast('Vui lòng nhập nội dung bài viết.', 'error');
        }
        const paragraphs = plainText.split(/\n+/).map(s => s.trim()).filter(Boolean);

        const payload = {
            slug: document.getElementById('trek-slug').value.trim(),
            tag: document.getElementById('trek-tag').value.trim(),
            title: document.getElementById('trek-title').value.trim(),
            excerpt: document.getElementById('trek-excerpt').value.trim(),
            image_url: document.getElementById('trek-image').value.trim(),
            sort_order: Number(document.getElementById('trek-sort').value) || 0,
            is_published: document.getElementById('trek-published').checked,
            featured: document.getElementById('trek-featured').checked,
            stats: {
                elevation: document.getElementById('trek-elevation').value.trim() || '-',
                distance: document.getElementById('trek-distance').value.trim() || '-',
                difficulty: document.getElementById('trek-difficulty').value.trim() || '-',
                location: document.getElementById('trek-location').value.trim() || '-'
            },
            story: paragraphs,
            content_html: contentHtml
        };

        const url = id
            ? `${SUPABASE_CONFIG.url}/rest/v1/trekking_logs?id=eq.${id}`
            : `${SUPABASE_CONFIG.url}/rest/v1/trekking_logs`;
        const res = await fetch(url, {
            method: id ? 'PATCH' : 'POST',
            headers: getAuthHeaders({ Prefer: 'return=minimal' }),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            return showToast('Lưu bài viết thất bại (kiểm tra slug có bị trùng không).', 'error');
        }
        form.classList.add('hidden');
        showToast(id ? 'Đã cập nhật nhật ký!' : 'Đã đăng nhật ký mới thành công!');
        loadTreks();
    });
}

window.editTrek = (id) => {
    const t = adminTreks.find(item => item.id === id);
    if (!t) return;
    document.getElementById('trek-id').value = t.id;
    document.getElementById('trek-title').value = t.title;
    document.getElementById('trek-slug').value = t.slug;
    document.getElementById('trek-tag').value = t.tag;
    document.getElementById('trek-image').value = t.image_url;
    updateCoverPreview(t.image_url);
    document.getElementById('trek-sort').value = t.sort_order;
    document.getElementById('trek-elevation').value = t.stats?.elevation || '';
    document.getElementById('trek-distance').value = t.stats?.distance || '';
    document.getElementById('trek-difficulty').value = t.stats?.difficulty || '';
    document.getElementById('trek-location').value = t.stats?.location || '';
    document.getElementById('trek-excerpt').value = t.excerpt;
    if (trekQuill) {
        const htmlToLoad = t.content_html && t.content_html.trim()
            ? t.content_html
            : (t.story || []).map(p => `<p>${escapeHtml(p)}</p>`).join('');
        trekQuill.clipboard.dangerouslyPasteHTML(htmlToLoad);
    }
    document.getElementById('trek-published').checked = Boolean(t.is_published);
    document.getElementById('trek-featured').checked = Boolean(t.featured);
    document.getElementById('trek-form-title').textContent = `Chỉnh sửa: ${t.title}`;

    const form = document.getElementById('trek-form');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.toggleTrekPublish = async (id, nextState) => {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/trekking_logs?id=eq.${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify({ is_published: nextState })
    });
    if (res.ok) {
        showToast(nextState ? 'Đã đăng công khai bài viết.' : 'Đã ẩn bài viết.');
        loadTreks();
    }
};

window.deleteTrek = async (id) => {
    if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/trekking_logs?id=eq.${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (res.ok) {
        showToast('Đã xóa bài viết.');
        loadTreks();
    }
};

/* =========================================================
   5. SITE SETTINGS (PROFILE & SOCIAL LINKS)
   ========================================================= */
async function loadSettings() {
    const settings = await SupabaseAPI.fetchSiteSettings().catch(() => null);
    if (!settings) return;
    document.getElementById('set-email').value = settings.email || '';
    document.getElementById('set-facebook').value = settings.facebook_url || '';
    document.getElementById('set-zalo').value = settings.zalo_url || '';
    document.getElementById('set-tiktok').value = settings.tiktok_url || '';
    document.getElementById('set-linkedin').value = settings.linkedin_url || '';
    document.getElementById('set-github').value = settings.github_url || '';
}

function initSettingsForm() {
    document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            email: document.getElementById('set-email').value.trim(),
            facebook_url: document.getElementById('set-facebook').value.trim(),
            zalo_url: document.getElementById('set-zalo').value.trim(),
            tiktok_url: document.getElementById('set-tiktok').value.trim(),
            linkedin_url: document.getElementById('set-linkedin').value.trim(),
            github_url: document.getElementById('set-github').value.trim(),
            updated_at: new Date().toISOString()
        };
        const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/site_settings?id=eq.1`, {
            method: 'PATCH',
            headers: getAuthHeaders({ Prefer: 'return=minimal' }),
            body: JSON.stringify(payload)
        });
        if (!res.ok) return showToast('Lưu cấu hình thất bại.', 'error');
        showToast('Đã cập nhật hồ sơ & liên kết mạng xã hội!');
    });
}

/* =========================================================
   6. CONTACT MESSAGES INBOX
   ========================================================= */
async function loadMessages() {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contact_messages?select=*&order=created_at.desc`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) return;
    adminMessages = await res.json();
    document.getElementById('stat-messages').textContent = adminMessages.length;

    const listEl = document.getElementById('admin-messages-list');
    listEl.innerHTML = adminMessages.map(m => `
        <div class="bg-white border border-forest/15 p-5 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="font-bold text-forest">${escapeHtml(m.sender_name)}</span>
                    <a href="mailto:${escapeHtml(m.sender_email)}" class="text-xs font-mono text-terracotta ml-2 hover:underline">${escapeHtml(m.sender_email)}</a>
                    <span class="text-[11px] font-mono px-2 py-0.5 bg-forest/10 text-forest ml-2">${escapeHtml(m.topic)}</span>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs font-mono text-gray-400">${new Date(m.created_at).toLocaleString('vi-VN')}</span>
                    <button type="button" onclick="deleteMessage(${m.id})" class="text-xs text-red-600 hover:underline">Xóa</button>
                </div>
            </div>
            <p class="text-sm text-gray-700 whitespace-pre-line">${escapeHtml(m.message)}</p>
        </div>
    `).join('') || '<p class="text-sm text-gray-500">Chưa có lời nhắn nào.</p>';
}

window.deleteMessage = async (id) => {
    if (!confirm('Xóa lời nhắn này?')) return;
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contact_messages?id=eq.${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (res.ok) {
        showToast('Đã xóa lời nhắn.');
        loadMessages();
    }
};
