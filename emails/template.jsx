import { Html, Head, Body, Preview, Container, Text, Heading, Section } from "@react-email/components";
import * as React from "react";

export default function Email({
  userName= "Sujal",
  type="budget-alert",
  data = {
    percentageUsed: 85,
    budgetAmount: 4000,
    totalExpenses: 3400,
  },
}) {
  if(type === "monthly-report"){
  }
  if(type === "budget-alert"){
    return (
      <Html>
        <Head />
        <Preview>
          Budget Alert
        </Preview>
        <Body style={styles.body}>
          <Container style={styles.container}></Container>
          <Heading style={styles.title}>Budget Alert</Heading>
          <Text style={styles.text}>Hello {userName},</Text>
          <Text style={styles.text}>  
            you&rsquo;ve used {data?.percentageUsed.toFixed(1)}% of your budget this month.
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
              <Text style={styles.heading}>${data?.budgetAmount - data?.totalExpenses}</Text>

            </div>

          </Section>
        </Body>
      </Html>
    );
  }
  
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
};