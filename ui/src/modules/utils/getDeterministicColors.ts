import isLightColor from "./isLightColor";
import stringToDeterministicColor from "./stringToDeterministicColor";

export default function (baseHex: string) {
  const background = stringToDeterministicColor(baseHex);
  const isLight = isLightColor(background);

  return {
    color: isLight ? "#000000" : "#ffffff",
    background,
  };
}
