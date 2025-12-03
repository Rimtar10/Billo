import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import {
  User,
  Home,
  Send,
  ScanQrCode,
  Download,
  Menu,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react-native";

export default function BilloApp({ navigation }) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("Home");
  const [balances, setBalances] = useState({
    USD: 2500.0,
    LBP: 3675000,
  });
  const [transactions, setTransactions] = useState([]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save whenever balances or transactions change
  useEffect(() => {
    saveData();
  }, [balances, transactions]);

  const loadData = async () => {
    try {
      const storedBalances = await AsyncStorage.getItem("balances");
      const storedTransactions = await AsyncStorage.getItem("transactions");
      
      if (storedBalances) setBalances(JSON.parse(storedBalances));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("balances", JSON.stringify(balances));
      await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Function to add a transaction instantly
  const addTransaction = (name, amount, currency, type) => {
    const newTransaction = {
      id: Date.now(),
      name,
      amount,
      currency,
      type,
      timestamp: new Date().toISOString(),
    };

    // Update transactions state immediately
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update balance state immediately
    setBalances((prev) => ({
      ...prev,
      [currency]:
        type === "income" ? prev[currency] + amount : prev[currency] - amount,
    }));
  };

  const handleNav = (tabName, screenName) => {
    setActiveTab(tabName);

    if (screenName === "Transactions") {
      // Pass only what Transactions needs
      navigation.navigate(screenName, {
        transactions,
        selectedCurrency,
      });
    } else {
      navigation.navigate(screenName, {
        addTransaction,
        transactions,
        balances,
        selectedCurrency,
      });
    }
  };

  // Navigate to Account page
  const handleNavigateToAccount = () => {
    navigation.navigate("Account");
  };

  const recentTransactions = transactions.slice(0, 3);

  const formatTransactionAmount = (transaction) => {
    const symbol = transaction.currency === "USD" ? "$" : "";
    const sign = transaction.type === "income" ? "+" : "-";
    return `${sign}${symbol}${transaction.amount.toLocaleString()}`;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const transactionDate = new Date(timestamp);
    const diffMs = now - transactionDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleCurrencySwitch = (currency) => setSelectedCurrency(currency);

  const toggleBalanceVisibility = () => setBalanceVisible(!balanceVisible);

  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => handleCurrencySwitch("LBP")}>
            <Text
              style={
                selectedCurrency === "LBP"
                  ? styles.currencyActive
                  : styles.currency
              }
            >
              LBP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCurrencySwitch("USD")}>
            <Text
              style={
                selectedCurrency === "USD"
                  ? styles.currencyActive
                  : styles.currency
              }
            >
              USD
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Billo</Text>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleNavigateToAccount}
          >
            <User size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity onPress={toggleBalanceVisibility}>
            {balanceVisible ? (
              <Eye size={20} color="#ffffffac" />
            ) : (
              <EyeOff size={20} color="#ffffffac" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.balanceAmount}>
          {balanceVisible
            ? `${selectedCurrency === "USD" ? "$" : ""}${balances[
                selectedCurrency
              ].toLocaleString()}`
            : "••••••"}
        </Text>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceCurrency}>{selectedCurrency}</Text>
          <Image
            source={require("./billo-logo.png")}
            style={styles.billoLogo}
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => handleNav("Transactions", "Transactions")}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === "income"
                            ? "#10b98120"
                            : "#ef444420",
                      },
                    ]}
                  >
                    <Clock
                      size={20}
                      color={
                        transaction.type === "income" ? "#10b981" : "#ef4444"
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.transactionName}>
                      {transaction.name}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {getTimeAgo(transaction.timestamp)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.type === "income" ? "#10b981" : "#333",
                    },
                  ]}
                >
                  {formatTransactionAmount(transaction)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNav("Home", "Home")}
        >
          <Home size={24} color={activeTab === "Home" ? "#2f40fcff" : "#666"} />
          <Text
            style={activeTab === "Home" ? styles.navTextActive : styles.navText}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNav("Send", "Send")}
        >
          <Send size={24} color={activeTab === "Send" ? "#2f40fcff" : "#666"} />
          <Text
            style={activeTab === "Send" ? styles.navTextActive : styles.navText}
          >
            Send
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('QRcode')}>
          <ScanQrCode size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNav("Receive", "Receive")}
        >
          <Download
            size={24}
            color={activeTab === "Receive" ? "#2f40fcff" : "#666"}
          />
          <Text
            style={
              activeTab === "Receive" ? styles.navTextActive : styles.navText
            }
          >
            Receive
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleNav("Menu", "HomeMenu")}
        >
          <Menu size={24} color={activeTab === "Menu" ? "#2f40fcff" : "#666"} />
          <Text
            style={activeTab === "Menu" ? styles.navTextActive : styles.navText}
          >
            Menu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  currency: { fontSize: 15, color: "#9ca3af", fontWeight: "500" },
  currencyActive: { fontSize: 15, color: "#2f40fcff", fontWeight: "700" },
  logoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  logoText: {
    color: "#2f40fcff",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  topRight: { flexDirection: "row" },
  iconButton: { padding: 4 },
  balanceCard: {
    backgroundColor: "#2f40fcff",
    paddingTop: 20,
    paddingBottom: 5,
    margin: 15,
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceLabel: { fontSize: 14, color: "#fff", fontWeight: "500" },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 24,
  },
  billoLogo: { width: 90, height: 90, resizeMode: "contain" },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  seeAllText: { fontSize: 14, color: "#2f40fcff", fontWeight: "600" },
  emptyState: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: { fontSize: 15, color: "#9ca3af", fontWeight: "500" },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  transactionTime: { fontSize: 13, color: "#9ca3af" },
  transactionAmount: { fontSize: 16, fontWeight: "700" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navItem: { alignItems: "center", gap: 4 },
  navText: { fontSize: 11, color: "#6b7280", fontWeight: "500" },
  navTextActive: { fontSize: 11, color: "#2f40fcff", fontWeight: "700" },
  scanButton: {
    backgroundColor: "#2f40fcff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30,
    shadowColor: "#2f40fcff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});