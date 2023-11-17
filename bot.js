import { Telegraf } from "telegraf";
import { OpenAI } from "openai";
import { Console } from "console";
import { response } from "express";

// AI AREA
const openai = new OpenAI({
  apiKey: "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",
});

const textGen = async function (userMessage) {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: userMessage }],
    model: "gpt-3.5-turbo",
  });

  //   console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
  // console.log(completion.choices[0]);
};

// textGen();
// New branch
// BOT AREA
const bot = new Telegraf("6929692133:AAE1LCO5Fgf4aDm84FBUrNN8CkaJ2Dn3wZk");
bot.on("message", async (ctx) => {
  const userMessage = ctx.update.message.text;
  textGen(userMessage).then((response) => ctx.reply(response));

  //   await aiResponse.then((result) => console.log(result.data));
  //   ctx.reply(aiResponse);
  //   console.log(aiResponse);
});

bot.launch();
