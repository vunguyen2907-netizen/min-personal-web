/**
 * SUPABASE CLIENT (REST API với Publishable Key)
 * Kết nối trực tiếp tới project Supabase: min-personal-web
 */

const SUPABASE_CONFIG = {
    url: 'https://hlsxhrtwqlqxsmzqfigc.supabase.co',
    publishableKey: 'sb_publishable_-JyOF_BoQSYoya6R_GP73Q_SusmmCND'
};

const SupabaseAPI = (() => {
    const baseHeaders = {
        apikey: SUPABASE_CONFIG.publishableKey,
        'Content-Type': 'application/json'
    };

    async function fetchProjects() {
        const res = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/projects?select=slug,category,category_label,title,short_desc,tags,icon,case_study&is_published=eq.true&order=sort_order.asc`,
            { headers: baseHeaders }
        );
        if (!res.ok) throw new Error(`Projects fetch failed (${res.status})`);
        const rows = await res.json();
        return rows.map(row => ({
            id: row.slug,
            category: row.category,
            categoryLabel: row.category_label,
            title: row.title,
            shortDesc: row.short_desc,
            tags: row.tags || [],
            icon: row.icon || 'code',
            caseStudy: row.case_study
        }));
    }

    async function fetchTrekkingLogs() {
        const res = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/trekking_logs?select=slug,tag,title,excerpt,image_url,featured,stats,story,content_html&is_published=eq.true&order=sort_order.asc`,
            { headers: baseHeaders }
        );
        if (!res.ok) throw new Error(`Trekking logs fetch failed (${res.status})`);
        const rows = await res.json();
        return rows.map(row => ({
            id: row.slug,
            tag: row.tag,
            title: row.title,
            excerpt: row.excerpt,
            image: row.image_url,
            featured: Boolean(row.featured),
            stats: row.stats,
            story: row.story || [],
            contentHtml: row.content_html || ''
        }));
    }

    async function recordAndGetPageViews(pagePath = '/') {
        const sessionKey = `min_web_viewed_${pagePath}`;
        if (!sessionStorage.getItem(sessionKey)) {
            const postRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/page_view_events`, {
                method: 'POST',
                headers: { ...baseHeaders, Prefer: 'return=minimal' },
                body: JSON.stringify({ page_path: pagePath })
            });
            if (postRes.ok) {
                sessionStorage.setItem(sessionKey, '1');
            }
        }

        const countRes = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/page_view_events?select=id&page_path=eq.${encodeURIComponent(pagePath)}&limit=1`,
            {
                headers: {
                    ...baseHeaders,
                    Prefer: 'count=exact'
                }
            }
        );
        if (!countRes.ok) throw new Error(`View count fetch failed (${countRes.status})`);

        const contentRange = countRes.headers.get('content-range') || '';
        const totalMatch = contentRange.match(/\/(\d+)$/);
        return totalMatch ? Number(totalMatch[1]) : null;
    }

    async function submitContactMessage({ sender_name, sender_email, topic, message }) {
        const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/contact_messages`, {
            method: 'POST',
            headers: { ...baseHeaders, Prefer: 'return=minimal' },
            body: JSON.stringify({
                sender_name: sender_name.trim(),
                sender_email: sender_email.trim(),
                topic,
                message: message.trim()
            })
        });
        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            throw new Error(detail || `Submit failed (${res.status})`);
        }
        return true;
    }

    async function fetchSiteSettings() {
        const res = await fetch(
            `${SUPABASE_CONFIG.url}/rest/v1/site_settings?select=display_name,email,facebook_url,zalo_url,tiktok_url,linkedin_url,github_url&id=eq.1&limit=1`,
            { headers: baseHeaders }
        );
        if (!res.ok) throw new Error(`Settings fetch failed (${res.status})`);
        const rows = await res.json();
        return rows[0] || null;
    }

    return {
        fetchProjects,
        fetchTrekkingLogs,
        fetchSiteSettings,
        recordAndGetPageViews,
        submitContactMessage
    };
})();
