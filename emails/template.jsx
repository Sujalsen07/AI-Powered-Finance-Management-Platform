import { Button, Html, Head, Body } from "@react-email/components";
import * as React from "react";

export default function Email({
  userName= "",
  type="budget-alert",
  data = {},
}) {
  if(type === "monthly-report"){
  }
  if(type === "budget-alert"){
  }
  return (
    <Html>
      <Head />
      <Body>
        <Button
          href="https://example.com"
          style={{ background: "#000", color: "#fff", padding: "12px 20px" }}
        >
          Click me
        </Button>
      </Body>
    </Html>
  );
}