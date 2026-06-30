const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to download remote file using HTTPS stream
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file from URL, status code: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Transcribe and analyze audio using Google Gemini 1.5 Flash (via File API for large files)
 */
const transcribeWithGeminiFileAPI = async (absolutePath, fileType, meetingTitle, meetingDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  console.log(`Using Gemini 1.5 Flash (File API) to transcribe and analyze: ${meetingTitle}`);
  const fileManager = new GoogleAIFileManager(apiKey);

  // 1. Upload the file to Gemini File API storage
  const uploadResponse = await fileManager.uploadFile(absolutePath, {
    mimeType: fileType || 'audio/mpeg',
    displayName: meetingTitle
  });

  const fileInfo = uploadResponse.file;
  console.log(`Uploaded file to Gemini File API: ${fileInfo.name} (URI: ${fileInfo.uri})`);

  try {
    // 2. Poll file status until it is ACTIVE (Gemini processes video metadata)
    let file = await fileManager.getFile(fileInfo.name);
    let attempts = 0;
    while (file.state === 'PROCESSING' && attempts < 30) {
      console.log(`Gemini is processing file, status: ${file.state}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(fileInfo.name);
      attempts++;
    }

    if (file.state === 'FAILED') {
      throw new Error('Gemini File API processing failed on the server.');
    }

    // 3. Generate summary content using the uploaded file URI reference
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an expert enterprise AI meeting assistant. Analyze the attached meeting audio/video file.
      Perform the following operations:
      1. Transcribe the audio word-for-word with speaker diarization. Identify distinct speakers based on their voice biometrics (e.g. "Speaker A", "Speaker B", or their actual names if mentioned) and group the transcript into chronological dialogue segments with timestamps (start and end in seconds).
      2. Generate an Executive Summary (1-2 paragraph brief of the meeting).
      3. Extract Key Discussion Points (list of strings).
      4. Extract Decisions Made (list of strings).
      5. Extract Risks Identified (list of strings).
      6. Extract Follow-up Tasks / Action Items. Each task should have a clear "title" (action description), a likely "owner" (e.g. one of the identified speakers, or "Unassigned"), and "durationDays" (estimated days from now to complete it, e.g. 1 to 7).
      7. Calculate a Productivity Score (0 to 100 integer) based on meeting efficiency, token outputs, and participation.
      8. Detect the overall Sentiment (e.g. Collaborative, Positive, Tense, Neutral).
      9. Provide Speaker Insights (Contribution ratio, speaking duration, and items count per speaker).
      
      You must respond strictly with a valid JSON object matching this schema:
      {
        "transcript": [
          { "speaker": "Speaker Name", "start": 0, "end": 45, "text": "Segment dialogue..." }
        ],
        "summary": {
          "executiveSummary": "Paragraph summary text...",
          "keyPoints": ["point 1", "point 2"],
          "decisions": ["decision 1"],
          "risks": ["risk 1"],
          "followUps": ["followup 1"],
          "productivityScore": 88,
          "sentiment": "Collaborative",
          "speakerInsights": [
            { "name": "Speaker Name", "speakTime": 45, "ratio": 100, "itemsCount": 0 }
          ],
          "actionItems": [
            { "title": "Secure marketing budget approval", "owner": "Sarah Jenkins", "durationDays": 2 }
          ]
        }
      }

      Meeting Title Context: "${meetingTitle}"
      Meeting Description Context: "${meetingDescription || 'No description provided.'}"
    `;

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: fileInfo.mimeType,
                fileUri: fileInfo.uri
              }
            },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const text = response.response.text();
    // Safely parse JSON in case of markdown block wrappers
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    return JSON.parse(cleanJson);
  } finally {
    // 4. Always delete the file from Gemini storage to release space
    try {
      if (fileInfo && fileInfo.name) {
        await fileManager.deleteFile(fileInfo.name);
        console.log(`Cleaned up file from Gemini File API storage: ${fileInfo.name}`);
      }
    } catch (cleanupErr) {
      console.error('Failed to delete file from Gemini File API:', cleanupErr.message);
    }
  }
};

/**
 * Transcribe and analyze audio using OpenAI Whisper API and GPT-4o-mini
 */
