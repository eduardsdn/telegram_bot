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
    // model: "gpt-3.5-turbo",
    model: "gpt-4",
  });
  return completion.choices[0].message.content;
};

// generate audio from text and save the file, returns path to the audio file
const audioGen = async function (
  textForTranslation,
  voiceName,
  annotationLang
) {
  let langCode = "ru-RU"; // define default language code which is used for voice messages (only Russian)

  if (annotationLang) {
    // if this function is called for image annotation (i.e. annotationLang prop has been passed)
    langCode = annotationLang; // change the language code accordingly
    if (langCode === "ru-RU") {
      voiceName = "ru-Ru-Wavenet-B"; //
    } else if (langCode === "en-US") {
      voiceName = "en-US-Studio-Q";
    }
  }

  // define a request for tts api
  const request = {
    input: { text: textForTranslation },
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

  if (result.fullTextAnnotation === null) {
    return null;
  } else {
    const detection = result.fullTextAnnotation.text;
    return detection;
  }
};

export { textGen, audioGen, recognizeText };
