import { Html, Head, Body, Preview, Container, Text, Heading, Section } from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "monthly-report",
  data = {},
}) {
  if (type === "monthly-report") {
    const month = data?.month ?? "";
    const totalIncome = Number(data?.totalIncome ?? 0);
    const totalExpenses = Number(data?.totalExpenses ?? 0);
    const byCategory = data?.byCategory || {};

    const insightSource = data?.insights;
    const insightLines = Array.isArray(insightSource)
      ? insightSource
      : insightSource && typeof insightSource === "object" && insightSource.summary
      ? [insightSource.summary]
      : [];

    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>

            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {month}:
            </Text>

            {/* Main Stats */}
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Income</Text>
                <Text style={styles.heading}>${totalIncome.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Total Expenses</Text>
                <Text style={styles.heading}>${totalExpenses.toFixed(2)}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Net</Text>
                <Text style={styles.heading}>
                  ${(totalIncome - totalExpenses).toFixed(2)}
                </Text>
              </div>
            </Section>

            {/* Category Breakdown */}
            {byCategory && Object.keys(byCategory).length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(byCategory).map(([category, amount]) => (
                  <div key={category} style={styles.row}>
                    <Text style={styles.text}>{category}</Text>
                    <Text style={styles.text}>${Number(amount).toFixed(2)}</Text>
                  </div>
                ))}
              </Section>
            )}

            {/* Insights */}
            {insightLines.length > 0 && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Wealth Insights</Heading>
                {insightLines.map((insight, index) => (
                  <Text key={index} style={styles.text}>
                    • {insight}
                  </Text>
                ))}
              </Section>
            )}

          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>
          Budget Alert
        </Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              you&rsquo;ve used {data?.percentageUsed?.toFixed(1) ?? "0.0"}% of your
              budget this month.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Budget Amount</Text>
                <Text style={styles.heading}>${data?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>${data?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Remaining</Text>
                <Text style={styles.heading}>
                  ${Number(data?.budgetAmount ?? 0) - Number(data?.totalExpenses ?? 0)}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // Fallback (shouldn't normally hit)
  return null;
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system,  sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    margin: "20px auto",
    maxWidth: "600px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: "20px",
  },
  text: {
    fontSize: "16px",
    color: "#4b5563",
    lineHeight: "1.5",
    marginBottom: "20px",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  stat: {
    textAlign: "center",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
  },
  heading: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "5px",
  },
  section: {
    marginTop: "20px",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  footer: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "24px",
    textAlign: "center",
  },
};