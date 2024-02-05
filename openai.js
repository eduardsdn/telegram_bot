import "dotenv/config";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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
const audioGen = async function (textForTranslation, voiceType) {
  console.log(textForTranslation);
  const audio = await openai.audio.speech.create({
    model: "tts-1",
    voice: voiceType,
    input: textForTranslation,
  });
  pathToSpeechFile = `./audio/${uuidv4()}.mp3`;
  const buffer = Buffer.from(await audio.arrayBuffer());
  await fs.promises.writeFile(pathToSpeechFile, buffer);
  return pathToSpeechFile;
};

export { textGen, audioGen };
