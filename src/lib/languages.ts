export const dialects = [
  { value: 'standard', label: 'Standard Marathi' },
  { value: 'pune', label: 'Pune Marathi' },
  { value: 'mumbai', label: 'Mumbai Marathi' },
  { value: 'nagpur', label: 'Nagpur Marathi (Varhadi)' },
  { value: 'kolhapur', label: 'Kolhapur Marathi' },
  { value: 'ahirani', label: 'Ahirani (Khandesh)' },
  { value: 'malvani', label: 'Malvani (Konkan)' },
  { value: 'agri', label: 'Agri (Raigad/Thane)' },
  { value: 'warli', label: 'Warli (Tribal)' },
  { value: 'thanjavur', label: 'Thanjavur Marathi' },
  { value: 'koli', label: 'Koli (Fisherfolk Dialect)' },
  { value: 'solapuri', label: 'Solapuri' },
  { value: 'marathwada', label: 'Marathwada Marathi' },
  { value: 'belgaum', label: 'Belgaum Marathi' },
  { value: 'dangii', label: 'Dangii' },
  { value: 'pawra', label: 'Pawra' },
  { value: 'gondi', label: 'Gondi' },
] as const;

export type Dialect = (typeof dialects)[number]['value'];
