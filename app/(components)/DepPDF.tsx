// components/DepositReportPDF.tsx
"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

type DepositRecord = {
  depositId: string;
  date: string;
  customerName: string;
  paymentType: string;
  currency: string;
  amount: string;
};

interface Props {
  data: DepositRecord[];
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
  },

  /* ===== TITLE ===== */
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  titleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  /* ===== TABLE ===== */
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
  },
  headerText: {
    fontWeight: "bold",
  },
});

export default function DepositReportPDF({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== TITLE WITH ICON ===== */}
        <View style={styles.titleContainer}>
          <Image
            style={styles.titleIcon}
            src="/icons/jetafx-main-logo.png"
          />
          <Text style={styles.titleText}>Deposit Reports</Text>
        </View>

        {/* ===== TABLE HEADER ===== */}
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.headerText]}>Deposit ID</Text>
          <Text style={[styles.cell, styles.headerText]}>Date</Text>
          <Text style={[styles.cell, styles.headerText]}>Customer Name</Text>
          <Text style={[styles.cell, styles.headerText]}>Payment Type</Text>
          <Text style={[styles.cell, styles.headerText]}>Currency</Text>
          <Text style={[styles.cell, styles.headerText]}>Amount</Text>
        </View>

        {/* ===== TABLE ROWS ===== */}
        {data.map((d) => (
          <View key={d.depositId} style={styles.row}>
            <Text style={styles.cell}>{d.depositId}</Text>
            <Text style={styles.cell}>{d.date}</Text>
            <Text style={styles.cell}>{d.customerName}</Text>
            <Text style={styles.cell}>{d.paymentType}</Text>
            <Text style={styles.cell}>{d.currency}</Text>
            <Text style={styles.cell}>{d.amount}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
