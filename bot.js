import "dotenv/config";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";
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

  client.connect();

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

  // Global variables
  let chatFromat = "text";
  let voiceType = "alloy"; // STUPID! HANDLE WITH DATABASE RECORDS!

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

    // }
    // CHECK FOR LOADING STATE FOR BUTTONS BUG
    switch (callbackData) {
      case "changeFormatVoice":
        changeChatFormat("voice");
        await ctx.answerCbQuery("Формат чата изменён на голосовые сообщения");
        console.log(chatFromat);
        break;

      case "changeFormatText":
        changeChatFormat("text");
        await ctx.answerCbQuery("Формат чата изменён на текстовые сообщения");
        console.log(chatFromat);
        break;

      case "changeVoiceAlloy":
        changeVoiceType("alloy");
        await ctx.answerCbQuery("Голос изменён на Alloy");
        console.log(voiceType);
        break;

      case "changeVoiceEcho":
        changeVoiceType("echo");
        await ctx.answerCbQuery("Голос изменён на Echo");
        console.log(voiceType);
        break;
      case "changeVoiceFable":
        await ctx.answerCbQuery("Голос изменён на Fable");
        changeChatFormat("fable");
        console.log(voiceType);
        break;

      case "changeVoiceOnyx":
        await ctx.answerCbQuery("Голос изменён на Onyx");
        changeVoiceType("onyx");
        console.log(voiceType);
        break;
      case "changeVoiceNova":
        changeVoiceType("nova");
        await ctx.answerCbQuery("Голос изменён на Нова");
        console.log(voiceType);
        break;

      case "changeVoiceShimmer":
        changeVoiceType("shimmer");
        await ctx.answerCbQuery("Голос изменён на Шиммер");
        console.log(voiceType);
        break;

      default:
        await ctx.answerCbQuery("Недействительная кнопка");
    }
  });

  // Listen to user messages and reply based on current chat format
  bot.on("message", async (ctx) => {
    const userMessage = ctx.update.message.text;
    console.log(userMessage);
    if (chatFromat === "text") {
      await replyWithText(ctx, userMessage);
    } else if (chatFromat === "voice") {
      replyWithVoice(ctx, userMessage);
    }
  });

  // Reply with voice message
  async function replyWithVoice(ctx, userMessage) {
    textGen(`${prompts.detailedPrompt}${userMessage}`).then(
      async (response) => {
        console.log(response);
        audioGen(response, voiceType).then((response) => {
          const filePath = response;
          console.log(filePath);
          ctx.telegram.sendVoice(ctx.chat.id, { source: filePath });
        });
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

  // Change chat Format
  async function changeChatFormat(format) {
    chatFromat = format;
  }

  async function changeVoiceType(voice) {
    voiceType = voice;
  }

  // Launch bot
  bot.launch();
};

main();
