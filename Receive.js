import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Receive({ navigation, route }) {
  const { addTransaction, balances, selectedCurrency } = route.params || {};

  // Receiver info (current user)
  const [receiverName] = useState("Nataly Fakih");
  const currentBalance = balances ? balances[selectedCurrency] : 0;

  // Sender info (user filling the form)
  const [senderName, setSenderName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [receivingMethod, setReceivingMethod] = useState("Wallet");

  // Transaction details
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");

  // Confirmation popup
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Calculate net received amount after fee (2%)
  const handleAmountChange = (value) => {
    setAmount(value);
    const fee = parseFloat(value || 0) * 0.02;
    const received = parseFloat(value || 0) - fee;
    setReceivedAmount(received > 0 ? received.toFixed(0) : "");
  };

  const openConfirmPopup = () => {
    if (!senderName || !phoneNumber || !walletNumber || !amount) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setConfirmVisible(true);
  };

  const confirmReceive = () => {
    const numericAmount = parseFloat(receivedAmount);
    if (addTransaction) {
      addTransaction(
        `Received from ${senderName}`,
        numericAmount,
        selectedCurrency,
        "income"
      );
    }
    setConfirmVisible(false);
    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: "#2f40fcff" }]}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={styles.appName}>Billo To Billo</Text>
            <Text style={styles.subtitle}>Receive Money Safely</Text>
          </View>
        </View>

        {/* Receiver Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Information</Text>
          <View style={styles.cardDivider} />
          <Text style={styles.label}>Your Full Name</Text>
          <View style={styles.disabledInput}>
            <Text style={styles.disabledInputText}>{receiverName}</Text>
          </View>

          <Text style={styles.label}>Current Balance</Text>
          <View style={styles.balanceInput}>
            <Text style={styles.balanceText}>
              {selectedCurrency === "USD" ? "$" : ""}
              {currentBalance.toLocaleString()} {selectedCurrency}
            </Text>
          </View>
        </View>

        {/* Sender Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sender Details</Text>
          <View style={styles.cardDivider} />

          <Text style={styles.label}>Sender Name*</Text>
          <TextInput
            style={styles.input}
            value={senderName}
            onChangeText={setSenderName}
            placeholder="Enter sender's name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Sender Phone Number*</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Wallet/Account Number*</Text>
          <TextInput
            style={styles.input}
            value={walletNumber}
            onChangeText={setWalletNumber}
            placeholder="Enter wallet/account number"
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.label}>Receiving Method*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={receivingMethod}
              onValueChange={(itemValue) => setReceivingMethod(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label=" Wallet" value="Wallet" />
              <Picker.Item label=" Bank" value="Bank" />
              <Picker.Item label=" Cash Pickup" value="Cash Pickup" />
            </Picker>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transaction Details</Text>
          <View style={styles.cardDivider} />

          <Text style={styles.label}>Amount to Receive*</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="Enter amount"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Note from Sender</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="Message from sender (optional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />

          <View style={styles.feeInfoCard}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Transaction Fee (2%)</Text>
              <Text style={styles.feeValue}>
                {amount ? (parseFloat(amount) * 0.02).toFixed(0) : "0"}{" "}
                {selectedCurrency}
              </Text>
            </View>
            <View style={styles.feeDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.receivedLabel}>You Get</Text>
              <Text style={styles.receivedValue}>
                {receivedAmount || "0"} {selectedCurrency}
              </Text>
            </View>
          </View>
        </View>

        {/* Receive Button */}
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: "#2f40fcff" }]}
          onPress={openConfirmPopup}
        >
          <Text style={styles.sendButtonText}>Receive Money</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirm Popup */}
      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <Text style={styles.popupTitle}>Confirm Transaction</Text>
            <Text style={styles.popupText}>
              Receive {selectedCurrency} {receivedAmount} from {senderName}?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmReceive}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles remain mostly the same as Send page
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { paddingBottom: 40 },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 32, color: "#333", fontWeight: "300" },
  logoContainer: { alignItems: "center" },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: "#6b7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  cardDivider: { height: 1, backgroundColor: "#e5e7eb", marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
  },
  disabledInputText: { fontSize: 16, color: "#6b7280" },
  balanceInput: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 12,
    padding: 14,
  },
  balanceText: { fontSize: 18, fontWeight: "700", color: "#10b981" },
  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: { height: 50 },
  feeInfoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  feeLabel: { fontSize: 14, color: "#6b7280" },
  feeValue: { fontSize: 14, fontWeight: "600", color: "#374151" },
  feeDivider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 8 },
  receivedLabel: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  receivedValue: { fontSize: 18, fontWeight: "700", color: "#10b981" },
  sendButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 50,
    marginTop: 8,
    shadowColor: "#2f40fcff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111",
  },
  popupText: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
  },
  popupButtons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelText: { color: "#444", fontSize: 15, fontWeight: "600" },
  confirmButton: {
    backgroundColor: "#2f40fcff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
