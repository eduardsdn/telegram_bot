import "dotenv/config";
import dotenv from "dotenv";
import fs from "fs";
import util from "util";
import { v4 as uuidv4 } from "uuid";

import { OpenAI } from "openai";
import textToSpeech from "@google-cloud/text-to-speech";
import vision from "@google-cloud/vision";

dotenv.config();

const TTSclient = new textToSpeech.TextToSpeechClient();
const VisionClient = new vision.ImageAnnotatorClient();

const openAIkey = process.env.OPENAI_KEY;
const openai = new OpenAI({
  apiKey: openAIkey,
});

// generate text response to user message
const textGen = async function (userMessage) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });
  return completion.choices[0].message.content;
};

// generate audio from text and save the file, returns path to the audio file
const audioGen = async function (
  textForTranslation,
  voiceName,
  annotationLang
) {
  let langCode = "ru-RU";
  console.log(`ANN LAN ${annotationLang}`);
  if (annotationLang) {
    langCode = annotationLang;
    if (langCode === "ru-RU") {
      console.log("picked russian");
      voiceName = "ru-Ru-Wavenet-B";
    } else if (langCode === "en-US") {
      console.log("picked english");
      voiceName = "en-US-Studio-Q";
    }
  }

  console.log(langCode);
  console.log(voiceName);
  const request = {
    input: { text: textForTranslation },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: langCode, name: voiceName },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  const pathToSpeechFile = `./audio/${uuidv4()}.mp3`;
  const [response] = await TTSclient.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(pathToSpeechFile, response.audioContent, "binary");
  return pathToSpeechFile;
};

// return text annotation from an image
const recognizeText = async function (pathToImageFile) {
  const [result] = await VisionClient.textDetection(pathToImageFile);

  const detection = result.fullTextAnnotation.text;

  return detection;
};

export { textGen, audioGen, recognizeText };

// audiGen openAI version

// const audioGen = async function (textForTranslation, voiceType) {
//   console.log(textForTranslation);
//   const audio = await openai.audio.speech.create({
//     model: "tts-1",
//     voice: voiceType,
//     input: textForTranslation,
//   });
//   console.log(audio);
//   pathToSpeechFile = `./audio/${uuidv4()}.mp3`;
//   const buffer = Buffer.from(await audio.arrayBuffer());
//   await fs.promises.writeFile(pathToSpeechFile, buffer);
//   return pathToSpeechFile;
// };
