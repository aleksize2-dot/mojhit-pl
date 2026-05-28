const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const data = {
  kosa: {
    description: `Kuba „Kosa" — producent muzyczny, który wyszedł z osiedla i wie, co to prawdziwy gang. Jego studio to nie wygłuszone ściany, tylko blokowisko, gdzie bas słychać z każdego balkonu. Nie uznaje półśrodków — robi numery, które mają „pierdolnięcie" i lecą na pełnej. Jeśli szukasz kogoś, kto zrobi numer z jajami — Kosa to Twój gość. Bez filozofii, bez ściemy — czysty ogień.`,
    strengths: `🔥 Polski street rap, drill, agresywny phonk — mocne uderzenie gwarantowane\n🔊 Heavy 808 bass, distorted kicks — głośniki nie przeżyją\n⚡ Szybka robota — zero zamulania, konkret i energia\n🏚️ Autentyczny osiedlowy vibe — żadnych salonowych tekstów\n🎤 Męski wokal, gang vocals, żeński backing w refrenach`
  },
  cj_remi: {
    description: `CJ Remi — 38-letni DJ i producent z serca miasta. Król neonowych świateł i nocnych przejażdżek. Tworzy „Polską Falę" — połączenie synth-popu lat 80. z nowoczesnym dancem. Jego studio pachnie kawą i winylem, a każdy numer brzmi jak hit z radia. Idealny wybór, gdy chcesz zrobić prezent z klasą — stylowo, tanecznie i z nutką nostalgii.`,
    strengths: `🎛️ Modern Disco / Synth-Pop / Polo Vibes — taneczny, stylowy, radiowy\n🌃 Klimat nocnego miasta, neony, przejażdżki — atmosfera luksusu\n🎸 Gitara akustyczna + synth hooks — unikalna Polska Fala\n🎤 Męski wokal — profesjonalny, ciepły, charyzmatyczny\n🎯 Idealny na prezent, imprezę, do auta — uniwersalny hit`
  },
  melo_mc: {
    description: `Melo MC — 29-letnia charyzmatyczna wokalistka i DJ-ka, uosobienie słowiańskiej duszy na parkiecie. Urodzona na Podlasiu, wychowana na disco polo i folkowych melodiach babci. Jej akordeon i skrzypce rozgrzewają każdą imprezę — od wesela po klub. Tworzy muzykę, która łączy pokolenia: babcia płacze ze wzruszenia, a Wy tańczycie do rana. Królowa każdej imprezy.`,
    strengths: `🪗 Disco Polo / Folk-Dance / Slap House — słowiański ogień\n🎻 Akordeon + skrzypce — tradycja w nowoczesnym wydaniu\n💃 Idealna na wesele, urodziny, rocznicę — świętowanie życia\n🎤 Żeński wokal — ciepły, czuły, energia Diva\n🤍 Personalizowane teksty — imię bohatera zawsze w refrenie`
  },
  la_luz: {
    description: `La Luz — 32-letni charyzmatyczny wokalista i producent z polsko-latynoską duszą. Pół Polak, pół Hiszpan — całe serce na dłoni. Urodził się w Barcelonie, ale zakochał się w Polsce. Jego muzyka to połączenie gorącej latynoskiej pasji z polską gościnnością. Każdy jego numer pachnie salsą, morzem i wakacjami. Z La Luz każdy dzień staje się fiestą.`,
    strengths: `🌴 Latino / Reggaeton / Salsa pop — gorąca energia prosto z Karaibów\n🎸 Hiszpańska gitara + trąbki + Dem Bow — autentyczny latynoski sound\n☀️ Idealny na lato, imprezę, romantyczną niespodziankę\n🎤 Męski wokal — namiętny, charyzmatyczny, pełen ognia\n🇵🇱🇪🇸 Dwujęzyczny vibe — polski + hiszpański w jednym`
  },
  '2impuls': {
    description: `2ImPULS — najgorętszy duet Modern Disco w Polsce. Julia i Bartek — dwoje przyjaciół z Łomży, którzy poznali się w szkole muzycznej i od razu poczuli, że razem stworzą coś wyjątkowego. Julia to diamentowy głos i charyzma, Bartek to klawisze i mistrz produkcji. Dwa serca, jeden PULS. Ich muzyka bije mocniej niż klubowe nagłośnienie. Razem tworzą duet idealny — jak ogień i lód.`,
    strengths: `🎤 Duet M+Ż — dwa głosy, jedna harmonia\n🎹 Modern Disco-Pop — synth, klawisze, taneczny beat\n💙 Chemia między wokalistami — słychać i czuć\n⚡ Koncertowa energia — jak na żywo\n💍 Idealny duet na wesele, rocznicę, wielkie emocje`
  }
};

async function main() {
  for (const [id, vals] of Object.entries(data)) {
    const { error } = await s.from('producers').update(vals).eq('id', id);
    console.log(id, error ? 'ERROR: ' + error.message : '✅');
  }
}
main();
