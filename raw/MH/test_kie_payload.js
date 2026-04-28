// removed
require('dotenv').config({path: 'server/.env'});

const payload = {
  "customMode": true,
  "instrumental": false,
  "model": "V4_5",
  "vocalGender": "m",
  "style": "Polish Latino, Reggaeton, Skolim style, Spanish Acoustic Guitar, catchy synth trumpet hook, Male Vocals, Summer Party vibe, Autotune pop, Danceable, 98 BPM, Weirdness 20%, Style Influence 60%",
  "title": "Dla Svietlany - Urodzinowy Hit",
  "prompt": "[Intro]\n(Spanish Guitar Solo - Romantic and fast, Skolim style shout: Vamos!)\nTo jest dla Niej...\nNajjaśniejszej gwiazdy!\n(Beat Drop - Dem Bow Rhythm)\n\n[Verse 1]\nWchodzisz na salę, zatrzymujesz czas,\nMają dwadzieścia, ale nie mają szans.\n(Ha! Ha!)\nTwoja energia to czysty ogień,\nKażdy dziś chce zatańczyć z Tobą.\n\nMówią, że czas ucieka nam,\nA Ty smakujesz jak najlepszy szampan.\nKlasa i styl, wysoki poziom,\nInne się przy Tobie po prostu mrożą.\n\n[Pre-Chorus]\nMasz to coś, co w głowie kręci,\nCztery żywioły w Twojej pamięci.\nNie licz cyferek, to tylko gra,\nDzisiaj królową jesteś Ty - i ja!\n\n[Chorus - The Hook]\n(Melodic and Catchy)\nO, Svieta, Svieta, Svieta!\n(Svietlana!)\nTy jesteś piękna jak rakieta!\n(O-uo-o!)\nDajesz nam Światło, dajesz nam blask,\nNa to szaleństwo nadszedł czas!\n\n[Hook - Trumpet Solo]\n(Catchy synth trumpet melody: Tu-tu-tu-ru-tu!)\n\n[Verse 2]\nMówią mi kumple: \"Co to za dama?\"\nA ja im mówię: \"To Svetlana!\"\nSerce ze złota, uśmiech jak sen,\nZ Tobą chcę witać każdy nowy dzień.\n\n[Bridge]\n(Slow down slightly, romantic whisper)\nŚwiecisz najjaśniej.\nMoja gwiazda.\n(Shout)\nWszystkiego najlepszego!\nRęce w górę!\n\n[Chorus - Explosion]\nO, Svieta, Svieta, Svieta!\n(Svietlana!)\nTy jesteś piękna jak rakieta!\nDajesz nam Światło, dajesz nam blask,\nNa to szaleństwo nadszedł czas!\n\n[Outro]\n(Guitar fading out)\nSvietlana...\nLa Luz...\n(Kiss sound)\nMuah!",
  "callBackUrl": "https://mojhit.pl/api/webhooks/kie"
};

fetch('https://api.kie.ai/api/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.KIE_API_KEY
  },
  body: JSON.stringify(payload)
}).then(async r => {
  console.log('Status:', r.status);
  console.log('Response:', await r.text());
}).catch(console.error);
