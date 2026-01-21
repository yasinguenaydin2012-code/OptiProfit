import { StyleSheet, Text, View } from "react-native";

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
    fontSize: 13,
    color: "#5b5a57",
    letterSpacing: 0.2,
  },
  value: {
    fontSize: 14,
    color: "#1e1c17",
  },
  valueStrong: {
    fontWeight: "700",
    color: "#0f8b8d",
  },
});
