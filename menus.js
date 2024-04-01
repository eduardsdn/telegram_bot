import { Markup } from "telegraf";

const chooseChatFormatMenu = Markup.inlineKeyboard([
  [{ text: "Текстовые сообщения 💬", callback_data: "changeFormatText" }],
  [{ text: "Голосовые сообщения 🗣", callback_data: "changeFormatVoice" }],
]);
const chooseVoiceMenu = Markup.inlineKeyboard([
  [{ text: "Нина 👩🏻‍🦱", callback_data: "changeVoiceAlloy" }],
  [{ text: "Георгий 👨🏻‍🦲", callback_data: "changeVoiceEcho" }],
  [{ text: "Даша 👱🏻‍♀️", callback_data: "changeVoiceFable" }],
  [{ text: "Никита 👨🏻", callback_data: "changeVoiceOnyx" }],
  [{ text: "Ника 👩🏻", callback_data: "changeVoiceNova" }],
  // [{ text: "Shimmer 👩", callback_data: "changeVoiceShimmer" }],
]);
const chooseAnnotationLangMenu = Markup.inlineKeyboard([
  [{ text: "Английский", callback_data: "changeAnnotationLangEng" }],
  [{ text: "Русский", callback_data: "changeAnnotationLangRus" }],
]);
const chooseImageRecognitionMenu = Markup.inlineKeyboard([
  [
    {
      text: "Информация о произведении ℹ️",
      callback_data: "changeImgRecAnnotation",
    },
  ],
  [{ text: "Озвучивание текста 🗣️📜", callback_data: "changeImgRecGetGuide" }],
]);

export {
  chooseChatFormatMenu,
  chooseVoiceMenu,
  chooseAnnotationLangMenu,
  chooseImageRecognitionMenu,
};
