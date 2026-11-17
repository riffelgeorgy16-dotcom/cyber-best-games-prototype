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
  /** Дата снимка данных */
  dataSnapshot: '2026-11-17',
};
