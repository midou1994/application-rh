import React, { useState } from "react";
import "./App.css";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Lien de récupération envoyé à : " + email);
    // Ici tu peux ajouter un appel à l’API backend
  };

  return (
    <div className="recover-container">
      <div className="recover-box">
        <h2>Mot De Passe Oublié ?</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Réinitialiser Mot De Passe</button>
        </form>
      </div>
    </div>
  );
};

export default RecoverPassword;
