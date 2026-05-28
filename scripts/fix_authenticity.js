const { createClient } = require('C:/Users/Admin/.openclaw/workspace/raw/MH/server/node_modules/@supabase/supabase-js');
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  // FIX 1: Melo MC — replace "Hej Słońce!" and "Jak cudownie Cię widzieć!"
  const meloInit = 'Witaj, Słoneczko! ☀️ Twoja Melo MC już grzeje akordeon i szykuje słowiański vibe, którego nie zapomnisz. Powiedz mi, dla jakiej wyjątkowej osoby stworzymy dzisiaj muzyczny prezent? Podaj mi tylko okazję i imię, a resztę zostaw swojej ulubionej Divie. Rozkręcimy tę imprezę razem! 💃🍷|||Ooo, witaj Kochanie! 🌸 Melo MC na pokładzie! Akordeon już nastrojony, wokal rozgrzany — czekam tylko na Twoją historię. Kto dziś dostanie muzyczny prezent? Imię, okazja, daj mi iskrę — ja dam płomień! 🔥🎤|||No hej, witaj Skarbie! 💫 Twoja Diva melduje gotowość! Czuję, że dzisiaj stworzymy coś, co będzie hitem każdej imprezy. Powiedz tylko — dla kogo? Urodziny, rocznica, a może tak bez okazji, z miłości? Dawaj, opowiadaj! 🎵🥂|||Cześć, moja Droga! 🌺 Melo MC wita z uśmiechem i już odpala ten niezawodny akordeon! Każda historia zasługuje na piosenkę. Imię bliskiej osoby, okazja — proszę bardzo, a ja już czaruję dźwiękami! 🪗✨|||Witaj, Złociutka! 💖 Melo MC — Twoja osobista wróżka od hitów na każdą okazję. Ślub, urodziny, imieniny? A może po prostu chcesz komuś powiedzieć "kocham" piosenką? Daj mi imię i kilka słów — zatańczymy razem! 🎶💝';
  
  let { error } = await s.from('producers').update({ init_msg: meloInit }).eq('id', 'melo_mc');
  console.log('Melo MC:', error ? 'ERROR: '+error.message : '✅ greetings fixed');

  // FIX 2: 2ImPULS — replace military "melduje gotowość" + fix grammar
  const impInit = 'Julia gotowa! Bartek już przy klawiszach. ⚡ 2ImPULS — duet, który bije mocniej niż serce! Dla kogo dzisiaj tworzymy hit? 💙|||Kochani! 🎤 Julia i Bartek na scenie! Dwa głosy, dwa serca, jeden PULS. Jaka okazja? Wesele, urodziny, a może po prostu chcecie zrobić komuś muzyczną niespodziankę? Dawajcie! ✨|||2ImPULS wchodzi na bit! 💿 Julia już szlifuje wokal, Bartek rozgrzewa klawisze. Opowiadajcie — dla kogo ma być ten numer? Imię, historia, nastrój — a my zrobimy z tego diament! 🎵|||Dzień dobry, Kochani! ⚡ Z tej strony 2ImPULS — energia, która rozświetli każdy parkiet. Julia i Bartek w pełnej gotowości. Kto dziś jest gwiazdą piosenki? 💙|||Hej, hej! 🎹 Słyszycie ten beat? To 2ImPULS się rozkręca! Julia już nuci melodię, Bartek dogrywa synth. Powiedzcie tylko imię i okazję — reszta to nasza robota! 🎶';
  
  ({ error } = await s.from('producers').update({ init_msg: impInit }).eq('id', '2impuls'));
  console.log('2ImPULS:', error ? 'ERROR: '+error.message : '✅ greetings fixed');

  // FIX 3: CJ Remi — add Polish warmth without breaking character
  const remiInit = 'Dobry wieczór! 🌃 Tu CJ Remi — prosto z serca miasta, gdzie neony mrugają w rytm basu. Chcesz numer, który rozkręci każdą imprezę? Powiedz dla kogo i z jakiej okazji — a ja już kręcę gałkami. 🎹🚗|||Hej, witaj! 📻 CJ Remi na falach. Słyszysz ten synth? To zapowiedź czegoś wielkiego. Dla kogo dzisiaj komponujemy? Imię, okazja — i lecimy z Polską Falą! 🌊🎵|||No cześć, siema! 🎛️ CJ Remi melduje się w studiu. Neonowy vibe już ustawiony, gitary też gotowe. Powiedz tylko — dla kogo ten hit? Urodziny, rocznica, a może po prostu na poprawę humoru? Dawaj! ✨|||Słuchaj, witam! 🌆 Z tej strony CJ Remi — Twój dostawca hitów z pierwszego tłoczenia. Lata 80., nowoczesny beat i ta niepowtarzalna Polska Fala. Kto ma dzisiaj dostać prezent muzyczny? 🕺🎸|||Dzień dobry! ☀️ CJ Remi wchodzi na bit. Disco, synth, gitara akustyczna — wszystko, co trzeba do idealnego numeru. Dla kogo gramy? Opowiadaj — imię, historia, a ja zamienię to w muzykę. 🎶🔥';
  
  ({ error } = await s.from('producers').update({ init_msg: remiInit }).eq('id', 'cj_remi'));
  console.log('CJ Remi:', error ? 'ERROR: '+error.message : '✅ greetings fixed');

  // FIX 4: La Luz — fix minor grammar (missing commas before "który"/"co")
  const laInit = '¡Hola, familia! 🌴 Tu La Luz! Słyszysz ten rytm? To Twoje nowe życie zaczyna grać salsę! 🕺 Opowiadaj — kto dzisiaj jest gwiazdą? Dla kogo robimy ten hicior? Imię, okazja, historia — sypiesz, a ja robię magię! 💃🔥|||¡Buenos días, mi amor! 🌺 La Luz na łączach! Czuję, że dzisiaj urodzi się coś pięknego. Dla kogo gramy? Powiedz imię, okazję — a ja zamienię to w muzykę, co poruszy serce. 🎶💖|||¡Ay, qué emoción! 🌞 Tu La Luz, a słońce świeci dla nas! Masz kogoś wyjątkowego? Opowiedz mi o niej, o nim — imię, historia, co Was łączy. Zrobię z tego hymn! 🕊️✨|||¡Familia! 🌈 La Luz melduje się z uśmiechem. Każda historia zasługuje na piosenkę. Kto? Jaka okazja? Daj mi słowa, a dam Ci rytm, który zatańczy cała ulica. 🎵🌟|||¡Hola, corazón! 💝 Tu wchodzi La Luz z pełnym słońcem! Powiedz tylko, dla kogo ten numer — mamma, przyjaciel, ukochana osoba? Imię, kilka słów i już leci magia prosto z Karaibów! 🌊🎹';
  
  ({ error } = await s.from('producers').update({ init_msg: laInit }).eq('id', 'la_luz'));
  console.log('La Luz:', error ? 'ERROR: '+error.message : '✅ greetings fixed');

  // Verify
  const { data } = await s.from('producers').select('id,init_msg');
  console.log('\nVerification:');
  data.forEach(p => {
    const first = (p.init_msg || '').split('|||')[0]?.trim().substring(0, 80);
    console.log(`  [${p.id}] "${first}..."`);
  });
}
main();
