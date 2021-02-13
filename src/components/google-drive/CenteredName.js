import React from "react";
import { Container } from "react-bootstrap";

export default function CenteredName({ children }) {
  return (
    <div>
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "500px",
          marginTop: "20px",
        }}
      >
        <div className="w-100">{children}</div>
      </Container>
    </div>
  );
}
