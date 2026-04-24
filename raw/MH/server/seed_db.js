require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const producers = [
  {
    id: 'cj_remi',
    name: 'CJ Remi',
    badge: 'Energia & Hit',
    icon: 'headphones',
    img: '/avatars/remi.webp', // keep same or rename later
    init_msg: 'Siema! Tu CJ Remi, Twój osobisty AI Kompozytor. Odrzucamy starocie – robimy prawdziwy hit internetu! 🚀 Na jaką okazję dziś kręcimy bita i o kim ma być piosenka?',
    header_title: 'CJ Remi (AI Producer)',
    header_status: 'Online • Gotowy do miksu',
    typing_msg: 'CJ Remi pisze...',
    placeholder: 'Podaj temat, rzuć pomysłem, odpisz Remiemu...',
    gradient: 'from-primary to-tertiary',
    button_gradient: 'linear-gradient(45deg, #ff9064, #734bbd, #ff9064)',
    theme_config: {
      colorText: 'text-primary',
      colorBg: 'bg-primary',
      colorBorder: 'border-primary',
      colorBorder80: 'border-primary/80',
      colorShadow30: 'shadow-primary/30',
      colorBg10: 'bg-primary/10',
      colorBg5: 'bg-primary/5',
      colorBorder20: 'border-primary/20'
    },
    system_prompt: require('./producers/marek.js').systemPrompt.replace(/DJ Marek/g, 'CJ Remi').replace(/Marek/g, 'CJ Remi'),
    model_name: 'google/gemini-2.5-flash',
    price_coins: 0,
    is_active: true
  },
  {
    id: 'melo_mc',
    name: 'MELO MC',
    badge: 'Dusza & Emocje',
    icon: 'favorite',
    img: '/avatars/melo.webp', // keep same or rename later
    init_msg: 'Witaj... jestem MELO MC. ✨ Chciałabym usłyszeć Twoją historię. Opowiedz mi, co czujesz i komu chcemy zadedykować ten utwór?',
    header_title: 'MELO MC (Twoja Muza)',
    header_status: 'Online • Gotowa by słuchać',
    typing_msg: 'MELO MC nasłuchuje...',
    placeholder: 'Opisz swoje uczucia, komu dedykujesz utwór...',
    gradient: 'from-pink-500 to-rose-400',
    button_gradient: 'linear-gradient(45deg, #f43f5e, #be185d, #f43f5e)',
    theme_config: {
      colorText: 'text-pink-500',
      colorBg: 'bg-pink-500',
      colorBorder: 'border-pink-500',
      colorBorder80: 'border-pink-500/80',
      colorShadow30: 'shadow-pink-500/30',
      colorBg10: 'bg-pink-500/10',
      colorBg5: 'bg-pink-500/5',
      colorBorder20: 'border-pink-500/20'
    },
    system_prompt: require('./producers/maja.js').systemPrompt.replace(/Maja/g, 'MELO MC'),
    model_name: 'anthropic/claude-3.7-sonnet',
    price_coins: 10,
    is_active: true
  },
  {
    id: 'kosa',
    name: 'Kosa',
    badge: 'Ulica & Bass',
    icon: 'bolt',
    img: '/avatars/kosa.webp',
    init_msg: 'Elo mordo. Tu Kuba "Kosa". 👟 Szukasz mocnego uderzenia? Na kogo dziś wjeżdżamy bitami? Gadaj bez zamuły.',
    header_title: 'Kuba „Kosa” (Uliczny Beat)',
    header_status: 'Online • Gotowy obalić głośniki',
    typing_msg: 'Kosa klei bity...',
    placeholder: 'Rzuć temat, na kogo lecimy z bitem...',
    gradient: 'from-slate-700 to-lime-500',
    button_gradient: 'linear-gradient(45deg, #84cc16, #4d7c0f, #84cc16)',
    theme_config: {
      colorText: 'text-lime-500',
      colorBg: 'bg-lime-500',
      colorBorder: 'border-lime-500',
      colorBorder80: 'border-lime-500/80',
      colorShadow30: 'shadow-lime-500/30',
      colorBg10: 'bg-lime-500/10',
      colorBg5: 'bg-lime-500/5',
      colorBorder20: 'border-lime-500/20'
    },
    system_prompt: require('./producers/kosa.js').systemPrompt,
    model_name: 'x-ai/grok-2-vision-1212',
    price_coins: 15,
    is_active: true
  }
];

async function seed() {
  for (const p of producers) {
    console.log('Inserting', p.name);
    // use upsert
    const { error } = await supabase.from('producers').upsert(p);
    if (error) {
      console.error('Error inserting', p.name, error);
    } else {
      console.log('Inserted', p.name);
    }
  }
}

seed();
