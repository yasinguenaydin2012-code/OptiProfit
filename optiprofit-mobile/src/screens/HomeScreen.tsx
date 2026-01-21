import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
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
        <View style={styles.bgOrbOne} />
        <View style={styles.bgOrbTwo} />
        <View style={styles.bgOrbThree} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, animatedStyle(headerAnim)]}>
          <Text style={styles.brand}>OptiProfit AI</Text>
          <Text style={styles.tagline}>
            Preischeck in Sekunden. Klare Marge, klare Entscheidung.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.inputCard, animatedStyle(inputAnim)]}>
          <Text style={styles.sectionTitle}>Preischeck</Text>
          <Text style={styles.sectionHint}>
            Schreibe EK/VK, optional Aktion, WKZ, Menge.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="z.B. Monster EK 0,89 VK 1,29"
            placeholderTextColor="#8a8074"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleCheck(input)}
            returnKeyType="done"
            multiline
          />
          <Pressable
            onPress={() => handleCheck(input)}
            style={({ pressed }) => [
              styles.checkButton,
              pressed && styles.checkButtonPressed,
            ]}
          >
            <Text style={styles.checkButtonText}>Jetzt pruefen</Text>
          </Pressable>
          {parsedSummary ? (
            <Text style={styles.parsedText}>{parsedSummary}</Text>
          ) : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        </Animated.View>

        <Animated.View style={[styles.examples, animatedStyle(cardAnim)]}>
          <Text style={styles.sectionTitle}>Beispiele</Text>
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
          <Animated.View style={animatedStyle(cardAnim)}>
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

        <View style={styles.history}>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1e9df",
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  bgOrbOne: {
    position: "absolute",
    top: -160,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#f7c59f",
    opacity: 0.45,
  },
  bgOrbTwo: {
    position: "absolute",
    left: -140,
    top: 120,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#bcd9c9",
    opacity: 0.5,
  },
  bgOrbThree: {
    position: "absolute",
    right: -80,
    bottom: -140,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#ffe1a8",
    opacity: 0.6,
  },
  scroll: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1f1b16",
    fontFamily: Platform.select({
      ios: "AvenirNext-Heavy",
      android: "serif",
      default: "serif",
    }),
  },
  tagline: {
    marginTop: 6,
    fontSize: 14,
    color: "#5d564f",
    lineHeight: 20,
  },
  inputCard: {
    backgroundColor: "#fff6ea",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e3d4c2",
    marginBottom: 18,
    shadowColor: "#1f1b16",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f1b16",
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b645c",
  },
  input: {
    marginTop: 12,
    minHeight: 74,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8c7b4",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f1b16",
    backgroundColor: "#fffdf9",
  },
  checkButton: {
    marginTop: 12,
    backgroundColor: "#0f8b8d",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  checkButtonPressed: {
    opacity: 0.8,
  },
  checkButtonText: {
    color: "#fff7ed",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  parsedText: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b645c",
  },
  notice: {
    marginTop: 8,
    fontSize: 12,
    color: "#b04b1d",
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
  history: {
    marginTop: 10,
    paddingBottom: 10,
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
    borderColor: "#d5c8b6",
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
    color: "#5b5a57",
  },
  historyEmpty: {
    fontSize: 12,
    color: "#6b645c",
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eadfce",
  },
  historyInput: {
    fontSize: 13,
    color: "#1f1b16",
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 11,
    color: "#7a7167",
  },
});
