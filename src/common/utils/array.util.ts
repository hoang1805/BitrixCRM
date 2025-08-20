export const ArrayUtil = {
  toMap<T, K extends keyof any, V = T[keyof T]>(
    list: T[],
    keySelector: keyof T | ((item: T) => K),
    valueSelector: keyof T | ((item: T) => V),
  ): Record<K, V> {
    return list.reduce(
      (map, item) => {
        const key =
          typeof keySelector === 'function'
            ? keySelector(item)
            : (item[keySelector] as K);

        const value =
          typeof valueSelector === 'function'
            ? valueSelector(item)
            : (item[valueSelector] as V);

        if (!key) {
          return map;
        }

        map[key] = value;
        return map;
      },
      {} as Record<K, V>,
    );
  },

  extract<T, K extends keyof T, R = T[K]>(
    list: T[],
    selector: ((item: T) => R) | K,
  ): R[] {
    return list.map((item) =>
      typeof selector === 'function' ? selector(item) : (item[selector] as R),
    );
  },

  groupBy<T, R extends string | number | symbol>(
    list: T[],
    selector: ((item: T) => R) | keyof T,
  ): { _id: R; value: T[] }[] {
    const groupMap = new Map<R, T[]>();

    for (const item of list) {
      const key =
        typeof selector === 'function' ? selector(item) : (item[selector] as R);

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(item);
    }

    return Array.from(groupMap.entries()).map(([key, value]) => ({
      _id: key,
      value,
    }));
  },

  toString<T>(
    list: T[],
    separator = ', ',
    selector?: ((item: T) => string | null | undefined) | keyof T,
  ): string {
    if (!list?.length) return '';
    return list
      .map((item) => {
        if (typeof selector === 'function') return selector(item)?.trim();
        if (typeof selector === 'string') return String(item[selector]).trim();
        return String(item).trim();
      })
      .filter((v) => v != null && v !== '') // bỏ null, undefined, và chuỗi rỗng
      .join(separator);
  },
};
