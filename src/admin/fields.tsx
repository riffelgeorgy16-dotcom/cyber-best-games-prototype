import { useMemo, useState, type ReactNode } from 'react';
import { matchesName, normalize } from '../core/catalog';
import type { CatalogState, Dictionaries, Game } from '../core/types';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="adm-field"><span>{label}</span>{children}</label>;
}

export function Input({ label, value = '', change, type = 'text', readOnly = false }: {
  label: string; value?: string | number; change?: (v: string) => void; type?: string; readOnly?: boolean;
}) {
  return <Field label={label}><input type={type} value={value} onChange={e => change?.(e.target.value)}
    onInput={type === 'date' ? e => change?.(e.currentTarget.value) : undefined}
    onBlur={type === 'date' ? e => change?.(e.currentTarget.value) : undefined} readOnly={readOnly} /></Field>;
}

export function Toggle({ label, checked, change }: { label: string; checked: boolean; change: (v: boolean) => void }) {
  return <label className="adm-toggle"><input type="checkbox" checked={checked} onChange={e => change(e.target.checked)} />{label}</label>;
}

export function Choice({ label, value, change, options, empty }: {
  label: string; value: string; change: (v: string) => void; options: { id: string; label: string }[]; empty?: string;
}) {
  return <Field label={label}><select value={value} onChange={e => change(e.target.value)}>
    {empty !== undefined && <option value="">{empty}</option>}
    {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
  </select></Field>;
}

export const dictionaryOptions = (dict: object) => Object.values(dict).map((item: { slug: string; name: string }) =>
  ({ id: item.slug, label: item.name }));

export function ChoiceChecks({ label, options, values, change }: {
  label: string; options: { id: string; label: string }[]; values: string[]; change: (v: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const query = normalize(search);
  const visible = options.filter(option => normalize(option.label).includes(query));
  return <fieldset className="adm-choice-checks">
    <legend>{label} · выбрано {values.length}</legend>
    <Input label={'Поиск: ' + label.toLowerCase()} type="search" value={search} change={setSearch} />
    <div className="adm-choice-list">
      {visible.map(option => <Toggle key={option.id} label={option.label}
        checked={values.includes(option.id)}
        change={checked => change(checked ? [...values, option.id] : values.filter(id => id !== option.id))} />)}
      {!visible.length && <small>Совпадений нет.</small>}
    </div>
  </fieldset>;
}

export function PagePicker({ page, change, dict }: {
  page: CatalogState; change: (v: CatalogState) => void; dict: Dictionaries;
}) {
  return <div className="adm-row">
    <Choice label="Жанр" value={page.genre ?? ''} empty="Все жанры" options={dictionaryOptions(dict.genres)} change={v => change({ ...page, genre: v || undefined })} />
    <Choice label="Платформа" value={page.platform ?? ''} empty="Все платформы" options={dictionaryOptions(dict.platforms)} change={v => change({ ...page, platform: v || undefined })} />
    <Choice label="Год" value={page.year ?? ''} empty="Все годы" options={(dict.catalogYears ?? dict.filter_lists.years).map(id => ({ id, label: dict.yearLabels?.[id] ?? id }))} change={v => change({ ...page, year: v || undefined })} />
  </div>;
}

export function GameChoices({ games, value, change, searchLabel }: {
  games: Game[]; value: string; change: (v: string) => void; searchLabel: string;
}) {
  const [search, setSearch] = useState('');
  const sorted = useMemo(() => [...games].sort((a, b) => a.name.localeCompare(b.name, 'ru')), [games]);
  const query = normalize(search);
  const matches = sorted.filter(g => matchesName(g, query) || g.id.includes(search.trim().toLowerCase()));
  const selected = sorted.find(g => g.id === value);
  const options = selected && !matches.includes(selected) ? [selected, ...matches] : matches;
  return <div className="adm-row">
    <Input label={searchLabel} type="search" value={search} change={setSearch} />
    <Choice label="Игра" value={value} change={change} empty={matches.length ? 'Выберите игру' : 'Совпадений нет'}
      options={options.map(g => ({ id: g.id, label: g.name + ' · ' + g.id }))} />
  </div>;
}

export function Move({ index, count, change }: { index: number; count: number; change: (v: number) => void }) {
  return <span className="adm-actions"><button type="button" aria-label="Выше" disabled={!index} onClick={() => change(index - 1)}>↑</button>
    <button type="button" aria-label="Ниже" disabled={index >= count - 1} onClick={() => change(index + 1)}>↓</button></span>;
}

export function move<T>(items: T[], from: number, to: number) {
  const list = [...items];
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
  return list;
}

export function ImageField({ label, value, change }: { label: string; value?: string; change: (image: string) => void }) {
  const [error, setError] = useState('');
  const raster = /^data:image\/(png|jpeg|webp|gif|avif);base64,/i;
  return <fieldset className="adm-image"><legend>{label}</legend>
    {value && <img src={value} alt={'Предпросмотр: ' + label} onError={e => { e.currentTarget.hidden = true; }} key={value} />}
    <Input label={label + ' — URL'} value={raster.test(value ?? '') ? '' : value} change={change} />
    <Field label={label + ' — файл'}><input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={async e => {
      const input = e.target;
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;
      if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type) || file.size > 2 * 1024 ** 2) {
        setError('Допустимы JPEG, PNG, WebP, GIF и AVIF до 2 МБ.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const preview = new Image();
          preview.src = String(reader.result);
          await preview.decode();
          change(preview.src);
          setError('');
        } catch { setError('Не удалось прочитать файл как изображение.'); }
      };
      reader.onerror = () => setError('Не удалось прочитать файл.');
      reader.readAsDataURL(file);
    }} /></Field>
    {value && <button type="button" className="adm-danger" onClick={() => change('')}>Убрать изображение</button>}
    {error && <p className="adm-error" role="alert">{error}</p>}
  </fieldset>;
}
