import "dotenv/config";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import util from "util";
import dotenv from "dotenv";
import textToSpeech from "@google-cloud/text-to-speech";
import vision from "@google-cloud/vision";

dotenv.config();

const TTSclient = new textToSpeech.TextToSpeechClient();
const VisionClient = new vision.ImageAnnotatorClient();

const openAIkey = process.env.OPENAI_KEY;
const openai = new OpenAI({
  apiKey: openAIkey,
});

// generate response to user message
const textGen = async function (userMessage) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });
  // console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
};

let pathToSpeechFile = "";

// generate auidio from generated text response
const audioGen = async function (textForTranslation, voiceName) {
  const request = {
    input: { text: textForTranslation },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "ru-RU", name: voiceName },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  pathToSpeechFile = `./audio/${uuidv4()}.mp3`;
  const [response] = await TTSclient.synthesizeSpeech(request);
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(pathToSpeechFile, response.audioContent, "binary");
  return pathToSpeechFile;
};

const recognizeText = async function (pathToImageFile) {
  const [result] = await VisionClient.textDetection(pathToImageFile);
  const detection = result.fullTextAnnotation.text;

  console.log(detection);
  return detection;
  // detections.forEach((text) => console.log(text));
};

export { textGen, audioGen, recognizeText };

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
