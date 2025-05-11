import React from "react";
import LoginPage from "./LoginPage";
import RecoverPassword from "./RecoverPassword";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateUserForm from "./CreateUserForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/create-user" element={<CreateUserForm />} />
      </Routes>
    </Router>
  );
}


export default App;


