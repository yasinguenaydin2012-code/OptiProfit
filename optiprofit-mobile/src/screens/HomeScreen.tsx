import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ResultCard } from "../components/ResultCard";
import { Pill } from "../components/Pill";
import type { CalcResult } from "../logic/calc";
import { calculate } from "../logic/calc";
import { parseInput, ParsedInput } from "../logic/parse";
import {
  clearHistory,
  HistoryEntry,
  loadHistory,
  saveHistoryEntry,
} from "../storage/history";
import { cardShadow, colors, fonts } from "../theme";

const EXAMPLES = [
  "Monster EK 0,89 VK 1,29",
  "Kasten Wasser EK 3,90 Aktion 4,49 statt 4,99",
  "Red Bull EK 0,72 VK 1,19 WKZ 200 Menge 1000",
];

function formatNumber(value: number | null, digits = 2): string {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  return value.toFixed(digits);
}

function formatPercent(value: number | null): string {
  if (value == null || Number.isNaN(value)) {
    return "-";
  }
  return `${value.toFixed(1)}%`;
}

function formatDate(value: number): string {
  const date = new Date(value);
  return `${date.toLocaleDateString("de-DE")} ${date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedInput | null>(null);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, inputAnim, cardAnim]);

  useEffect(() => {
    let mounted = true;
    loadHistory().then((items) => {
      if (mounted) {
        setHistory(items);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCheck = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setNotice("Bitte einen Text eingeben.");
        setParsed(null);
        setResult(null);
        return;
      }
      const nextParsed = parseInput(trimmed);
      setParsed(nextParsed);

      if (nextParsed.ek == null || nextParsed.vk == null) {
        setNotice("Bitte EK und VK angeben.");
        setResult(null);
        return;
      }

      setNotice(null);
      const nextResult = calculate(nextParsed);
      setResult(nextResult);

      const entry: HistoryEntry = {
        id: `h_${Date.now()}`,
        created_at: Date.now(),
        input: trimmed,
        parsed: nextParsed,
        result: nextResult,
      };
      const updated = await saveHistoryEntry(entry);
      setHistory(updated);
    },
    [setHistory]
  );

  const recommendation = useMemo(() => {
    if (!result || result.db == null) {
      return null;
    }
    if (result.db < 0) {
      return "Achtung: Verkauf unter EK.";
    }
    if (result.marge_pct != null && result.marge_pct < 10) {
      return "Marge ist knapp, Aktion pruefen.";
    }
    return "Preis wirkt solide. Aktion nur wenn noetig.";
  }, [result]);

  const resultTone = useMemo(() => {
    if (!result || result.db == null) {
      return "neutral";
    }
    return result.db < 0 ? "warn" : "good";
  }, [result]);

  const parsedSummary = useMemo(() => {
    if (!parsed) {
      return null;
    }
    return `EK ${formatNumber(parsed.ek)} | VK ${formatNumber(
      parsed.vk
    )} | Menge ${parsed.menge ?? 1}`;
  }, [parsed]);

  const animatedStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  });

  const handleClearHistory = useCallback(async () => {
    setHistoryBusy(true);
    await clearHistory();
    setHistory([]);
    setHistoryBusy(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bg}>
        <View style={styles.bgHaloOne} />
        <View style={styles.bgHaloTwo} />
        <View style={styles.bgHaloThree} />
        <View style={styles.bgRing} />
        <View style={styles.bgStripe} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, animatedStyle(headerAnim)]}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>Pricing Copilot</Text>
          </View>
          <Text style={styles.brand}>OptiProfit AI</Text>
          <Text style={styles.tagline}>
            Preischeck in Sekunden. Klarer DB, sichere Entscheidung.
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>EK/VK Parser</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>Aktionen + WKZ</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>Marge live</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.inputCard, animatedStyle(inputAnim)]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Preischeck</Text>
              <Text style={styles.sectionHint}>
                EK/VK reichen, optional Aktion, WKZ, Menge.
              </Text>
            </View>
            <View style={styles.sectionTag}>
              <Text style={styles.sectionTagText}>Live</Text>
            </View>
          </View>
          <TextInput
            style={styles.input}
            placeholder="z.B. Monster EK 0,89 VK 1,29"
            placeholderTextColor={colors.inkMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleCheck(input)}
            returnKeyType="done"
            multiline
          />
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => handleCheck(input)}
              style={({ pressed }) => [
                styles.checkButton,
                pressed && styles.checkButtonPressed,
              ]}
            >
              <Text style={styles.checkButtonText}>Jetzt pruefen</Text>
            </Pressable>
            <Text style={styles.actionHint}>Enter oder Tap</Text>
          </View>
          {parsedSummary ? (
            <Text style={styles.parsedText}>{parsedSummary}</Text>
          ) : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        </Animated.View>

        <Animated.View style={[styles.examples, animatedStyle(cardAnim)]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Schnellstart</Text>
              <Text style={styles.sectionHint}>Tap zum Einfuegen.</Text>
            </View>
          </View>
          <View style={styles.pillRow}>
            {EXAMPLES.map((example, index) => (
              <Pill
                key={example}
                label={example}
                tone={index === 0 ? "primary" : "muted"}
                onPress={() => {
                  setInput(example);
                  handleCheck(example);
                }}
              />
            ))}
          </View>
        </Animated.View>

        {result ? (
          <Animated.View style={[styles.results, animatedStyle(cardAnim)]}>
            <ResultCard
              title="Ergebnis"
              subtitle={recommendation ?? "Berechnung abgeschlossen."}
              tone={resultTone}
              lines={[
                {
                  label: "DB pro Einheit",
                  value: `${formatNumber(result.db)} EUR`,
                  strong: true,
                },
                {
                  label: "Marge",
                  value: formatPercent(result.marge_pct),
                },
                {
                  label: "Gewinn je 100",
                  value: `${formatNumber(result.gewinn_100)} EUR`,
                },
              ]}
            />

            {result.wkz_einheit != null ? (
              <ResultCard
                title="WKZ / Bonus"
                subtitle="Nur wenn WKZ gesetzt wurde."
                lines={[
                  {
                    label: "WKZ pro Einheit",
                    value: `${formatNumber(result.wkz_einheit)} EUR`,
                  },
                  {
                    label: "DB netto",
                    value: `${formatNumber(result.db_netto)} EUR`,
                    strong: true,
                  },
                ]}
              />
            ) : null}

            {parsed?.vk_normal != null ? (
              <ResultCard
                title="Normal vs Aktion"
                subtitle="Vergleich zum Normalpreis."
                lines={[
                  {
                    label: "DB normal",
                    value: `${formatNumber(result.db_norm)} EUR`,
                  },
                  {
                    label: "DB Aktion",
                    value: `${formatNumber(result.db_akt)} EUR`,
                  },
                  {
                    label: "DB Diff",
                    value: `${formatNumber(result.db_diff)} EUR`,
                    strong: true,
                  },
                  result.break_even_menge != null
                    ? {
                        label: "Break-even Menge",
                        value: `${formatNumber(result.break_even_menge, 0)}`,
                      }
                    : {
                        label: "Break-even Menge",
                        value: "-",
                      },
                ]}
              />
            ) : null}
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.historyCard, animatedStyle(cardAnim)]}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Historie</Text>
            <Pressable
              onPress={handleClearHistory}
              disabled={historyBusy}
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
                historyBusy && styles.clearButtonDisabled,
              ]}
            >
              <Text style={styles.clearButtonText}>Reset</Text>
            </Pressable>
          </View>
          {history.length === 0 ? (
            <Text style={styles.historyEmpty}>
              Noch keine Checks gespeichert.
            </Text>
          ) : (
            history.slice(0, 3).map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.historyInput}>{entry.input}</Text>
                <Text style={styles.historyMeta}>
                  {formatDate(entry.created_at)}
                </Text>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgHaloOne: {
    position: "absolute",
    top: -180,
    right: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.accentSoft,
    opacity: 0.6,
  },
  bgHaloTwo: {
    position: "absolute",
    left: -160,
    top: 120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.good,
    opacity: 0.18,
  },
  bgHaloThree: {
    position: "absolute",
    right: -120,
    bottom: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent,
    opacity: 0.18,
  },
  bgRing: {
    position: "absolute",
    top: 36,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "rgba(28,26,21,0.08)",
  },
  bgStripe: {
    position: "absolute",
    top: 260,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 32,
    backgroundColor: colors.cardAlt,
    opacity: 0.6,
    transform: [{ rotate: "12deg" }],
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 52,
  },
  header: {
    marginBottom: 20,
  },
  kickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  kickerText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.inkMuted,
    fontFamily: fonts.title,
  },
  brand: {
    marginTop: 6,
    fontSize: 34,
    color: colors.ink,
    fontFamily: fonts.display,
    letterSpacing: 0.4,
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  metaText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    ...cardShadow,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.title,
    letterSpacing: 0.2,
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  sectionTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionTagText: {
    fontSize: 10,
    color: colors.accent,
    fontFamily: fonts.title,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  input: {
    marginTop: 12,
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.inputBg,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkButton: {
    flex: 1,
    backgroundColor: colors.accentDeep,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  checkButtonPressed: {
    opacity: 0.85,
  },
  checkButtonText: {
    color: colors.badgeText,
    fontSize: 14,
    fontFamily: fonts.title,
    letterSpacing: 0.4,
  },
  actionHint: {
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  parsedText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  notice: {
    marginTop: 8,
    fontSize: 12,
    color: colors.warn,
    fontFamily: fonts.body,
  },
  examples: {
    marginBottom: 18,
  },
  pillRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  results: {
    marginBottom: 10,
  },
  historyCard: {
    marginTop: 6,
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  clearButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
  clearButtonDisabled: {
    opacity: 0.4,
  },
  clearButtonText: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
    letterSpacing: 0.2,
  },
  historyEmpty: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  historyInput: {
    fontSize: 13,
    color: colors.ink,
    fontFamily: fonts.body,
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
});
