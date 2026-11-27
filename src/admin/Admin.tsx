import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../core/config';
import type { Game } from '../core/types';
import { href } from '../ui/router';
import { defaultAdmin, effectiveDictionaries, effectiveGames, parseAdmin, type AdminState } from './model';
import { saveRevision, type Change, type Revision } from './storage';
import { Blocks, CollectionsEditor, FilterEditor, GameOrder } from './Controls';
import { Editorial } from './Editorial';
import { Games } from './Games';
import { Transfer } from './Transfer';
import { Input } from './fields';
import './admin.css';

const tabs = ['SEO', 'Игры', 'Порядок игр', 'Фильтры', 'Подборки', 'Блоки страницы', 'SEO-тексты', 'Импорт и экспорт', 'Настройки', 'История изменений'] as const;
type Tab = typeof tabs[number];

function differences(event: Change) {
  const keys = Object.keys(event.before) as (keyof AdminState)[];
  return Object.fromEntries(keys.filter(k => JSON.stringify(event.before[k]) !== JSON.stringify(event.after[k]))
    .map(k => [k, { previous: event.before[k], next: event.after[k] }]));
}

export function Admin({ initial, warning, onSave, onPreview }: {
  initial: Revision; warning?: string; onSave: (revision: Revision) => void; onPreview: (draft: AdminState) => void;
}) {
  const [draft, set] = useState(initial.state);
  const [tab, go] = useState<Tab>('SEO');
  const [selected, select] = useState<Set<string>>(new Set());
  const [message, report] = useState('');
  const [error, fail] = useState('');
  const [saving, lock] = useState(false);
  const [resetKey, resetChild] = useState(0);
  const dirty = draft !== initial.state;
  const dict = useMemo(() => effectiveDictionaries(draft), [draft]);
  const games = useMemo(() => effectiveGames(draft), [draft]);

  useEffect(() => {
    document.title = 'Управление каталогом — Кибер';
    let tag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!tag) { tag = document.createElement('meta'); tag.name = 'robots'; document.head.append(tag); }
    tag.content = 'noindex, nofollow';
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const listener = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', listener);
    return () => window.removeEventListener('beforeunload', listener);
  }, [dirty]);

  const change = (next: AdminState) => { set(next); report(''); fail(''); };
  const apply = (game: Game) => change({ ...draft, games: { ...draft.games, [game.id]: game } });
  const save = async (state: AdminState, entity: string, name: string) => {
    if (saving) return;
    lock(true); fail(''); report('');
    try {
      const clean = parseAdmin(state);
      const revision = await saveRevision(initial, clean, entity, name);
      onSave(revision); set(revision.state); report('Изменения сохранены в этом браузере.');
    } catch (e) { fail('Сохранение не выполнено. ' + (e instanceof Error ? e.message : String(e))); }
    finally { lock(false); }
  };
  const saveDraft = () => {
    const changedGames = Object.values(draft.games).filter(g => g !== initial.state.games[g.id]);
    const changedKeys = (Object.keys(draft) as (keyof AdminState)[]).filter(key => draft[key] !== initial.state[key]);
    const entity = changedKeys.length === 1 ? ({
      version: 'Настройки', games: 'Игры', pages: 'SEO страниц', templates: 'Шаблоны',
      filters: 'Фильтры', pins: 'Закрепления', upper: 'Верхние подборки', lower: 'Нижние подборки',
      blocks: 'Блоки', blockOrder: 'Порядок блоков', settings: 'Настройки',
    }[changedKeys[0]]) : 'Несколько разделов';
    void save(draft, entity, changedGames.length === 1 ? changedGames[0].name : changedGames.length ? 'Игры (' + changedGames.length + ')' : tab);
  };
  const restore = (entry: Change) => {
    if (confirm('Восстановить состояние до изменения «' + entry.name + '»? Текущая версия останется в истории.')) {
      resetChild(resetKey + 1);
      void save(entry.before, 'Восстановление', entry.name);
    }
  };
  const updateBlock = (key: 'recent' | 'upcoming', limit: number) =>
    change({ ...draft, blocks: { ...draft.blocks, [key]: { ...draft.blocks[key], limit } } });
  const page = {
    SEO: <Editorial draft={draft} dict={dict} change={change} />,
    'Игры': <Games games={games} dict={dict} selected={selected} setSelected={select} apply={apply} />,
    'Порядок игр': <GameOrder games={games} dict={dict} draft={draft} change={change} apply={apply} />,
    'Фильтры': <FilterEditor draft={draft} change={change} />,
    'Подборки': <CollectionsEditor draft={draft} change={change} />,
    'Блоки страницы': <Blocks draft={draft} games={games} change={change} />,
    'SEO-тексты': <Editorial onlyText draft={draft} dict={dict} change={change} />,
    'Импорт и экспорт': <Transfer draft={draft} dict={dict} games={games} selected={selected} change={change} />,
    'Настройки': <div className="adm-form"><h2>Настройки</h2>
      <Input label="Игр на страницу (1–100)" type="number" value={draft.settings.perPage}
        change={v => change({ ...draft, settings: { ...draft.settings, perPage: +v } })} />
      <Input label="Минимум для индексации (3–100)" type="number" value={draft.settings.minIndexable}
        change={v => change({ ...draft, settings: { ...draft.settings, minIndexable: +v } })} />
      <p className="adm-note">Порог можно увеличить. Поиск, пустые страницы и страницы с пользовательскими параметрами закрываются по действующим правилам.</p>
      <Input label="Недавних релизов в блоке" type="number" value={draft.blocks.recent.limit} change={v => updateBlock('recent', +v)} />
      <Input label="Ожидаемых релизов в блоке" type="number" value={draft.blocks.upcoming.limit} change={v => updateBlock('upcoming', +v)} />
      <Input label="Период недавних релизов (1–365 дней)" type="number" value={draft.settings.recentDays}
        change={v => change({ ...draft, settings: { ...draft.settings, recentDays: +v } })} />
      <button className="adm-danger" onClick={() => {
        if (confirm('Восстановить исходные игры и настройки в черновике?')) { resetChild(resetKey + 1); change(defaultAdmin); }
      }}>Восстановить исходные данные</button>
    </div>,
    'История изменений': <div className="adm-form"><h2>История изменений</h2>
      <p>Последние 25 сохранений в этом браузере.</p>
      {!initial.history.length && <p>Изменений пока нет.</p>}
      {initial.history.map(entry => <details className="adm-story" key={entry.id}>
        <summary>{new Date(entry.at).toLocaleString('ru-RU')} · {entry.entity} · {entry.name}</summary>
        <p>Предыдущие и новые значения</p>
        <pre>{JSON.stringify(differences(entry), (key, value) => typeof value === 'string' && value.startsWith('data:image/') ? '[встроенное изображение]' : value, 2)}</pre>
        <button disabled={saving} className="adm-extra" onClick={() => restore(entry)}>Восстановить предыдущую версию</button>
      </details>)}
    </div>,
  };
  return <main className="admin">
    <header className="adm-header"><h1>Управление каталогом игр</h1>
      <p>Прототип редакционного интерфейса. Изменения хранятся в этом браузере.</p>
      <div className="adm-actions">
        <button className="adm-primary" disabled={!dirty || saving || !!warning} onClick={saveDraft}>{saving ? 'Сохранение…' : 'Сохранить'}</button>
        <button className="adm-extra" disabled={saving} onClick={() => {
          try { onPreview(parseAdmin(draft)); } catch (e) { fail(e instanceof Error ? e.message : String(e)); }
        }}>Предпросмотр каталога</button>
        <button disabled={saving} onClick={() => {
          if (dirty && !confirm('Отменить несохранённые изменения?')) return;
          change(initial.state); resetChild(resetKey + 1);
        }}>Отменить несохранённые изменения</button>
        <a href={href(CONFIG.base)}>Вернуться в каталог</a>
      </div>
      {dirty && <p className="adm-note">Есть несохранённые изменения.</p>}
      {(error || warning) && <p role="alert" className="adm-error">{error || warning}</p>}
      {message && <p role="status" className="adm-success">{message}</p>}
    </header>
    <nav className="adm-tabs" aria-label="Разделы администрирования">{tabs.map(item =>
      <button key={item} aria-current={tab === item ? 'page' : undefined} onClick={() => go(item)}>{item}</button>)}</nav>
    <section className="adm-content" key={tab + resetKey}>{page[tab]}</section>
  </main>;
}
