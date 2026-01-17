import type { Dialect } from './languages';

const rules: Record<Exclude<Dialect, 'standard'>, Record<string, string>> = {
  nagpur: { // Previously varhadi
    आहे: 'हाय',
    मला: 'माले',
    तुला: 'तुले',
    काय: 'का',
    कुठे: 'कोठा',
    नाही: 'न्हाई',
  },
  malvani: {
    आहे: 'आसा',
    मला: 'माका',
    तुला: 'तुका',
    काय: 'काय',
    कुठे: 'खुय',
    नाही: 'नाय',
  },
  ahirani: {
    आहे: 'शे',
    मला: 'माले',
    काय: 'काय',
    कुठे: 'कुथा',
    नाही: 'नाही',
  },
  kolhapur: { // Previously kolhapuri
    'तू काय करते आहेस': 'काय कराय लागलीस',
    'तू': '', 
  },
  pune: {
    // Pune-specific rules can be added here
  },
  mumbai: {
    // Mumbai-specific rules can be added here
  },
  agri: {},
  warli: {},
  thanjavur: {},
  koli: {},
  solapuri: {},
  marathwada: {},
  belgaum: {},
  dangii: {},
  pawra: {},
  gondi: {},
};

export function applyRules(text: string, dialect: Dialect): { transformedText: string; appliedRules: string[] } {
  if (dialect === 'standard' || !rules[dialect]) {
    return { transformedText: text, appliedRules: [] };
  }

  let transformedText = text;
  const appliedRules: string[] = [];
  const dialectRules = rules[dialect];

  // Using a negative lookbehind and lookahead for non-Devanagari characters
  // to approximate word boundaries for Marathi text.
  const devanagariBoundary = '(?<![\u0900-\u097F])';
  const devanagariEndBoundary = '(?![\u0900-\u097F])';
  
  // Prioritize longer phrases for replacement
  const sortedKeys = Object.keys(dialectRules).sort((a, b) => b.length - a.length);

  for (const from of sortedKeys) {
    const to = dialectRules[from];
    const regex = new RegExp(`${devanagariBoundary}${from}${devanagariEndBoundary}`, 'g');
    
    if (regex.test(transformedText)) {
      transformedText = transformedText.replace(regex, to).replace(/\s+/g, ' ').trim();
      appliedRules.push(`${from} → ${to}`);
    }
  }

  return { transformedText, appliedRules };
}
