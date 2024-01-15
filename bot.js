import "dotenv/config";
import { Telegraf } from "telegraf";

import { textGen, audioGen } from "./openai.js"; //openAI functions
import { chooseChatFormatMenu, chooseVoiceMenu } from "./menus.js"; //Menus

import { prompts } from "./prompts.js";

// Global variables
let chatFromat = "text";
let voiceType = "alloy"; // STUPID! HADLE WITH DATABASE RECORD!

// Connect to bot (Move token to .env)
const bot = new Telegraf("6929692133:AAE1LCO5Fgf4aDm84FBUrNN8CkaJ2Dn3wZk");

// Defining command menu
bot.telegram.setMyCommands([
  { command: "/start", description: "Welcome" },
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

// Event handling for chooseChatFormatMenu buttons
bot.on("callback_query", (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  // }
  // CHECK
  switch (callbackData) {
    case "changeFormatVoice":
      changeChatFormat("voice");
      console.log(chatFromat);
      break;

    case "changeFormatText":
      changeChatFormat("text");
      console.log(chatFromat);
      break;

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

    default:
      ctx.answerCbQuery("Invalid button");
  }
});

// Listen to user messages and initiate reply based on current chat format
bot.on("message", async (ctx) => {
  const userMessage = ctx.update.message.text;
  console.log(userMessage);
  if (chatFromat === "text") {
    replyWithText(ctx, userMessage);
  } else if (chatFromat === "voice") {
    replyWithVoice(ctx, userMessage);
  }
});

// Reply with voice message
function replyWithVoice(ctx, userMessage) {
  textGen(`${prompts.detailedPrompt}${userMessage}`).then((response) => {
    console.log(response);
    audioGen(response, voiceType).then((response) => {
      const filePath = response;
      console.log(filePath);
      ctx.telegram.sendVoice(ctx.chat.id, { source: filePath });
    });
  });
}

// Reply with text message
function replyWithText(ctx, userMessage) {
  textGen(`${prompts.detailedPrompt}${userMessage}`).then((response) => {
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
