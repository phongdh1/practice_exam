export interface ProhibitedClaimMatch {
  phrase: string;
  matchedText: string;
}

export interface ContentComplianceResult {
  ok: boolean;
  violations: ProhibitedClaimMatch[];
}

interface ProhibitedRule {
  phrase: string;
  pattern: RegExp;
}

const PROHIBITED_RULES: ProhibitedRule[] = [
  { phrase: "guaranteed pass", pattern: /guaranteed\s+pass/gi },
  { phrase: "đảm bảo đậu", pattern: /đảm bảo đậu/giu },
  { phrase: "official exam questions", pattern: /official\s+exam\s+questions?/gi },
  { phrase: "câu hỏi chính thức", pattern: /câu hỏi chính thức/giu },
  { phrase: "đề thi chính thức", pattern: /đề thi chính thức/giu },
  { phrase: "ubcknn chính thức", pattern: /ubcknn chính thức/giu },
  {
    phrase: "government endorsement",
    pattern: /cơ quan nhà nước (?:công bố|chính thức)/giu,
  },
];

function scanText(text: string): ProhibitedClaimMatch[] {
  const violations: ProhibitedClaimMatch[] = [];

  for (const rule of PROHIBITED_RULES) {
    const matches = text.matchAll(rule.pattern);
    for (const match of matches) {
      violations.push({ phrase: rule.phrase, matchedText: match[0] });
    }
  }

  return violations;
}

/** Scan user-facing Subject/Question/marketing copy for prohibited claims (FR-16) */
export function scanProhibitedClaims(...texts: Array<string | null | undefined>): ContentComplianceResult {
  const combined = texts.filter(Boolean).join("\n");
  const violations = scanText(combined);
  return { ok: violations.length === 0, violations };
}
