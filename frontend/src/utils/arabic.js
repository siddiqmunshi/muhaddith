// Strip Arabic diacritics (harakat) from a string.
// Covers tashkeel (ً ٌ ٍ َ ُ ِ ّ ْ), superscript alef (ٰ), tatweel (ـ),
// and the extended combining marks block U+0610–U+061A.
export function stripDiacritics(text = '') {
  return String(text).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u0640]/g, '')
}
