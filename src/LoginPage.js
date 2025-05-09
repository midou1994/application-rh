import React, { useState } from "react";
import "./App.css"; // ou ton fichier de style

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
      
        try {
          const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            alert("Erreur : " + data.message);
          } else {
            alert("Connexion réussie !");
          }
        } catch (error) {
          console.error("Erreur réseau :", error);
          alert("Erreur de connexion au serveur.");
        }
      };

    return (
        <div className="login-container">
            <div className="left-panel"></div>
            <div className="right-panel">
                <div className="form-box">
                    <h2>Sign In</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
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
                                />
                                <span>Se souvenir de moi</span>
                            </label>
                            <a href="#">Mot de passe oublié ?</a>
                        </div>


                        <button type="submit">Sign In</button>
                        <p>Pas de compte ? <a href="#">Créer un compte</a></p>
                        <footer>&copy; 2025 - Tous droits réservés</footer>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
