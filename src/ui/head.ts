import type { PageSeo } from '../core/seo';

// Применяет SEO-параметры к <head>. На сайте это должен делать сервер.
function setLink(rel: string, hrefVal?: string, extra: Record<string, string> = {}) {
  const sel = `link[rel="${rel}"]` + Object.entries(extra).map(([k, v]) => `[${k}="${v}"]`).join('');
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!hrefVal) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.href = hrefVal;
}
function setMeta(name: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}
function setJson(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; document.head.appendChild(el); }
  el.textContent = JSON.stringify(data, null, 2);
}

export function applyHead(seo: PageSeo | null, notFound = false) {
  if (notFound || !seo) {
    document.title = 'Страница не найдена - Кибер';
    setMeta('robots', 'noindex, follow');
    setMeta('description', '');
    ['canonical', 'prev', 'next'].forEach((r) => setLink(r));
    document.getElementById('ld-itemlist')?.remove();
    document.getElementById('ld-breadcrumbs')?.remove();
    return;
  }
  document.title = seo.title;
  setMeta('description', seo.description);
  // Размещенный прототип всегда закрыт от индексации; расчетное значение - в x-prototype-robots и в инспекторе
  setMeta('robots', import.meta.env.VITE_FORCE_NOINDEX ? 'noindex, nofollow' : seo.robots);
  setMeta('x-prototype-robots', seo.robots);
  setLink('canonical', seo.canonical);
  setLink('prev', seo.prev);
  setLink('next', seo.next);
  setJson('ld-itemlist', seo.itemList);
  setJson('ld-breadcrumbs', seo.breadcrumbList);
}
