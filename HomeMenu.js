import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import {
  Phone,
  MessageSquare,
  Mail,
  HelpCircle,
  FileText,
  CreditCard,
  Bell,
  Lock,
  Smartphone,
  Globe,
  Wallet,
  BarChart,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

const HomeMenu = ({ navigation, route }) => {
  const { transactions } = route.params; // <- this is your transactions array

  const MenuItem = ({ Icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <Icon color="#555" size={24} style={{ marginRight: 16 }} />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {showArrow && <ChevronRight color="#555" size={24} />}
    </TouchableOpacity>
  );

  const SwitchItem = ({ Icon, title, value, onValueChange }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Icon color="#555" size={24} style={{ marginRight: 16 }} />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#ccc", true: "#555" }}
        thumbColor="#fff"
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft color="#2f40fcff" size={24} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>

        <MenuItem
          Icon={Phone}
          title="Call Us"
          subtitle="+961 1 234 567"
          showArrow={false}
        />
        <MenuItem
          Icon={MessageSquare}
          title="WhatsApp"
          subtitle="+961 1 234 567"
          showArrow={false}
        />
        <MenuItem
          Icon={Mail}
          title="Email"
          subtitle="info@billo.money"
          showArrow={false}
        />
        <MenuItem Icon={HelpCircle} title="FAQ" />
        <MenuItem Icon={FileText} title="Terms & Conditions" />
        <MenuItem Icon={CreditCard} title="Billo Card Information" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <MenuItem Icon={Bell} title="Notifications" />
        <MenuItem Icon={Lock} title="Change Passcode" />
        <MenuItem Icon={Smartphone} title="Active Devices" />
        <MenuItem
          Icon={Globe}
          title="Change Language"
          subtitle="العربية"
          showArrow={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finance</Text>

        <MenuItem Icon={Wallet} title="My Balance" />
        <MenuItem
          Icon={BarChart}
          title="Activity / Transactions"
          onPress={() =>
            navigation.navigate("ActivityBalance", { transactions })
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backText: {
    fontSize: 18,
    color: "#2f40fcff",
    fontWeight: "500",
    marginLeft: 8,
  },
  section: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
  },
  sectionTitle: {
    color: "#2f40fcff",
    fontSize: 22,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuTitle: {
    color: "#555",
    fontSize: 17,
    fontWeight: "500",
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
    marginRight: 8,
  },
});

export default HomeMenu;
