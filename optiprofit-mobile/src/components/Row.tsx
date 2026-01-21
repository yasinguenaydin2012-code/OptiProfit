import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";

type RowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

export function Row({ label, value, strong }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.valueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: colors.inkMuted,
    fontFamily: fonts.body,
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: fonts.title,
  },
  valueStrong: {
    color: colors.accentDeep,
  },
});
