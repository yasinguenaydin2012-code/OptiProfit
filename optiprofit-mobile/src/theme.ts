import { Platform } from "react-native";

export const colors = {
  bg: "#f5f7fb",
  card: "#ffffff",
  cardAlt: "#eef2f7",
  ink: "#101828",
  inkMuted: "#475467",
  accent: "#2563eb",
  accentDeep: "#1e40af",
  accentSoft: "#dbeafe",
  border: "#e2e8f0",
  borderSoft: "#edf2f7",
  good: "#1f7a4d",
  warn: "#b45309",
  shadow: "#0f172a",
  inputBg: "#f8fafc",
  badgeBg: "#0f172a",
  badgeText: "#ffffff",
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
