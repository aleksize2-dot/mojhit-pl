const nodemailer = require('nodemailer');

// SMTP configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'mojhit.pl <noreply@mojhit.pl>';

// Create transporter
let transporter;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn('[EMAIL] SMTP credentials not set. Email sending disabled.');
  transporter = null;
}

/**
 * Send track generation success email to user
 * @param {string} to - Recipient email
 * @param {Object} track - Track data
 * @param {string} track.title - Track title
 * @param {string} track.audio_url - Direct audio URL
 * @param {string} track.download_url - Download link (optional)
 * @param {string} track.cover_image_url - Cover image URL (optional)
 * @param {string} producerName - AI producer name (e.g., "MELO MC")
 * @param {string} userName - User's name (email prefix)
 * @returns {Promise<boolean>} - Success status
 */
async function sendTrackEmail(to, track, producerName, userName) {
  if (!transporter) {
    console.warn('[EMAIL] Cannot send email: transporter not configured');
    return false;
  }

  try {
    const downloadUrl = track.download_url || track.audio_url;
    const coverImage = track.cover_image_url || 'https://mojhit.pl/logo.png';
    
    // HTML email template with mojhit.pl branding
    const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twój hit jest gotowy! 🎵</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #ff9064 0%, #734bbd 50%, #ff9064 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }
    .tagline {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 20px;
      line-height: 1.3;
    }
    .highlight {
      color: #734bbd;
    }
    .card {
      background: #f8fafc;
      border-radius: 20px;
      padding: 25px;
      margin: 25px 0;
      border: 1px solid #e2e8f0;
    }
    .track-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
    }
    .producer-badge {
      display: inline-block;
      background: linear-gradient(90deg, #ff9064, #734bbd);
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .audio-player {
      background: white;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(90deg, #ff9064, #734bbd);
      color: white;
      text-decoration: none;
      padding: 18px 32px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 16px;
      text-align: center;
      margin: 15px 0;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(115, 75, 189, 0.2);
    }
    .info-box {
      background: #f1f5f9;
      border-left: 4px solid #734bbd;
      padding: 20px;
      border-radius: 12px;
      margin: 25px 0;
    }
    .info-title {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .plans {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin: 30px 0;
    }
    .plan {
      flex: 1;
      min-width: 150px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      transition: border-color 0.2s;
    }
    .plan:hover {
      border-color: #734bbd;
    }
    .plan-name {
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 10px;
    }
    .plan-price {
      font-size: 24px;
      font-weight: 900;
      color: #734bbd;
      margin-bottom: 15px;
    }
    .plan-feature {
      font-size: 14px;
      color: #64748b;
      margin: 5px 0;
    }
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    .social {
      margin: 20px 0;
    }
    .social a {
      color: #734bbd;
      margin: 0 10px;
      text-decoration: none;
      font-weight: 600;
    }
    @media (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .content {
        padding: 30px 20px;
      }
      .plans {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">mojhit.pl</div>
      <div class="tagline">AI‑generowane hity w 60 sekund</div>
    </div>
    
    <div class="content">
      <h1 class="title">Cześć ${userName},<br>twój hit <span class="highlight">"${track.title}"</span> jest gotowy! 🎵</h1>
      
      <div class="card">
        <div class="producer-badge">Wykonawca AI: ${producerName}</div>
        <h2 class="track-title">${track.title}</h2>
        <p>Twój utwór został wygenerowany przez sztuczną inteligencję i jest teraz dostępny do odsłuchu i pobrania.</p>
        
        <div class="audio-player">
          <p><strong>🎧 Odsłuchaj online:</strong></p>
          <p><a href="${track.audio_url}" style="color: #734bbd; text-decoration: underline;">${track.audio_url}</a></p>
        </div>
        
        <a href="${downloadUrl}" class="button">⬇️ Pobierz plik MP3</a>
        <p style="font-size: 13px; color: #64748b;">Plik zostanie automatycznie pobrany na twoje urządzenie.</p>
      </div>
      
      <div class="info-box">
        <div class="info-title">📦 Przechowywanie utworu</div>
        <p>Wygenerowany utwór jest przechowywany na naszych serwerach przez <strong>14 dni</strong>. Po tym czasie zostanie automatycznie usunięty.</p>
        <p><strong>Zalecamy pobranie pliku MP3</strong> jeśli chcesz zachować go na dłużej.</p>
      </div>
      
      <div class="info-box">
        <div class="info-title">🚀 Chcesz więcej? Przejdź na wyższy plan!</div>
        <p>Odkryj pełnię możliwości mojhit.pl z planami PRO i VIP:</p>
        
        <div class="plans">
          <div class="plan">
            <div class="plan-name">BASIC</div>
            <div class="plan-price">0 zł</div>
            <div class="plan-feature">✅ 1 utwór dziennie</div>
            <div class="plan-feature">✅ Podstawowe AI</div>
            <div class="plan-feature">❌ Brak priorytetu</div>
          </div>
          <div class="plan">
            <div class="plan-name">PRO</div>
            <div class="plan-price">29 zł/mc</div>
            <div class="plan-feature">✅ 10 utworów dziennie</div>
            <div class="plan-feature">✅ Zaawansowane AI</div>
            <div class="plan-feature">✅ Priorytetowa generacja</div>
            <div class="plan-feature">✅ Eksport WAV</div>
          </div>
          <div class="plan">
            <div class="plan-name">VIP</div>
            <div class="plan-price">99 zł/mc</div>
            <div class="plan-feature">✅ Nielimitowane utwory</div>
            <div class="plan-feature">✅ Wszystkie AI wykonawcy</div>
            <div class="plan-feature">✅ Najwyższy priorytet</div>
            <div class="plan-feature">✅ Personalizacja głosu</div>
          </div>
        </div>
        
        <p><a href="https://mojhit.pl/plany" style="color: #734bbd; font-weight: 700; text-decoration: underline;">Porównaj wszystkie plany →</a></p>
      </div>
      
      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        Dziękujemy za skorzystanie z mojhit.pl!<br>
        Masz pytania? Odpowiemy na <a href="mailto:support@mojhit.pl" style="color: #734bbd;">support@mojhit.pl</a>
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 mojhit.pl. Wszelkie prawa zastrzeżone.</p>
      <p>Utwory generowane przez AI są własnością użytkownika. Pobierając plik, akceptujesz <a href="https://mojhit.pl/regulamin" style="color: #734bbd;">regulamin</a>.</p>
      <div class="social">
        <a href="https://tiktok.com/@mojhit">TikTok</a> •
        <a href="https://instagram.com/mojhit.pl">Instagram</a> •
        <a href="https://discord.gg/mojhit">Discord</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text version for email clients that don't support HTML
    const text = `
Cześć ${userName},

Twój hit "${track.title}" jest gotowy! 🎵

Wykonawca AI: ${producerName}

🎧 Odsłuchaj online: ${track.audio_url}
⬇️ Pobierz plik MP3: ${downloadUrl}

📦 Przechowywanie utworu:
Wygenerowany utwór jest przechowywany na naszych serwerach przez 14 dni. Po tym czasie zostanie automatycznie usunięty. Zalecamy pobranie pliku MP3 jeśli chcesz zachować go na dłużej.

🚀 Chcesz więcej? Przejdź na wyższy plan!
Odkryj pełnię możliwości mojhit.pl z planami PRO i VIP:
- BASIC (0 zł): 1 utwór dziennie, podstawowe AI
- PRO (29 zł/mc): 10 utworów dziennie, zaawansowane AI, priorytet, eksport WAV
- VIP (99 zł/mc): nielimitowane utwory, wszystkie AI wykonawcy, najwyższy priorytet, personalizacja głosu

Porównaj wszystkie plany: https://mojhit.pl/plany

Dziękujemy za skorzystanie z mojhit.pl!
Masz pytania? Odpowiemy na support@mojhit.pl

© 2026 mojhit.pl. Wszelkie prawa zastrzeżone.
Utwory generowane przez AI są własnością użytkownika. Pobierając plik, akceptujesz regulamin: https://mojhit.pl/regulamin
    `;

    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject: `🎵 Twój hit "${track.title}" jest gotowy! | mojhit.pl`,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Track notification sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    return false;
  }
}

module.exports = {
  sendTrackEmail,
};