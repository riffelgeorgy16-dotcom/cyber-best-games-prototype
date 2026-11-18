import { useEffect, useRef, useState } from 'react';

const TEMPLATE = `Для подачи заявки на добавление игры укажите:
Название:
Ссылка на страницу в магазине (Steam/EGS/GOG/PSN и т.п.):
Ссылка на официальный сайт (при наличии):
Жанр и платформы:
Дата выхода:
Ниже можно указать ссылки на материалы об игре, прикрепить обложку в формате 2x3 или написать несколько строк об игре. Это ускорит рассмотрение заявки.`;

const TOPICS = ['Добавить игру в каталог', 'Ошибка в данных об игре', 'Другое'];

/** Кнопка и окно заявки. В прототипе заявка никуда не отправляется. */
export function AddGameButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-add" onClick={() => setOpen(true)}>+ Добавить игру</button>
      {open && <AddGameModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AddGameModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(TEMPLATE);
  const [files, setFiles] = useState<File[]>([]);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const first = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    first.current?.focus();
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);

  const summary = `Тема: ${topic}\nEmail: ${email}\nФайлы: ${files.map((f) => f.name).join(', ') || 'нет'}\n\n${msg}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.push('Укажите корректный email');
    if (msg.trim() === TEMPLATE.trim() || msg.trim().length < 30) errs.push('Заполните сообщение: хотя бы название игры и ссылку на магазин');
    if (!agree) errs.push('Нужно согласие на обработку персональных данных');
    setErrors(errs);
    if (!errs.length) setDone(true);
  };

  return (
    <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="addgame-title">
        <div className="modal-head">
          <h2 id="addgame-title">Добавить игру</h2>
          <button className="modal-x" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        {done ? (
          <div className="modal-body">
            <p className="ok-msg">Заявка сформирована.</p>
            <p className="proto-note">Это прототип: заявка никуда не отправлена. В рабочей версии она уходит в редакцию или в форму поддержки Кибера.</p>
            <pre className="json">{summary}</pre>
            <div className="modal-actions">
              <button className="btn" onClick={() => { navigator.clipboard?.writeText(summary).then(() => setCopied(true)).catch(() => setCopied(false)); }}>
                {copied ? 'Скопировано' : 'Скопировать текст заявки'}
              </button>
              <button className="btn btn-ghost" onClick={onClose}>Закрыть</button>
            </div>
          </div>
        ) : (
          <form className="modal-body" onSubmit={submit} noValidate>
            <label className="fld">
              <span>Тема сообщения</span>
              <select ref={first} value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="fld">
              <span>Ваш email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email, на который придет ответ" />
            </label>
            <label className="fld">
              <span>Сообщение</span>
              <textarea rows={9} value={msg} onChange={(e) => setMsg(e.target.value)} />
            </label>
            <label className="fld">
              <span>Обложка или материалы</span>
              <input type="file" multiple accept="image/*,.pdf" onChange={(e) => setFiles([...(e.target.files ?? [])])} />
            </label>
            <label className="chk-agree">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>Даю согласие на обработку персональных данных</span>
            </label>
            {errors.length > 0 && <ul className="form-errors">{errors.map((x) => <li key={x}>{x}</li>)}</ul>}
            <div className="modal-actions">
              <button className="btn" type="submit">Отправить</button>
              <span className="proto-note">В прототипе отправка имитируется</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
