import 'dotenv/config';
import axios from 'axios';
import twilio from 'twilio';

// 1. Initialize Twilio Client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

// 2. Config parameters
const RETELL_API_KEY = process.env.RETELL_API_KEY;
const AGENT_ID = process.env.RETELL_AGENT_ID;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER; // Your verified personal number
const TO_NUMBER = process.env.TARGET_PHONE_NUMBER; // The Croatian recipient

async function makeOutboundCall() {
    console.log(`Initiating call from ${FROM_NUMBER} to ${TO_NUMBER}...`);

    try {
        // Step 1: Create a phone call via Retell API
        // Retell acts as the orchestrator. We tell it: "Call this number, use this agent, and here are my Twilio credentials to use for the SIP trunk."
        const response = await axios.post(
            'https://api.retellai.com/v2/create-phone-call',
            {
                from_number: FROM_NUMBER,
                to_number: TO_NUMBER,
                agent_id: AGENT_ID,
                // We need to pass the Twilio credentials so Retell can use your specific Twilio account to make the call.
                override_agent_id: AGENT_ID,
                telephony_data: {
                    twilio: {
                        account_sid: accountSid,
                        auth_token: authToken
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

        console.log('Call successfully initiated!');
        console.log('Call Details:', response.data);

        // The response will contain a call_id. You can use this ID later to fetch the transcript or recording from Retell.
        const callId = response.data.call_id;
        console.log(`\nTo view the transcript later, check the Retell Dashboard or fetch via API using Call ID: ${callId}`);

    } catch (error) {
        console.error('Error initiating call:');
        if (error.response) {
            console.error('Retell API Error:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

// Ensure all environment variables are present before running
if (!accountSid || !authToken || !RETELL_API_KEY || !AGENT_ID || !FROM_NUMBER || !TO_NUMBER) {
    console.error("Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

makeOutboundCall();