const transcribeWithOpenAI = async (absolutePath, meetingTitle, meetingDescription) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  console.log(`Using OpenAI Whisper to transcribe: ${meetingTitle}`);
  const openai = new OpenAI({ apiKey });

  // Run transcription on Whisper (Requires file size <= 25 MB)
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(absolutePath),
    model: 'whisper-1'
  });

  const rawTranscriptText = transcription.text;
  console.log('Whisper transcription complete. Requesting GPT structured summary analysis...');

  const prompt = `
    You are an expert enterprise AI meeting assistant. Analyze the raw meeting transcription text provided.
    
    Perform the following operations:
    1. Parse the raw transcript text and segment it chronologically. Since Whisper does not segment speakers natively, infer different speakers based on the conversational flow (e.g. "Speaker A", "Speaker B", or their actual names if mentioned) and divide the text into dialogue segments with rough timestamps (estimate start and end times in seconds).
    2. Generate an Executive Summary (1-2 paragraph brief of the meeting).
    3. Extract Key Discussion Points (list of strings).
    4. Extract Decisions Made (list of strings).
    5. Extract Risks Identified (list of strings).
    6. Extract Follow-up Tasks / Action Items. Each task should have a clear "title" (action description), a likely "owner" (e.g. one of the speakers, or "Unassigned"), and "durationDays" (estimated days from now to complete it, e.g. 1 to 7).
    7. Calculate a Productivity Score (0 to 100 integer) based on meeting efficiency.
    8. Detect the overall Sentiment (e.g. Collaborative, Positive, Tense, Neutral).
    9. Provide Speaker Insights (Contribution ratio, speaking duration in seconds, and action items count per speaker).
    
    You must respond strictly with a valid JSON object matching the following schema. Do not wrap in markdown tags:
    {
      "transcript": [
        { "speaker": "Speaker Name", "start": 0, "end": 45, "text": "Segment dialogue..." }
      ],
      "summary": {
        "executiveSummary": "Paragraph summary text...",
        "keyPoints": ["point 1", "point 2"],
        "decisions": ["decision 1"],
        "risks": ["risk 1"],
        "followUps": ["followup 1"],
        "productivityScore": 88,
        "sentiment": "Collaborative",
        "speakerInsights": [
          { "name": "Speaker Name", "speakTime": 45, "ratio": 100, "itemsCount": 0 }
        ],
        "actionItems": [
          { "title": "Secure marketing budget approval", "owner": "Sarah Jenkins", "durationDays": 2 }
        ]
      }
    }

    Meeting Title: "${meetingTitle}"
    Meeting Description: "${meetingDescription || 'No description provided.'}"
    Raw Transcript: "${rawTranscriptText}"
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: "json_object" }
  });

  const responseText = completion.choices[0].message.content;
  return JSON.parse(responseText);
};

/**
 * Orchestrates real vs simulated transcription.
 */
const transcribeAndAnalyze = async (filePath, fileType, meetingTitle, meetingDescription) => {
  let isTempFile = false;
  let absolutePath = filePath;

  try {
    // If the file path is a remote URL (e.g., from Cloudinary)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fileExt = path.extname(filePath.split('?')[0]) || '.mp3';
      const tempFileName = `cloudinary-temp-${Date.now()}${fileExt}`;
      const tempDestPath = path.join(tempDir, tempFileName);

      console.log(`Downloading remote Cloudinary file for transcription: ${filePath}`);
      await downloadFile(filePath, tempDestPath);
      
      absolutePath = tempDestPath;
      isTempFile = true;
    } else {
      absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(__dirname, '..', filePath);
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Meeting file not found for AI processing: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`Processing file path: ${absolutePath} (Size: ${fileSizeInMB.toFixed(2)} MB)`);

    // 1. If file exceeds Whisper limit (25 MB), use Gemini File API directly
    if (fileSizeInMB > 25) {
      console.log(`File size (${fileSizeInMB.toFixed(2)} MB) exceeds OpenAI Whisper 25 MB limit. Bypassing OpenAI.`);
      if (process.env.GEMINI_API_KEY) {
        return await transcribeWithGeminiFileAPI(absolutePath, fileType, meetingTitle, meetingDescription);
      } else {
        throw new Error('File exceeds 25 MB limit for OpenAI Whisper, and no Gemini API key is configured.');
      }
    }

    // 2. Try OpenAI Whisper if key is set
    if (process.env.OPENAI_API_KEY) {
      try {
        const result = await transcribeWithOpenAI(absolutePath, meetingTitle, meetingDescription);
        if (result) return result;
      } catch (err) {
        console.error('Failed processing with OpenAI, trying Gemini...', err.message);
      }
    }

    // 3. Try Google Gemini File API
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await transcribeWithGeminiFileAPI(absolutePath, fileType, meetingTitle, meetingDescription);
        if (result) return result;
      } catch (err) {
        console.error('Failed processing with Gemini API:', err.message);
      }
    }

    return null; // Fallback to simulated template
  } finally {
    // Proactively clean up the temporary downloaded file if it was created
    if (isTempFile && fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
        console.log(`Cleaned up downloaded temporary file: ${absolutePath}`);
      } catch (err) {
        console.error('Failed unlinking downloaded temporary file:', err.message);
      }
    }
  }
};

module.exports = {
  transcribeAndAnalyze
};
