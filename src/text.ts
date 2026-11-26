/* Petits outils de texte. */

/** Majuscules sans accents : la police pixel n'a pas les capitales accentuées. */
export const up = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
