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
        <View style={styles.bgWash} />
        <View style={styles.bgHaloOne} />
        <View style={styles.bgHaloTwo} />
        <View style={styles.bgHaloThree} />
        <View style={styles.bgGridVertical} />
        <View style={styles.bgGridVerticalTwo} />
        <View style={styles.bgGridHorizontal} />
        <View style={styles.bgGridHorizontalTwo} />
        <View style={styles.bgTape} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, animatedStyle(headerAnim)]}>
          <View style={styles.kickerRow}>
            <View style={styles.kickerDot} />
            <Text style={styles.kickerText}>Live Pricing Desk</Text>
            <View style={styles.kickerBadge}>
              <Text style={styles.kickerBadgeText}>MVP</Text>
            </View>
          </View>
          <Text style={styles.brand}>OptiProfit AI</Text>
          <Text style={styles.tagline}>
            Preispruefung direkt am Regal. EK/VK rein, DB raus.
          </Text>
          <View style={styles.heroRow}>
            <View style={[styles.heroCard, styles.heroCardPrimary]}>
              <Text style={styles.heroValue}>DB</Text>
              <Text style={styles.heroLabel}>pro Einheit</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>WKZ</Text>
              <Text style={styles.heroLabel}>Bonus netto</Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroValue}>BE</Text>
              <Text style={styles.heroLabel}>Break-even</Text>
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
              <Text style={styles.sectionTagText}>Offline</Text>
            </View>
          </View>
          <View style={styles.inputShell}>
            <Text style={styles.inputLabel}>Eingabe</Text>
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
          </View>
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
            <View style={styles.parsedPill}>
              <Text style={styles.parsedText}>{parsedSummary}</Text>
            </View>
          ) : null}
          {notice ? (
            <View style={styles.noticeBox}>
              <Text style={styles.notice}>{notice}</Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View style={[styles.examples, animatedStyle(cardAnim)]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Schnellstart</Text>
              <Text style={styles.sectionHint}>
                Tap zum Einfuegen, sofort rechnen.
              </Text>
            </View>
            <View style={styles.sectionBadgeMuted}>
              <Text style={styles.sectionBadgeMutedText}>3 Beispiele</Text>
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
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.sectionTitle}>Auswertung</Text>
                <Text style={styles.sectionHint}>
                  Deterministisch, ohne KI-Rechnung.
                </Text>
              </View>
            </View>
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
            <View>
              <Text style={styles.sectionTitle}>Historie</Text>
              <Text style={styles.sectionHint}>
                Letzte Checks, lokal gespeichert.
              </Text>
            </View>
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
            history.slice(0, 3).map((entry, index) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyBody}>
                  <Text style={styles.historyInput}>{entry.input}</Text>
                  <Text style={styles.historyMeta}>
                    {formatDate(entry.created_at)}
                  </Text>
                </View>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{`#${index + 1}`}</Text>
                </View>
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
  bgWash: {
    position: "absolute",
    top: -120,
    left: -40,
    right: -40,
    height: 320,
    borderRadius: 260,
    backgroundColor: colors.cardAlt,
    opacity: 0.55,
  },
  bgHaloOne: {
    position: "absolute",
    top: -200,
    right: -160,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: colors.accentSoft,
    opacity: 0.55,
  },
  bgHaloTwo: {
    position: "absolute",
    left: -180,
    top: 120,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.good,
    opacity: 0.16,
  },
  bgHaloThree: {
    position: "absolute",
    right: -140,
    bottom: -160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accent,
    opacity: 0.14,
  },
  bgGridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "18%",
    width: 1,
    backgroundColor: "rgba(28,26,21,0.08)",
  },
  bgGridVerticalTwo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: "22%",
    width: 1,
    backgroundColor: "rgba(28,26,21,0.06)",
  },
  bgGridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "36%",
    height: 1,
    backgroundColor: "rgba(28,26,21,0.07)",
  },
  bgGridHorizontalTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "18%",
    height: 1,
    backgroundColor: "rgba(28,26,21,0.05)",
  },
  bgTape: {
    position: "absolute",
    top: 220,
    right: -80,
    width: 220,
    height: 70,
    borderRadius: 26,
    backgroundColor: colors.cardAlt,
    opacity: 0.8,
    transform: [{ rotate: "16deg" }],
  },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 18,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  kickerText: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: colors.inkMuted,
    fontFamily: fonts.title,
  },
  kickerBadge: {
    borderRadius: 999,
    backgroundColor: colors.badgeBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  kickerBadgeText: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: colors.badgeText,
    fontFamily: fonts.title,
  },
  brand: {
    marginTop: 6,
    fontSize: 36,
    color: colors.ink,
    fontFamily: fonts.display,
    letterSpacing: 0.6,
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  heroRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  heroCard: {
    flexGrow: 1,
    minWidth: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroCardPrimary: {
    borderColor: colors.accentDeep,
    backgroundColor: colors.accentSoft,
  },
  heroValue: {
    fontSize: 16,
    color: colors.ink,
    fontFamily: fonts.title,
    letterSpacing: 0.3,
  },
  heroLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 26,
    padding: 18,
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
    backgroundColor: colors.cardAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sectionTagText: {
    fontSize: 10,
    color: colors.ink,
    fontFamily: fonts.title,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionBadgeMuted: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionBadgeMutedText: {
    fontSize: 10,
    color: colors.inkMuted,
    fontFamily: fonts.title,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  inputShell: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: colors.inkMuted,
    fontFamily: fonts.title,
  },
  input: {
    marginTop: 6,
    minHeight: 90,
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.body,
    lineHeight: 20,
    textAlignVertical: "top",
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
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
  },
  parsedPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  noticeBox: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warn,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  notice: {
    fontSize: 12,
    color: colors.warn,
    fontFamily: fonts.body,
  },
  examples: {
    marginBottom: 18,
    padding: 14,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
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
  resultsHeader: {
    marginBottom: 8,
  },
  historyCard: {
    marginTop: 10,
    padding: 16,
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
    gap: 12,
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
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  historyBody: {
    flex: 1,
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
  historyBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  historyBadgeText: {
    fontSize: 10,
    color: colors.inkMuted,
    fontFamily: fonts.title,
    letterSpacing: 0.4,
  },
});
