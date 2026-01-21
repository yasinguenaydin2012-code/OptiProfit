import { Platform } from "react-native";

export const colors = {
  bg: "#f4ede3",
  card: "#fff8ee",
  cardAlt: "#fff1e2",
  ink: "#1c1a15",
  inkMuted: "#6b5f51",
  accent: "#e4572e",
  accentDeep: "#0f7b73",
  accentSoft: "#ffd7b7",
  border: "#e2d2c0",
  borderSoft: "#eadfce",
  good: "#1a936f",
  warn: "#d36b1e",
  shadow: "#201a16",
  inputBg: "#fffdf8",
  badgeBg: "#1c1a15",
  badgeText: "#fff8ee",
};

export const fonts = {
  display: Platform.select({
    ios: "Didot",
    android: "serif",
    default: "serif",
  }),
  title: Platform.select({
    ios: "AvenirNext-DemiBold",
    android: "sans-serif-medium",
    default: "sans-serif-medium",
  }),
  body: Platform.select({
    ios: "AvenirNext-Regular",
    android: "sans-serif-light",
    default: "sans-serif",
  }),
};

export const cardShadow = {
  shadowColor: colors.shadow,
  shadowOpacity: 0.12,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 18,
  elevation: 4,
};
