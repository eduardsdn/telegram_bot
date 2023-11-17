import { OpenAI } from "openai";

// const openai = new OpenAI({
//   apiKey: "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",
// });

const textGen = async function () {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Who won the world series in 2020?" }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
};

export const openai = new OpenAI({
  apiKey: "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",
});

// export default textGen;
