import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts } from "../theme";

type PillProps = {
  label: string;
  onPress?: () => void;
  tone?: "primary" | "muted";
};

export function Pill({ label, onPress, tone = "muted" }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        tone === "primary" ? styles.primary : styles.muted,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === "primary" ? styles.labelPrimary : styles.labelMuted,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.accentDeep,
    borderColor: colors.accentDeep,
  },
  muted: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.body,
    letterSpacing: 0.2,
  },
  labelPrimary: {
    color: colors.badgeText,
  },
  labelMuted: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.7,
  },
});
