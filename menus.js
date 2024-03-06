import { Markup } from "telegraf";

const chooseChatFormatMenu = Markup.inlineKeyboard([
  [{ text: "Текстовые сообщения 💬", callback_data: "changeFormatText" }],
  [{ text: "Голосовые сообщения 🗣", callback_data: "changeFormatVoice" }],
]);
const chooseVoiceMenu = Markup.inlineKeyboard([
  [{ text: "Alloy 👨", callback_data: "changeVoiceAlloy" }],
  [{ text: "Echo 👨", callback_data: "changeVoiceEcho" }],
  [{ text: "Fable 👨", callback_data: "changeVoiceFable" }],
  [{ text: "Onyx 👨", callback_data: "changeVoiceOnyx" }],
  [{ text: "Nova 👩", callback_data: "changeVoiceNova" }],
  // [{ text: "Shimmer 👩", callback_data: "changeVoiceShimmer" }],
]);
const chooseAnnotationLangMenu = Markup.inlineKeyboard([
  [{ text: "Английский", callback_data: "changeAnnotationLangEng" }],
  [{ text: "Русский", callback_data: "changeAnnotationLangRus" }],
]);
const chooseImageRecognitionMenu = Markup.inlineKeyboard([
  [{ text: "Получать информацию", callback_data: "changeImgRecAnnotation" }],
  [{ text: "Получать озвучку", callback_data: "changeImgRecGetGuide" }],
]);

export {
  chooseChatFormatMenu,
  chooseVoiceMenu,
  chooseAnnotationLangMenu,
  chooseImageRecognitionMenu,
};
