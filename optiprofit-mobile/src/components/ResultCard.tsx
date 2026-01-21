import { StyleSheet, Text, View } from "react-native";

import { Row } from "./Row";
import { cardShadow, colors, fonts } from "../theme";

type ResultLine = {
  label: string;
  value: string;
  strong?: boolean;
};

type ResultCardProps = {
  title: string;
  subtitle?: string;
  lines: ResultLine[];
  tone?: "good" | "warn" | "neutral";
};

export function ResultCard({
  title,
  subtitle,
  lines,
  tone = "neutral",
}: ResultCardProps) {
  return (
    <View style={[styles.card, stylesTone[tone]]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.divider} />
      {lines.map((line) => (
        <Row
          key={`${line.label}-${line.value}`}
          label={line.label}
          value={line.value}
          strong={line.strong}
        />
      ))}
    </View>
  );
}

const stylesTone = StyleSheet.create({
  good: {
    borderColor: colors.good,
  },
  warn: {
    borderColor: colors.warn,
  },
  neutral: {
    borderColor: colors.border,
  },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: colors.card,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    ...cardShadow,
  },
  title: {
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.title,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: 10,
  },
});
