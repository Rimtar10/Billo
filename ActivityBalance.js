import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react";

const screenWidth = Dimensions.get("window").width;

const BalanceTransactions = ({ route }) => {
  const navigation = useNavigation();
  const { transactions = [] } = route.params; // receive transactions

  // --- PIE CHART DATA ---
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const pieData = [
    {
      name: "Income",
      amount: income,
      color: "#00a3056f",
      legendFontColor: "#555",
      legendFontSize: 16,
    },
    {
      name: "Expenses",
      amount: expenses,
      color: "#fe5c51ff",
      legendFontColor: "#555",
      legendFontSize: 16,
    },
  ];

  // --- BAR CHART DATA: last 7 transactions ---
  const last7 = transactions.slice(0, 7).reverse(); // latest first

  const barData = {
    labels: last7.map((t) =>
      t.name.length > 5 ? t.name.slice(0, 5) + "..." : t.name
    ),
    datasets: [
      {
        data: last7.map((t) => (t.type === "income" ? t.amount : -t.amount)),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft color="#2f40fcff" size={24} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Balance Overview</Text>

      {/* Pie Chart */}
      <Text style={styles.chartTitle}>Income vs Expenses</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Bar Chart */}
      <Text style={styles.chartTitle}>Recent Transactions</Text>
      <BarChart
        data={{
          labels: barData.labels,
          datasets: barData.datasets,
        }}
        width={screenWidth - 32}
        height={300}
        yAxisLabel="$"
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1, index) =>
            barData.datasets[0].data[index] >= 0 ? "#00a3056f" : "#fe5c51ff",
          labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    marginBottom: 15,
  },
  backText: {
    fontSize: 18,
    color: "#2f40fcff",
    fontWeight: "500",
    marginLeft: 8,
  },
  header: { fontSize: 22, fontWeight: "600", color: "#555", marginBottom: 16 },
  chartTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    marginTop: 16,
    marginBottom: 8,
  },
});

export default BalanceTransactions;
