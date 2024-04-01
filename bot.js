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
  chooseImageRecognitionMenu,
} from "./menus.js"; //Menus
import { promptsText, commandsText } from "./text.js";

const main = async function () {
  dotenv.config(); //get keys
  const telegramToken = process.env.TELEGRAM_TOKEN;

  // Connect to bot
  const bot = new Telegraf(telegramToken);

  // Defining command menu
  bot.telegram.setMyCommands([
    { command: "/info", description: "Что я умею" },
    { command: "/replyformat", description: "Поменять формат чата" },
    { command: "/voice", description: "Поменять голос" },
    {
      command: "/language",
      description: "Поменять язык озвучивания",
    },
    {
      command: "/mode",
      description: "Поменять режим распознавание изображения",
    },
  ]);
  // Handling commands
  bot.command("start", async (ctx) => {
    const chatData = ctx.chat;
    ctx.sendMessage(commandsText.start);
    ctx.sendMessage(commandsText.info);
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
    await ctx.sendMessage(commandsText.info);
  });
  bot.command("replyformat", async (ctx) => {
    await ctx.reply("Выберите формат чата", chooseChatFormatMenu);
  });
  bot.command("voice", async (ctx) => {
    await ctx.reply("Выберите голос", chooseVoiceMenu);
  });
  bot.command("language", async (ctx) => {
    await ctx.reply("Выберите язык озвучивания", chooseAnnotationLangMenu);
  });
  bot.command("mode", async (ctx) => {
    await ctx.reply(
      "Выберите режим распознавания изображения",
      chooseImageRecognitionMenu
    );
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
        await ctx.answerCbQuery("Выбран голос Аллой");
        break;

      case "changeVoiceEcho":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-B" });
        await ctx.answerCbQuery("Выбран голос Эхо");
        break;

      case "changeVoiceFable":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-C" });
        await ctx.answerCbQuery("Выбран голос Фейбл");
        break;

      case "changeVoiceOnyx":
        await updateUser(chatData.id, { voice: "ru-Ru-Wavenet-D" });
        await ctx.answerCbQuery("Выбран голос Оникс");
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

      case "changeImgRecAnnotation":
        await updateUser(chatData.id, { imgRecMode: "guide" });
        await ctx.answerCbQuery("Вы будете получать информацию");
        await ctx.reply(
          "Вы будете получать информацию, отправьте фото или введите название картины"
        );
        break;

      case "changeImgRecGetGuide":
        await updateUser(chatData.id, { imgRecMode: "annotation" });
        await ctx.answerCbQuery("Вы будете получать озвучку");
        await ctx.reply(
          "Вы будете получать озвучку. Если вы хотите поменять язык озвучки использвуйте комманду /language"
        );
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
      await textGen(`${promptsText.mainPrompt}${userMessage}`).then(
        (response) => {
          console.log(response);
          ctx.reply(response);
        }
      );
    } else if (chatFormat === "voice") {
      // if format is voice reply with voice message
      // generate response from user message (see replyWith voice, it generates audio file, sends the voice message and then deletes the file)
      await textGen(`${promptsText.mainPrompt}${userMessage}`).then(
        (response) => {
          replyWithVoice(ctx, response, voiceType);
        }
      );
    }
  });

  bot.on("photo", async (ctx) => {
    const chatData = ctx.chat;
    let imgRecMode = await findUser(chatData.id).then(
      // get what image recognition mode the user has chosen
      (result) => result.imgRecMode
    );
    if (imgRecMode === undefined) {
      // if there is no record of image recognition mode create it and default to "annotaion"
      await updateUser(chatData.id, { annotationLang: "annotation" });
      annotationLang = "annotation";
    }

    console.log(imgRecMode);

    if (imgRecMode === "annotation") {
      onPhotoReplyWithAnnotation(ctx);
    } else if (imgRecMode === "guide") {
      onPhotoReplyWithGuide(ctx);
    }
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

  async function onPhotoReplyWithAnnotation(ctx) {
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
          if (detection === null) {
            ctx.reply("no text");
          } else {
            // Recognize text from image
            replyWithVoice(ctx, detection, voiceType, annotationLang).then(
              // Generate audio from recognized text
              fs.promises.unlink(pathToImageFile) // delete image file
            );
          }
        });
      });
  }

  async function onPhotoReplyWithGuide(ctx) {
    const chatData = ctx.chat;
    const voiceType = "";

    const annotationLang = "ru-RU";

    ctx.reply("Пожалуйста подождите, я думаю над ответом... ");

    const photoId = ctx.message.photo.pop().file_id;
    const fileUrl = await ctx.telegram.getFileLink(photoId);

    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    let pathToImageFile = `./images/${uuidv4()}.jpg`;

    await response.data
      .pipe(fs.createWriteStream(pathToImageFile))
      .on("finish", async () => {
        await recognizeText(pathToImageFile).then(async (detection) => {
          if (detection === null) {
            ctx.reply("Пожалуйста, предоставьте фото с текстом");
            fs.promises.unlink(pathToImageFile);
          } else {
            await textGen(`${promptsText.imageRecPrompt}${detection}`)
              .then((response) =>
                replyWithVoice(ctx, response, voiceType, annotationLang)
              )
              .then(
                // Generate audio from recognized text
                fs.promises.unlink(pathToImageFile) // delete image file
              )
              .catch((err) => console.log(err));
          }
        });
      });
  }

  // Launch bot
  bot.launch();
};

await main();
