import React from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Navigate } from "react-router-dom";

const Login = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <Authenticator>
        {/* We removed { signOut, user } because we don't need them for the redirect */}
        {() => <Navigate to="/admin" replace />}
      </Authenticator>
    </div>
  );
};

export default Login;
