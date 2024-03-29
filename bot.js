import fs from "fs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { createUser, findUser, updateUser } from "./database.js";
import { textGen, audioGen, recognizeText } from "./apiCalls.js"; //openAI functions
import {
  chooseChatFormatMenu,
  chooseVoiceMenu,
  chooseAnnotationLangMenu,
} from "./menus.js"; //Menus
import { prompts } from "./prompts.js";
// import { rejects } from "assert";

const main = async function () {
  dotenv.config(); //gey keys
  const telegramToken = process.env.TELEGRAM_TOKEN;

  // Connect to bot
  const bot = new Telegraf(telegramToken);

  // Defining command menu
  bot.telegram.setMyCommands([
    { command: "/info", description: "Что я умею" },
    { command: "/format", description: "Поменять формат чата" },
    { command: "/changevoice", description: "Поменять голос" },
    {
      command: "/annotation",
      description: "Поменять язык озвучивания",
    },
  ]);
  // Handling commands
  bot.command("start", async (ctx) => {
    const chatData = ctx.chat;
    if ((await findUser(chatData.id)) === null) {
      await createUser({
        _id: chatData.id,
        userName: chatData.username,
        chatFormat: "text",
        voice: "ru-Ru-Wavenet-B",
        annotationLang: "ru-RU",
      });
    } else return;
  });
  bot.command("info", async (ctx) => {
    await ctx.reply(
      "I am your art guide, please let me know the author, painting or anything related to art and I will tell you about it! I can send text and voice messages in different voices. Be sure to check the menu!"
    );
  });
  bot.command("format", async (ctx) => {
    await ctx.reply("Выберите формат чата", chooseChatFormatMenu);
  });
  bot.command("changevoice", async (ctx) => {
    await ctx.reply("Выберите голос", chooseVoiceMenu);
  });
  bot.command("annotation", async (ctx) => {
    await ctx.reply("Выберите язык озвучивания", chooseAnnotationLangMenu);
  });

  // Event handling for chooseChatFormatMenu buttons
  bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const chatData = ctx.chat;

    switch (callbackData) {
      case "changeFormatVoice":
        await updateUser(chatData.id, { chatFormat: "voice" });
        await ctx.answerCbQuery("Вы будете получать голосовые сообщения");
        break;

      case "changeFormatText":
        await updateUser(chatData.id, { chatFormat: "text" });
        await ctx.answerCbQuery("Вы будете получать текстовые сообщения");
        break;

      case "changeVoiceAlloy":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-A" });
        await ctx.answerCbQuery("Выбран голос Alloy");
        break;

      case "changeVoiceEcho":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-B" });
        await ctx.answerCbQuery("Выбран голос Echo");
        break;

      case "changeVoiceFable":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-C" });
        await ctx.answerCbQuery("Выбран голос Fable");
        break;

      case "changeVoiceOnyx":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-D" });
        await ctx.answerCbQuery("Выбран голос Onyx");
        break;

      case "changeVoiceNova":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-E" });
        await ctx.answerCbQuery("Выбран голос Нова");
        break;

      case "changeAnnotationLangEng":
        await updateUser(chatData.id, { annotationLang: "en-US" });
        await ctx.answerCbQuery("Выбран язык озвучивания: английский");
        break;

      case "changeAnnotationLangRus":
        await updateUser(chatData.id, { annotationLang: "ru-RU" });
        await ctx.answerCbQuery("Выбран язык озвучивания: русский");
        break;

      default:
        await ctx.answerCbQuery("Invalid button");
    }
  });

  // Listen to user messages and reply based on current chat format
  bot.on("text", async (ctx) => {
    const userMessage = ctx.update.message.text;
    const chatData = ctx.chat;
    console.log(userMessage);

    const chatFormat = await findUser(chatData.id).then(
      //get what chatFormat user has chosen
      (result) => result.chatFormat
    );
    const voiceType = await findUser(chatData.id).then(
      //get what voiceType user has chosen
      (result) => result.voice
    );

    ctx.reply("Пожалуйста подождите, я думаю над ответом... ");
    if (chatFormat === "text") {
      //if format is text, reply with text
      // generate response from user message and send back response as text message
      await textGen(`${prompts.detailedPrompt}${userMessage}`).then(
        (response) => {
          console.log(response);
          ctx.reply(response);
        }
      );
    } else if (chatFormat === "voice") {
      // if format is voice reply with voice message
      // generate response from user message (see replyWith voice, it generates audio file, sends the voice message and then deletes the file)
      await textGen(`${prompts.detailedPrompt}${userMessage}`).then(
        (response) => {
          replyWithVoice(ctx, response, voiceType);
        }
      );
    }
  });

  bot.on("photo", async (ctx) => {
    const chatData = ctx.chat;
    const voiceType = "";
    // defining as empty string to pass to replyWithVoice and then to audioGen where it will be assign a value based
    // on chosen annotation language

    //get what annotation language user has chosen
    let annotationLang = await findUser(chatData.id).then(
      (result) => result.annotationLang
    );
    // if there is no record of annotation language create it and default to "ru-RU"
    if (annotationLang === undefined) {
      await updateUser(chatData.id, { annotationLang: "ru-RU" });
      annotationLang = "ru-RU";
    }

    ctx.reply("Пожалуйста подождите, я думаю над ответом... ");
    // get link of the image on telegram servers
    const photoId = ctx.message.photo.pop().file_id;
    const fileUrl = await ctx.telegram.getFileLink(photoId);

    // send get request to telegram
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    // define path where an image has top be saved
    let pathToImageFile = `./images/${uuidv4()}.jpg`;

    // save the image to path defined poreviously
    await response.data
      .pipe(fs.createWriteStream(pathToImageFile))
      .on("finish", async () => {
        await recognizeText(pathToImageFile).then((detection) => {
          // Recognize text from image
          replyWithVoice(ctx, detection, voiceType, annotationLang).then(
            // Generate audio from recognized text
            fs.promises.unlink(pathToImageFile) // delete image file
          );
        });
      });
  });

  // reply with voice message and delete audio file that has been sent
  async function replyWithVoice(
    ctx,
    textForTranslation,
    voiceType,
    annotationLang
  ) {
    console.log(annotationLang);
    console.log(voiceType);
    await audioGen(textForTranslation, voiceType, annotationLang)
      .then(async (response) => {
        const filePath = response;
        console.log(filePath);
        await ctx.telegram.sendVoice(ctx.chat.id, { source: filePath }); //Send vocie message from the file
        return filePath;
      })
      .then(async (filePath) => await fs.promises.unlink(filePath)); // then delete the file
  }

  // Launch bot
  bot.launch();
};

await main();
