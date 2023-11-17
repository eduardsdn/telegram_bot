import { Telegraf } from "telegraf";
import { OpenAI } from "openai";
import { Console } from "console";

// AI AREA
const openai = new OpenAI({
  apiKey: "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",
});

const textGen = async function (userMessage) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
};

// textGen();

// BOT AREA
const bot = new Telegraf("6913146166:AAHb7hpIPQLuRJVpXoU573slCF90ay7GEjk");
bot.on("message", (ctx) => {
  const userMessage = ctx.update.message.text;
  let aiResponse = textGen(userMessage);
  //   ctx.reply(aiResponse);
  console.log(aiResponse);
});

bot.launch();
