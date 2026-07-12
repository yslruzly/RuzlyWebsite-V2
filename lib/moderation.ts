import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

// Keeps the community chat clean. Runs on the server only, inside /api/chat, which
// is now the only way a message can get into the database at all.

// The obscenity library instead of my own word list. A plain list of bad words
// is trivial to get around (f*ck, fuuuck, f u c k) and it also flags innocent
// words that happen to contain one, the classic being "class" or "Scunthorpe".
// This handles both.
const profanity = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function hasProfanity(text: string): boolean {
  return profanity.hasMatch(text);
}

// Link detection. Catches the obvious forms plus bare domains like "spam.com".
//
// The TLD list is deliberate. If I matched any word.word I'd be blocking half
// the messages on a developer's portfolio, since "Next.js", "Node.js" and
// "index.ts" all look like domains. Only real TLDs count.
const TLDS =
  "com|net|org|io|co|dev|app|xyz|me|info|biz|ru|cn|link|click|shop|online|site|top|live|store|gg|ly|tv|pro|vip|icu";

const LINK_RE = new RegExp(
  [
    "https?://", // http:// or https://
    "www\\.", // www.anything
    `\\b[a-z0-9-]+\\.(?:${TLDS})\\b`, // bare domains: spam.com, foo.xyz
  ].join("|"),
  "i",
);

export function hasLink(text: string): boolean {
  return LINK_RE.test(text);
}