import { StyleSheet, Text, View } from "react-native";

import { Row } from "./Row";

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
    borderColor: "#1aa179",
  },
  warn: {
    borderColor: "#d36b1e",
  },
  neutral: {
    borderColor: "#d5c8b6",
  },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: "#fffaf2",
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: "#1f1b16",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    color: "#1f1b16",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b645c",
  },
  divider: {
    height: 1,
    backgroundColor: "#eadfce",
    marginVertical: 10,
  },
});
