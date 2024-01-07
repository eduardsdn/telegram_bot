import { Telegraf, Markup } from "telegraf";
import { OpenAI } from "openai";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Global variables
let chatFromat = "text";
let voiceType = "alloy";

// openai (Move to .env)
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

let pathToSpeechFile = "";
// generate auidio from generated text response
const audioGen = async function (textForTranslation) {
  const file = fs.cre;
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

// BOT

// Connect to bot with token (Move to .env)
const bot = new Telegraf("6929692133:AAE1LCO5Fgf4aDm84FBUrNN8CkaJ2Dn3wZk");

// Defining command menu
bot.telegram.setMyCommands([
  { command: "/start", description: "Welcome message" },
  { command: "/info", description: "Get info about functionality" },
  { command: "/format", description: "Change chat Format" },
  { command: "/changevoice", description: "Change voice of voice messages" },
]);

// Handling commands
bot.command("start", (ctx) =>
  ctx.reply(
    "Welcome! I am your art guide, please let me know author, painting or anything related to art and I will provie you information. Checkout the menu to see my settings!"
  )
);
bot.command("info", (ctx) => {
  ctx.reply(
    "I am your art guide, please let me know the author, painting or anything related to art and I will provie you information"
  );
});
bot.command("format", (ctx) => {
  "Please choose how you want to recieve your information";
  ctx.reply("Please pick chat format", chooseChatFormatMenu);
});
bot.command("changevoice", (ctx) => {
  ctx.reply("Please pick a voice", chooseVoiceMenu);
});

// Menus
// Menu for choosing bot response Format
const chooseChatFormatMenu = Markup.inlineKeyboard([
  [{ text: "Text", callback_data: "changeFormatText" }],
  [{ text: "Voice", callback_data: "changeFormatVoice" }],
]);
const chooseVoiceMenu = Markup.inlineKeyboard([
  [{ text: "Alloy", callback_data: "changeVoiceAlloy" }],
  [{ text: "Echo", callback_data: "changeVoiceEcho" }],
  [{ text: "Fable", callback_data: "changeVoiceFable" }],
  [{ text: "Onyx", callback_data: "changeVoiceOnyx" }],
  [{ text: "Nova", callback_data: "changeVoiceNova" }],
  [{ text: "Shimmer", callback_data: "changeVoiceShimmer" }],
]);

// Event handling for chooseChatFormatMenu buttons
bot.on("callback_query", (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  // Perform actions based on the callback data
  switch (callbackData) {
    case "changeFormatVoice":
      changeChatFormat("voice");
      console.log(chatFromat);
      break;

    case "changeFormatText":
      changeChatFormat("text");
      console.log(chatFromat);
      break;

    default:
      ctx.answerCbQuery("Invalid button");
  }

  switch (callbackData) {
    case "changeVoiceAlloy":
      changeVoiceType("alloy");
      console.log(voiceType);
      break;

    case "changeVoiceEcho":
      changeVoiceType("echo");
      console.log(voiceType);
      break;
    case "changeVoiceFable":
      changeChatFormat("fable");
      console.log(voiceType);
      break;

    case "changeVoiceOnyx":
      changeVoiceType("onyx");
      console.log(voiceType);
      break;
    case "changeVoiceNova":
      changeVoiceType("nova");
      console.log(voiceType);
      break;

    case "changeVoiceShimmer":
      changeVoiceType("shimmer");
      console.log(voiceType);
      break;
  }
});

// Listen to user messages and initiate reply based on current chat format
bot.on("message", async (ctx) => {
  const userMessage = ctx.update.message.text;

  if (chatFromat === "text") {
    replyWithText(ctx, userMessage);
  } else if (chatFromat === "voice") {
    replyWithVoice(ctx, userMessage);
  }
});

// Reply with voice message
function replyWithVoice(ctx, userMessage) {
  textGen(
    `Вы - гид по искусству под названием Gallery Genius, ваша цель - предоставить увлекательную информацию о картинах. Пользователи сообщат вам название, автора и год создания картины на разных языках, и на основе этих данных вы найдете картину и интересную информацию, связанную с ней. Вы будете выступать в роли дружелюбного гида, увлеченного искусством и своей работой. Если пользователь предоставляет вам что-то, но не название картины, имя автора или год создания, вы всегда будете писать короткое сообщение с просьбой указать имя и должность художника, чтобы помочь в поиске, и не отвечать на вопросы, которые не связаны с искусством. Если у вас нет никакой информации об этой картине или вы не уверены в достоверности информации, вы сообщите ее пользователю. Ваша цель - обучить и обогатить понимание искусства пользователем с помощью подробной и точной информации, в приоритете вы будете использовать информацию из таких источников, как Google Arts & Culture, Чикагский институт искусств, Artcyclopedia, WikiArt, Поиск коллекций Национальной галереи искусств, изображения открытого доступа Национальной галереи искусств, однако вы также можете использовать и другие источники. Вы ответите на языке, который использовался пользователем. Вот данные от пользователя:${userMessage}`
  ).then((response) => {
    audioGen(response).then((response) => {
      console.log(response);
      const filePath = response;
      ctx.telegram.sendVoice(ctx.chat.id, { source: filePath });
    });
  });
}

// Reply with text message
function replyWithText(ctx, userMessage) {
  textGen(
    `Вы - гид по искусству под названием Gallery Genius, ваша цель - предоставить увлекательную информацию о картинах. Пользователи сообщат вам название, автора и год создания картины на разных языках, и на основе этих данных вы найдете картину и интересную информацию, связанную с ней. Вы будете выступать в роли дружелюбного гида, увлеченного искусством и своей работой. Если пользователь предоставляет вам что-то, но не название картины, имя автора или год создания, вы всегда будете писать короткое сообщение с просьбой указать имя и должность художника, чтобы помочь в поиске, и не отвечать на вопросы, которые не связаны с искусством. Если у вас нет никакой информации об этой картине или вы не уверены в достоверности информации, вы сообщите ее пользователю. Ваша цель - обучить и обогатить понимание искусства пользователем с помощью подробной и точной информации, в приоритете вы будете использовать информацию из таких источников, как Google Arts & Culture, Чикагский институт искусств, Artcyclopedia, WikiArt, Поиск коллекций Национальной галереи искусств, изображения открытого доступа Национальной галереи искусств, однако вы также можете использовать и другие источники. Вы ответите на языке, который использовался пользователем. Вот данные от пользователя:${userMessage}`
  ).then((response) => {
    console.log(response);
    ctx.reply(response);
  });
}

// Change chat Format
async function changeChatFormat(format) {
  chatFromat = format;
}

async function changeVoiceType(voice) {
  voiceType = voice;
}

// Launch bot
bot.launch();
