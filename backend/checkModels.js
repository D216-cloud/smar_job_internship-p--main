
// backend/checkModels.js
const path = require('path');
// Load environment variables from backend/.env
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { GoogleAIFileManager, GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';

async function listAvailableModels() {
  if (!apiKey) {
    console.error('\n❌ Error: GEMINI_API_KEY is not set.');
    console.log('Please make sure you have a .env file in the backend directory with your key.');
    return;
  }

  console.log(`\n🔍 Checking available models for your API key using API version: ${apiVersion}...\n`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = await genAI.listModels();
    
    let foundModels = false;
    console.log('✅ Success! Found the following models:');
    for (const m of models) {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
            console.log(`  - ${m.name} (supports text generation)`);
            foundModels = true;
        }
    }

    if (!foundModels) {
        console.log('\n⚠️ Warning: Your API key is valid, but no models support text generation.');
        console.log('Please check your Google AI project to ensure the Generative Language API is enabled and models are available.');
    } else {
        console.log('\n💡 Recommendation: Set GEMINI_MODEL in your .env file to one of the model names listed above.');
    }

  } catch (error) {
    console.error('\n❌ Error connecting to Google AI:', error.message);
    if (error.message.includes('API key not valid')) {
        console.log('💡 Please double-check that your GEMINI_API_KEY in the .env file is correct.');
    } else {
        console.log('💡 This could be a network issue or a problem with your Google Cloud project configuration.');
    }
  }
}

listAvailableModels();
