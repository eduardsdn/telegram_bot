import fs from "fs";
import "dotenv/config";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { textGen, audioGen } from "./openai.js"; //openAI functions
import { chooseChatFormatMenu, chooseVoiceMenu } from "./menus.js"; //Menus
import { prompts } from "./prompts.js";
import { MongoClient } from "mongodb";

const main = async function () {
  dotenv.config(); //gey keys
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const mongodbKey = process.env.MONGODB_KEY;

  const client = new MongoClient(mongodbKey); // connect to database
  try {
    await client.connect();
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }

  await client.connect();

  async function createUser(client, newUser) {
    // Create new user record
    const result = await client
      .db("test_galleryGenius")
      .collection("Users")
      .insertOne(newUser);
    console.log(result.insertedId);
  }

  async function findUser(client, userID) {
    return client
      .db("test_galleryGenius")
      .collection("Users")
      .findOne({ _id: userID });
  }

  async function updateUser(client, userID, updatedState) {
    client
      .db("test_galleryGenius")
      .collection("Users")
      .updateOne({ _id: userID }, { $set: updatedState });
  }

  // Connect to bot (Move token to .env)
  const bot = new Telegraf(telegramToken);

  // Defining command menu
  bot.telegram.setMyCommands([
    // { command: "/start", description: "Welcome" },
    { command: "/info", description: "Get info about functionality" },
    { command: "/format", description: "Change chat Format" },
    { command: "/changevoice", description: "Change voice of voice messages" },
  ]);

  // Handling commands
  bot.command("start", async (ctx) => {
    const chatData = ctx.chat;
    if ((await findUser(client, chatData.id)) === null) {
      createUser(client, {
        _id: chatData.id,
        userName: chatData.username,
        chatFormat: "text",
        voice: "alloy",
      });
    } else return;
  });

  bot.command("info", async (ctx) => {
    await ctx.reply(
      "I am your art guide, please let me know the author, painting or anything related to art and I will provie you information"
    );
  });
  bot.command("format", async (ctx) => {
    "Please choose how you want to recieve your information";
    await ctx.reply("Please pick chat format", chooseChatFormatMenu);
  });
  bot.command("changevoice", async (ctx) => {
    await ctx.reply("Please pick a voice", chooseVoiceMenu);
  });

  // Event handling for chooseChatFormatMenu buttons
  bot.on("callback_query", async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    const chatData = ctx.chat;

    switch (callbackData) {
      case "changeFormatVoice":
        await updateUser(client, chatData.id, { chatFormat: "voice" });
        await ctx.answerCbQuery("Формат чата изменён на голосовые сообщения");
        break;

      case "changeFormatText":
        await updateUser(client, chatData.id, { chatFormat: "text" });
        await ctx.answerCbQuery("Формат чата изменён на текстовые сообщения");
        break;

      case "changeVoiceAlloy":
        await updateUser(client, chatData.id, { voice: "alloy" });
        await ctx.answerCbQuery("Голос изменён на Alloy");
        break;

      case "changeVoiceEcho":
        await updateUser(client, chatData.id, { voice: "echo" });
        await ctx.answerCbQuery("Голос изменён на Echo");
        break;

      case "changeVoiceFable":
        await updateUser(client, chatData.id, { voice: "fable" });
        await ctx.answerCbQuery("Голос изменён на Fable");
        break;

      case "changeVoiceOnyx":
        await updateUser(client, chatData.id, { voice: "onyx" });
        await ctx.answerCbQuery("Голос изменён на Onyx");
        break;

      case "changeVoiceNova":
        await updateUser(client, chatData.id, { voice: "nova" });
        await ctx.answerCbQuery("Голос изменён на Нова");
        break;

      case "changeVoiceShimmer":
        await updateUser(client, chatData.id, { voice: "shimmer" });
        await ctx.answerCbQuery("Голос изменён на Шиммер");
        break;

      default:
        await ctx.answerCbQuery("Недействительная кнопка");
    }
  });

  // Listen to user messages and reply based on current chat format
  bot.on("message", async (ctx) => {
    const userMessage = ctx.update.message.text;
    const chatData = ctx.chat;
    console.log(userMessage);

    const chatFormat = await findUser(client, chatData.id).then(
      //get what chatFormat user has chosen
      (result) => result.chatFormat
    );
    const voiceType = await findUser(client, chatData.id).then(
      //get what voiceType user has chosen
      (result) => result.voice
    );

    if (chatFormat === "text") {
      //if format is text, reply with text
      await replyWithText(ctx, userMessage);
    } else if (chatFormat === "voice") {
      // if format is voice reply with voice message
      replyWithVoice(ctx, userMessage, voiceType);
    }
  });

  // Reply with voice message
  async function replyWithVoice(ctx, userMessage, voiceType) {
    textGen(`${prompts.detailedPrompt}${userMessage}`).then(
      async (response) => {
        console.log(response);
        audioGen(response, voiceType)
          .then(async (response) => {
            const filePath = response;
            console.log(filePath);
            await ctx.telegram.sendVoice(ctx.chat.id, { source: filePath });
            return filePath;
          })
          .then((filePath) => fs.unlinkSync(filePath));
      }
    );
  }

  // Reply with text message
  async function replyWithText(ctx, userMessage) {
    await textGen(`${prompts.detailedPrompt}${userMessage}`).then(
      (response) => {
        console.log(response);
        ctx.reply(response);
      }
    );
  }

  // Launch bot
  bot.launch();
};

await main();
