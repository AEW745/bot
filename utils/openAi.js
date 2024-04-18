require("dotenv").config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.GPT_API
});

module.exports = openai;