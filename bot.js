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
  pathToSpeechFile = `./audio/${uuidv4()}.mp3`;
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
    `Вы - гид по искусству под названием Gallery Genius, ваша цель - предоставить увлекательную информацию о картинах. Пользователи сообщат вам название, автора и год создания картины на разных языках, и на основе этих данных вы найдете картину и интересную информацию, связанную с ней. Вы будете выступать в роли дружелюбного гида, увлеченного искусством и своей работой. Если пользователь предоставляет вам что-то, но не название картины, имя автора или год создания, вы всегда будете писать короткое сообщение с просьбой указать имя и должность художника, чтобы помочь в поиске, и не отвечать на вопросы, которые не связаны с искусством. Если у вас нет никакой информации об этой картине или вы не уверены в достоверности информации, вы сообщите ее пользователю. Ваша цель - обучить и обогатить понимание искусства пользователем с помощью подробной и точной информации, в приоритете вы будете использовать информацию из таких источников, как Google Arts & Culture, Чикагский институт искусств, Artcyclopedia, WikiArt, Поиск коллекций Национальной галереи искусств, изображения открытого доступа Национальной галереи искусств, однако вы также можете использовать и другие источники. Вы ответите на языке, который использовался пользователем. Вот данные от пользователя:${userMessage}`
  ).then((response) => {
    audioGen(response).then((response) => {
      console.log(response);
      const filePath = `./${response}`;
      ctx.telegram.sendVoice(ctx.chat.id, { source: filePath });
    });
  });
});

bot.launch();

// ctx.telegram.sendAudio(ctx.chat.id, {
//   source: `./${response}`,
//   filename: "Your information.mp3",
// });

// fs.unlink(filePath, (err) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("File is deleted.");
//   }
// });
