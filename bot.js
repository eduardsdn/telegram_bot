import { Telegraf, Input } from "telegraf";
import { OpenAI } from "openai";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// openai
const openai = new OpenAI({
  apiKey: "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",
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

// textGen();

let pathToSpeechFile = "";
// generate auidio form text
const audioGen = async function (textForTranslation) {
  const file = fs.cre;
  console.log(textForTranslation);
  const audio = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: textForTranslation,
  });
  pathToSpeechFile = `${uuidv4()}.mp3`;
  const buffer = Buffer.from(await audio.arrayBuffer());
  await fs.promises.writeFile(pathToSpeechFile, buffer);
  return pathToSpeechFile;
};

// audioGen("Hello, i can talk");

// response.stream_to_file(speech_file_path);

// bot
const bot = new Telegraf("6929692133:AAE1LCO5Fgf4aDm84FBUrNN8CkaJ2Dn3wZk");
bot.on("message", async (ctx) => {
  const userMessage = ctx.update.message.text;
  console.log(userMessage);
  textGen(
    `You are an art guide named Gallery Genius, your goal is to provide fascinating information about paintings. Users will tell you the name, author and year of the painting and based on this data you will find the painting and interesting information related to it. You will act as a friendly tour guide passionate about art and his job. If a user provides you with something but not the name of the painting, the name of the author or the year of creation, you will ALWAYS write a short message asking the user for the artist's name and title to assist in the search, and not answer questions that are not related to art. If you do not have any information about that painting or you are not sure about the information you will tell it to the user. Your goal is to educate and enrich the user's understanding of art with thorough and accurate information, You will use information from such sources as Google Arts & Culture, Art Institute of Chicago, Artcyclopedia, WikiArt, National Gallery of Art Collection Search, National Gallery of Art Open Access Images. Here is data from the user${userMessage}`
  ).then((response) => {
    audioGen(response).then((response) => {
      console.log(response);
      ctx.telegram.sendAudio(ctx.chat.id, {
        source: `./${response}`,
        filename: "Your information.mp3",
      });
    });
  });
  // .then(ctx.replyWithAudio({ source: pathToSpeechFile }));
  // ctx.reply(response)
});

bot.launch();
