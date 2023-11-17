import { Telegraf } from "telegraf";
import { OpenAI } from "openai";
import { Console } from "console";
import { response } from "express";

// openai
const openai = new OpenAI({
  apiKey: "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",
});

const textGen = async function (userMessage) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
};

// bot
const bot = new Telegraf("6929692133:AAE1LCO5Fgf4aDm84FBUrNN8CkaJ2Dn3wZk");
bot.on("message", async (ctx) => {
  const userMessage = ctx.update.message.text;
  textGen(userMessage).then((response) => ctx.reply(response));
});

bot.launch();
