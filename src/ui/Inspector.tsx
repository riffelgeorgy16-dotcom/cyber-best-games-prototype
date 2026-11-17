import { useState } from 'react';
import { CONFIG } from '../core/config';
import type { PageSlice } from '../core/catalog';
import type { PageSeo } from '../core/seo';
import type { CatalogState, Dictionaries, Issue } from '../core/types';
import { MODE } from './router';

export interface RouteEvent { type: '301'; from: string; to: string; reason: string }

const STATUS: Record<PageSeo['indexStatus'], string> = {
  index: 'Индексируется (3 и более игр)',
  'noindex-few': 'noindex: меньше 3 игр (страница не продвигается)',
  'noindex-search': 'noindex: результаты поиска',
  'noindex-empty': 'noindex: игр не найдено, canonical на главную каталога',
};

function Row({ k, v, mono }: { k: string; v?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="ins-row">
      <div className="ins-k">{k}</div>
      <div className={'ins-v' + (mono ? ' mono' : '')}>{v ?? <span className="muted">нет</span>}</div>
    </div>
  );
}

export function Inspector(p: {
  url: string; state: CatalogState | null; seo: PageSeo | null; slice: PageSlice; issues: Issue[];
  dicts: Dictionaries; notFound: string | null; routeEvent: RouteEvent | null; emptyNotice: string | null;
}) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('seo-ins') === '1'; } catch { return false; } });
  const [tab, setTab] = useState<'main' | 'checks' | 'itemlist' | 'bc'>('main');
  const toggle = () => { setOpen(!open); try { localStorage.setItem('seo-ins', open ? '0' : '1'); } catch { /* */ } };
  const errors = p.issues.filter((i) => i.level === 'error').length;
  const warns = p.issues.filter((i) => i.level === 'warning').length;
  const { seo, state, slice } = p;

  return (
    <>
      <button className={'ins-toggle' + (errors ? ' bad' : '')} onClick={toggle} aria-expanded={open}>
        SEO-инспектор {errors > 0 ? `· ошибок ${errors}` : '· ошибок нет'}{warns > 0 && ` · предупр. ${warns}`}
      </button>
      {open && (
        <aside className="ins" aria-label="SEO-инспектор">
          <div className="ins-head">
            <b>SEO-инспектор</b>
            <span className="muted small">только для тестирования, не часть сайта</span>
            <button className="ins-x" onClick={toggle} aria-label="Закрыть">×</button>
          </div>
          <div className="ins-tabs">
            {([['main', 'Страница'], ['checks', `Проверки (${errors}/${warns})`], ['itemlist', 'ItemList'], ['bc', 'BreadcrumbList']] as const).map(([k, t]) => (
              <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{t}</button>
            ))}
          </div>
          <div className="ins-body">
            {p.routeEvent && (
              <div className="ins-note">Имитация 301: {p.routeEvent.from} → {p.routeEvent.to} ({p.routeEvent.reason})</div>
            )}
            {p.emptyNotice && (
              <div className="ins-note">Пустой результат ({p.emptyNotice}): сообщение без смены URL и метатегов, как в ТЗ</div>
            )}
            {p.notFound ? (
              <>
                <Row k="Текущий URL" v={CONFIG.host + p.url} mono />
                <Row k="HTTP-статус (имитация)" v="404" />
                <Row k="Причина" v={p.notFound} />
                <Row k="Robots" v="noindex, follow" mono />
              </>
            ) : seo && state && tab === 'main' ? (
              <>
                <Row k="Текущий URL" v={CONFIG.host + p.url} mono />
                <Row k="Title" v={seo.title} />
                <Row k="Description" v={seo.description} />
                <Row k="H1" v={seo.h1} />
                <Row k="Canonical" v={seo.canonical} mono />
                <Row k="Robots" v={seo.robots} mono />
                <Row k="rel=prev" v={seo.prev} mono />
                <Row k="rel=next" v={seo.next} mono />
                <Row k="rel=alternate (моб.)" v={seo.alternateMobile} mono />
                <Row k="canonical моб. версии" v={seo.mobileCanonical} mono />
                <Row k="Хлебные крошки" v={seo.breadcrumbs.map((c) => c.name).join(' / ')} />
                <Row k="Активные фильтры" v={[
                  state.genre && 'жанр: ' + p.dicts.genres[state.genre].name,
                  state.platform && 'платформа: ' + p.dicts.platforms[state.platform].name,
                  state.year && 'год: ' + state.year,
                  state.q && 'поиск: ' + state.q,
                ].filter(Boolean).join(', ') || 'нет'} />
                <Row k="Подходящих игр" v={slice.total} />
                <Row k="Игр на странице" v={`${slice.items.length} (позиции ${slice.items.length ? slice.offset + 1 : 0}-${slice.offset + slice.items.length}), страниц: ${slice.pages}`} />
                <Row k="Статус индексации" v={STATUS[seo.indexStatus]} />
                <Row k="Шаблон мета" v={seo.template.source === 'exact' ? `индивидуальный${seo.template.row ? ', строка ' + seo.template.row : ''}` : seo.template.source === 'pattern' ? `шаблон с переменными, строка ${seo.template.row}` : 'нет в таблице, резервный'} />
                <Row k="Маршрутизация" v={MODE === 'hash' ? 'артефакт: адрес через якорь' : 'настоящие пути'} />
              </>
            ) : seo && tab === 'checks' ? (
              <Checks issues={p.issues} />
            ) : seo && tab === 'itemlist' ? (
              <pre className="json">{JSON.stringify(seo.itemList, null, 2)}</pre>
            ) : seo && tab === 'bc' ? (
              <pre className="json">{JSON.stringify(seo.breadcrumbList, null, 2)}</pre>
            ) : null}
          </div>
        </aside>
      )}
    </>
  );
}

const LV: Record<Issue['level'], string> = { error: 'Ошибка', warning: 'Предупреждение', limitation: 'Ограничение прототипа', info: 'Инфо' };
function Checks({ issues }: { issues: Issue[] }) {
  const order: Issue['level'][] = ['error', 'warning', 'info', 'limitation'];
  const errs = issues.filter((i) => i.level === 'error');
  return (
    <div>
      {errs.length === 0 && <div className="chk ok">Ошибок по правилам ТЗ нет</div>}
      {order.flatMap((l) => issues.filter((i) => i.level === l)).map((i, n) => (
        <div key={n} className={'chk ' + i.level}>
          <div className="chk-h"><span className="chk-l">{LV[i.level]}</span> {i.what}</div>
          {i.expected !== undefined && <div className="chk-d">Ожидалось: <code>{i.expected}</code></div>}
          {i.actual !== undefined && <div className="chk-d">Фактически: <code>{i.actual}</code></div>}
        </div>
      ))}
    </div>
  );
}
