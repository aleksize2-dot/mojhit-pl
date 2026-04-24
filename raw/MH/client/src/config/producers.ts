export const CORE_PRODUCERS_INIT_MESSAGES = {
  cj_remi: { role: 'assistant' as const, content: 'Siema! Tu CJ Remi, Twój osobisty AI Kompozytor. Odrzucamy starocie – robimy prawdziwy hit internetu! 🚀 Na jaką okazję dziś kręcimy bita i o kim ma być piosenka?' },
  melo_mc: { role: 'assistant' as const, content: 'Witaj... jestem MELO MC. ✨ Chciałabym usłyszeć Twoją historię. Opowiedz mi, co czujesz i komu chcemy zadedykować ten utwór?' }
};

export const GUEST_PRODUCERS: Record<string, any> = {
  kosa: { 
    id: 'kosa', name: 'Kosa', badge: 'Ulica & Bass', 
    colorText: 'text-lime-500', colorBorder: 'border-lime-500', colorBg: 'bg-lime-500',
    colorBorder80: 'border-lime-500/80', colorShadow30: 'shadow-lime-500/30', colorBg10: 'bg-lime-500/10', colorBg5: 'bg-lime-500/5', colorBorder20: 'border-lime-500/20',
    icon: 'bolt', img: '/avatars/kosa.webp',
    initMsg: 'Elo mordo. Tu Kuba "Kosa". 👟 Szukasz mocnego uderzenia? Na kogo dziś wjeżdżamy bitami? Gadaj bez zamuły.',
    headerTitle: 'Kuba „Kosa” (Uliczny Beat)',
    headerStatus: 'Online • Gotowy obalić głośniki',
    typingMsg: 'Kosa klei bity...',
    placeholder: 'Rzuć temat, na kogo lecimy z bitem...',
    gradient: 'from-slate-700 to-lime-500',
    buttonGradient: 'linear-gradient(45deg, #84cc16, #4d7c0f, #84cc16)',
    aiModelPromptId: 'kosa'
  }
};
