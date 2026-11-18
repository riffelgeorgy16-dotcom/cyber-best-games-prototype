import { useEffect, useState } from 'react';
import news from '../data/news.json';
import { CONFIG } from '../core/config';
import type { Crumb } from '../core/seo';
import { href } from './router';

const nav = (e: React.MouseEvent, to: string, onNav: (u: string) => void) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  onNav(to);
};
export { nav as onLinkClick };

/** Строка-эмулятор адреса: показывает URL, каким он будет на cyber.sports.ru, и принимает прямой ввод */
export function AddressBar({ url, onGo, mode }: { url: string; onGo: (u: string) => void; mode: string }) {
  const [val, setVal] = useState(CONFIG.host + url);
  useEffect(() => setVal(CONFIG.host + url), [url]);
  return (
    <form
      className="addr"
      onSubmit={(e) => {
        e.preventDefault();
        let v = val.trim().replace(/^https?:\/\/cyber\.sports\.ru/, '');
        if (!v.startsWith('/')) v = '/' + v;
        onGo(v);
      }}
    >
      <span className="addr-label" title={mode === 'hash' ? 'Артефакт: прямой адрес передается через якорь' : 'Настоящие пути'}>
        Прототип · адрес на сайте
      </span>
      <input className="addr-input" value={val} onChange={(e) => setVal(e.target.value)} spellCheck={false} aria-label="Адрес страницы" />
      <button className="addr-go" type="submit">Открыть</button>
    </form>
  );
}

// Пункты меню взяты с cyber.sports.ru. Ссылки только подтвержденные.
const TOP = [
  { t: 'Главная', u: 'https://cyber.sports.ru/' },
  { t: 'Игры', u: 'https://cyber.sports.ru/games/', active: true },
  { t: 'Календарь кино', u: 'https://cyber.sports.ru/cinema/calendar/' },
  { t: 'Рейтинг по CS 2', u: 'https://cyber.sports.ru/cs/ranking/' },
];
const SUB = [
  { t: 'Новости', u: 'https://cyber.sports.ru/games/news/' },
  { t: 'Посты', u: 'https://cyber.sports.ru/games/blogs/' },
  { t: 'Календарь игр', u: 'https://cyber.sports.ru/games/blogs/2477939.html' },
  { t: 'Список игр', u: 'https://cyber.sports.ru/tags/game/' },
  { t: 'Лучшие игры', u: '', current: true },
];

export function Header() {
  return (
    <header className="hdr">
      <div className="hdr-top">
        <div className="container hdr-row">
          <a className="logo" href="https://cyber.sports.ru/" aria-label="Кибер">
            К<span className="logo-i">И</span>БЕР
          </a>
          <nav className="topnav">
            {TOP.map((i) => (
              <a key={i.t} href={i.u} className={i.active ? 'on' : ''}>{i.t}</a>
            ))}
          </nav>
        </div>
      </div>
      <div className="hdr-sub">
        <div className="container subnav">
          {SUB.map((i) =>
            i.current ? (
              <a key={i.t} className="on" href={href(CONFIG.base)}>{i.t}</a>
            ) : (
              <a key={i.t} href={i.u}>{i.t}</a>
            ),
          )}
        </div>
      </div>
    </header>
  );
}

export function Breadcrumbs({ crumbs, onNav }: { crumbs: Crumb[]; onNav: (u: string) => void }) {
  return (
    <nav className="crumbs" aria-label="Хлебные крошки">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        const internal = c.path.startsWith(CONFIG.base);
        return (
          <span key={c.path}>
            {i > 0 && <span className="sep">/</span>}
            {last ? (
              <span className="cur">{c.name}</span>
            ) : internal ? (
              <a href={href(c.path)} onClick={(e) => nav(e, c.path, onNav)}>{c.name}</a>
            ) : (
              <a href={CONFIG.host + c.path}>{c.name}</a>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function NewsBlocks() {
  return (
    <section className="news">
      <div className="news-col">
        <h2 className="h2">Главные новости</h2>
        <ul>
          {news.news.map((n) => (
            <li key={n.url}><a href={n.url}>{n.title}</a><span className="muted"> · {n.date}</span></li>
          ))}
        </ul>
      </div>
      <div className="news-col">
        <h2 className="h2">Свежие записи в блогах</h2>
        <ul>
          {news.blogs.map((n) => (
            <li key={n.url}><a href={n.url}>{n.title}</a><span className="muted"> · {n.blog}</span></li>
          ))}
        </ul>
      </div>
      <p className="muted small">Снимок ссылок Кибера на {news.snapshot}. В рабочей версии блоки заполняются из CMS.</p>
    </section>
  );
}

export function Footer({ total }: { total: number }) {
  return (
    <footer className="ftr">
      <div className="container">
        Прототип каталога лучших игр для Кибера. Не публичная страница. Игр в наборе: {total}. Данные на {CONFIG.dataSnapshot}.
      </div>
    </footer>
  );
}
