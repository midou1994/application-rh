import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Traitement des erreurs selon le message retourné
        if (data.message === "Email incorrect") {
          setError("L'adresse email est incorrecte. Veuillez réessayer.");
        } else if (data.message === "Mot de passe incorrect") {
          setError("Le mot de passe saisi est incorrect.");
        } else {
          setError(data.message || "Une erreur inconnue est survenue.");
        }
      } else {
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        alert("Connexion réussie !");
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Erreur réseau :", err);
      setError("Impossible de se connecter au serveur. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel"></div>
      <div className="right-panel">
        <div className="form-box">
          <h2>Connexion</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="form-row">
              <label className="remember-block">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="check"
                />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#">Mot de passe oublié ?</a>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit">Se connecter</button>
            <footer>&copy; 2025 - Tous droits réservés</footer>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
