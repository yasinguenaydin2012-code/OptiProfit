import { Pressable, StyleSheet, Text } from "react-native";

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
      <Text style={styles.label}>{label}</Text>
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
    backgroundColor: "#0f8b8d",
    borderColor: "#0f8b8d",
  },
  muted: {
    backgroundColor: "#f7efe4",
    borderColor: "#d5c8b6",
  },
  label: {
    fontSize: 13,
    color: "#1f1b16",
  },
  pressed: {
    opacity: 0.7,
  },
});
