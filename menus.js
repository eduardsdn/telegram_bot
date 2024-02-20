import { Markup } from "telegraf";

const chooseChatFormatMenu = Markup.inlineKeyboard([
  [{ text: "Text 💬", callback_data: "changeFormatText" }],
  [{ text: "Voice 🗣", callback_data: "changeFormatVoice" }],
]);
const chooseVoiceMenu = Markup.inlineKeyboard([
  [{ text: "Alloy 👨", callback_data: "changeVoiceAlloy" }],
  [{ text: "Echo 👨", callback_data: "changeVoiceEcho" }],
  [{ text: "Fable 👨", callback_data: "changeVoiceFable" }],
  [{ text: "Onyx 👨", callback_data: "changeVoiceOnyx" }],
  [{ text: "Nova 👩", callback_data: "changeVoiceNova" }],
  // [{ text: "Shimmer 👩", callback_data: "changeVoiceShimmer" }],
]);

export { chooseChatFormatMenu, chooseVoiceMenu };
