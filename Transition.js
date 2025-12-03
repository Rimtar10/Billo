import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigation } from "@react-navigation/native";

export default function Transactions({ route }) {
  const navigation = useNavigation();
  const { transactions = [], selectedCurrency = "USD" } = route.params || {};

  const [filterType, setFilterType] = useState("all"); // all | income | expense
  const [searchDate, setSearchDate] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const typeMatch = filterType === "all" ? true : t.type === filterType;

    // Ensure timestamp is string for startsWith
    const dateStr = new Date(t.timestamp).toISOString().split("T")[0];
    const dateMatch = searchDate ? dateStr === searchDate : true;

    return typeMatch && dateMatch;
  });

  const formatAmount = (t) => {
    const currencySymbols = { USD: "$" };
    const symbol = currencySymbols[t.currency] || "";
    const sign = t.type === "income" ? "+" : "-";
    return `${sign}${symbol}${t.amount.toLocaleString()}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft color="#3b82f6" size={24} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Transaction History</Text>
      </View>

      {/* Filter buttons */}
      <View style={styles.filters}>
        {["all", "income", "expense"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text style={{ color: filterType === type ? "#fff" : "#000" }}>
              {type === "all" ? "All" : type === "income" ? "Received" : "Sent"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date filter */}
      <TextInput
        style={styles.dateInput}
        placeholder="Filter by date (YYYY-MM-DD)"
        value={searchDate}
        onChangeText={setSearchDate}
      />

      {/* Transactions list */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <View style={styles.left}>
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor:
                      item.type === "income" ? "#10b98120" : "#ef444420",
                  },
                ]}
              >
                <Clock
                  size={20}
                  color={item.type === "income" ? "#10b981" : "#ef4444"}
                />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
              </View>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.type === "income" ? "#10b981" : "#ef4444" },
              ]}
            >
              {formatAmount(item)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No transactions found.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  headerContainer: { marginBottom: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
    marginLeft: 6,
  },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  filters: { flexDirection: "row", marginBottom: 12 },
  filterButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    marginRight: 10,
  },
  filterActive: { backgroundColor: "#2f40fcff" },
  dateInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  left: { flexDirection: "row", alignItems: "center" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 2 },
  date: { fontSize: 13, color: "#9ca3af" },
  amount: { fontSize: 16, fontWeight: "700" },
});
