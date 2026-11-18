// Настройки, согласованные с заказчиком. Меняются здесь, а не в коде логики.
export const CONFIG = {
  host: 'https://cyber.sports.ru',
  mobileHost: 'https://m.cyber.sports.ru',
  base: '/games/best/',
  perPage: 35,
  /** Минимум игр для индексируемой страницы (ТЗ: "Минимальное количество игр для создания страницы - 3") */
  minIndexable: 3,
  /**
   * Canonical страниц пагинации.
   * 'filter-base' - как в ТЗ: canonical ведет на страницу фильтра без ?page (решение п.5).
   * 'self'        - каждая страница пагинации ссылается на себя.
   */
  canonicalMode: 'filter-base' as 'filter-base' | 'self',
  /** Пустой результат при выборе фильтра: сообщение без смены URL (вариант 1 ТЗ) */
  emptyMode: 'message' as 'message' | 'no-results-page',
  /** Порядок сегментов URL (таблица мета, столбцы G и H) */
  segmentOrder: ['genre', 'platform', 'year'] as const,
  /** Сортировки (решение v0.2). Первая - по умолчанию */
  sorts: [
    { key: 'rating-desc', label: 'Высокая оценка' },
    { key: 'rating-asc', label: 'Низкая оценка' },
    { key: 'popular', label: 'По популярности' },
    { key: 'alpha', label: 'По алфавиту' },
    { key: 'new', label: 'Сначала новые' },
    { key: 'old', label: 'Сначала старые' },
  ] as const,
  /** Диапазоны оценки (10-балльная шкала): 1-3 = до 4.0, 4-7 = от 4.0 до 7.9, 8-10 = от 8.0 */
  ratingBands: [
    { key: '8-10', label: '8-10', min: 8, max: 10.01 },
    { key: '4-7', label: '4-7', min: 4, max: 8 },
    { key: '1-3', label: '1-3', min: 0, max: 4 },
  ] as const,
  /** Дата снимка данных */
  dataSnapshot: '2026-11-17',
};
