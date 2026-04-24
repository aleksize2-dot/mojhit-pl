import dotenv from 'dotenv';
dotenv.config({ path: '.env_policija' });

import axios from 'axios';

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const AGENT_ID = process.env.RETELL_AGENT_ID;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const TO_NUMBER = process.env.TARGET_PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const required = { RETELL_API_KEY, AGENT_ID, FROM_NUMBER, TO_NUMBER, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN };
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
    console.error(`❌ Nedostaju ključevi u .env_policija: ${missing.join(', ')}`);
    process.exit(1);
}

async function makeEmergencyCall() {
    console.log(`\n🚨 Zvonim u Hrvatsku Policiju Dvor: ${TO_NUMBER} (sa broja ${FROM_NUMBER})...`);
    try {
        const response = await axios.post(
            'https://api.retellai.com/v2/create-phone-call',
            {
                from_number: FROM_NUMBER,
                to_number: TO_NUMBER,
                override_agent_id: AGENT_ID,
                telephony_data: {
                    twilio: {
                        account_sid: TWILIO_ACCOUNT_SID,
                        auth_token: TWILIO_AUTH_TOKEN
                    }
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${RETELL_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Poziv uspješno pokrenut!');
        console.log('🔗 Retell Call ID:', response.data.call_id);
        console.log('Provjerite Dashboard u Retell AI za transkript.');
    } catch (error) {
        console.error('❌ Greška prilikom poziva:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

makeEmergencyCall();
