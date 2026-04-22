const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (resumePath) => {
  try {
    // 1. Extract text from PDF
    const cleanPath = resumePath.startsWith('/') ? resumePath.substring(1) : resumePath;
    const fullPath = path.join(__dirname, '..', cleanPath);
    const dataBuffer = fs.readFileSync(fullPath);
    const data = await pdf(dataBuffer);
    const resumeText = data.text;

    // 2. Initialize Gemini Model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert HR recruiter. Analyze the following resume text and provide a concise summary.
      Focus on:
      1. Top 3 Skills
      2. Experience Level (Junior, Mid, Senior)
      3. Key Achievement (if any)
      4. A "Verdict" on whether they are a good fit for a general professional role.

      Format the response in a clean, professional way.
      
      Resume Text:
      ${resumeText.substring(0, 5000)} // Truncate to avoid token limits
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw new Error('Failed to analyze resume with AI.');
  }
};

module.exports = { analyzeResume };
