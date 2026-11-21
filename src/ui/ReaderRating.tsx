import { useEffect, useRef, useState } from 'react';
import type { Game } from '../core/types';
import './ReaderRating.css';

const CRITERIA = [
  { key: 'gameplay', label: 'Геймплей', weight: 30 },
  { key: 'visual', label: 'Графика и художественный стиль', weight: 20 },
  { key: 'story', label: 'Сюжет', weight: 12 },
  { key: 'technical', label: 'Техническое состояние', weight: 10 },
  { key: 'emotion', label: 'Эмоциональное воздействие', weight: 10 },
  { key: 'characters', label: 'Персонажи', weight: 3 },
  { key: 'pacing', label: 'Темп и продолжительность', weight: 5 },
  { key: 'music', label: 'Музыкальное сопровождение', weight: 5 },
  { key: 'genre', label: 'Реализация жанра', weight: 5 },
] as const;

type Criterion = typeof CRITERIA[number]['key'];
type Scores = Partial<Record<Criterion, number>>;
type RatingMode = 'quick' | 'detailed';

export type ReaderRating = {
  score: number;
} & ({ mode: 'quick' } | { mode: 'detailed'; criteria: Scores });

const SCALE = Array.from({ length: 10 }, (_, index) => index + 1);
const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

export function readerScore(score: number) {
  return number.format(score);
}

type RatingDialogProps = {
  game: Game;
  signedIn: boolean;
  saved?: ReaderRating;
  onSignIn: () => void;
  onSave: (rating: ReaderRating) => void;
  onClose: () => void;
};

export function RatingDialog({ game, signedIn, saved, onSignIn, onSave, onClose }: RatingDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<RatingMode>(saved?.mode ?? 'quick');
  const [quick, setQuick] = useState<number | undefined>(saved?.mode === 'quick' ? saved.score : undefined);
  const [scores, setScores] = useState<Scores>(saved?.mode === 'detailed' ? saved.criteria : {});
  const rated = CRITERIA.filter(({ key }) => scores[key] !== undefined);
  const weight = rated.reduce((sum, item) => sum + item.weight, 0);
  const weighted = rated.reduce((sum, item) => sum + (scores[item.key] ?? 0) * item.weight, 0);
  const preview = weight ? Math.round(weighted * 10 / weight) / 10 : undefined;
  const complete = rated.length === CRITERIA.length;
  const score = mode === 'quick' ? quick : preview;
  const canSave = score !== undefined && (mode === 'quick' || complete);

  useEffect(() => {
    const opener = document.activeElement;
    const modal = dialog.current;
    if (!modal?.open) modal?.showModal();
    return () => {
      modal?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    title.current?.focus();
  }, [signedIn]);

  return (
    <dialog className="rating-dialog" ref={dialog} aria-labelledby="reader-rating-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="rating-sheet">
        <header className="rating-head">
          {game.cover && <img className="rating-cover" src={game.cover} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
          <div>
            <h2 id="reader-rating-title" ref={title} tabIndex={-1}>
              {signedIn ? (saved ? 'Изменить оценку' : 'Оценить игру') : 'Войдите, чтобы оценить игру'}
            </h2>
            <p>{game.name}</p>
          </div>
          <button type="button" className="rating-close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>

        {signedIn ? (
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!canSave || score === undefined) return;
            onSave(mode === 'quick' ? { mode, score } : { mode, score, criteria: scores });
          }}>
            <fieldset className="rating-modes">
              <legend className="rating-sr">Способ оценки</legend>
              {([{ value: 'quick', label: 'Быстрая оценка' }, { value: 'detailed', label: 'По критериям' }] as const).map((option) => (
                <label key={option.value}>
                  <input type="radio" name="rating-mode" checked={mode === option.value} onChange={() => setMode(option.value)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>

            {mode === 'quick' ? (
              <fieldset className="rating-quick">
                <legend>Как тебе игра?</legend>
                <div className="rating-scale">
                  {SCALE.map((value) => (
                    <label key={value}>
                      <input type="radio" name="quick-score" checked={quick === value} onChange={() => setQuick(value)} />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
                <div className="rating-scale-labels" aria-hidden="true"><span>Очень плохо</span><span>Отлично</span></div>
              </fieldset>
            ) : (
              <div className="rating-criteria">
                {CRITERIA.map(({ key, label, weight }) => (
                  <label className="rating-criterion" key={key}>
                    <span>{label}</span>
                    <span className="rating-weight" title="Вес критерия">{weight}%</span>
                    <select aria-label={label} value={scores[key] ?? ''} onChange={(event) => {
                      const value = event.target.value;
                      setScores((previous) => ({ ...previous, [key]: value ? Number(value) : undefined }));
                    }}>
                      <option value="">—</option>
                      {SCALE.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <footer className="rating-actions">
              <div aria-live="polite" className="rating-total">
                <span>{mode === 'detailed' && !complete ? 'Предварительно' : 'Моя оценка'}</span>
                <strong>{score === undefined ? '—' : readerScore(score)} <small>/ 10</small></strong>
              </div>
              <div className="rating-submit">
                <button className="btn" type="submit" disabled={!canSave}>Сохранить оценку</button>
                {mode === 'detailed' && !complete && <span>Заполнено {rated.length} из {CRITERIA.length}</span>}
              </div>
            </footer>
          </form>
        ) : (
          <div className="rating-login">
            <p>Оценка будет доступна только тебе в разделе «Мои оценки».</p>
            <button type="button" className="btn" onClick={onSignIn}>Войти или зарегистрироваться</button>
            <p className="rating-demo-note">В макете эта кнопка сразу открывает оценку. Данные аккаунта не нужны.</p>
          </div>
        )}
      </div>
    </dialog>
  );
}
