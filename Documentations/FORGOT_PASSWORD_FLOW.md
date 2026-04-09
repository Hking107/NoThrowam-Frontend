# Flux « Mot de passe oublié » (Forgot Password Flow)

Ce document décrit les routes, formats de requête/réponse et recommandations d'intégration pour le flux "mot de passe oublié" exposé par l'API.

Base URL
- Préfixe API : `/api/v0/auth/`
- Exemples ci‑dessous supposent `BACKEND=https://your-backend` ou pour développement `http://<BACKEND_HOST>:8000`.

Résumé des endpoints

- POST `/api/v0/auth/forgot-password/`
  - Description : demande l'envoi d'un code OTP au courriel fourni (pour la réinitialisation).
  - Corps (JSON) :
    ```json
    { "email": "user@example.com" }
    ```
  - Réponses :
    - 200 : `{ "detail": "If the email exists, an OTP has been sent." }` — message non‑verifiant pour préserver la confidentialité.
    - 400 : `{ "detail": "Email is required." }` si le champ `email` est absent.
  - Remarques :
    - Le backend crée un enregistrement `OTP` (code hashé) et utilise `send_otp_email_async` pour expédier l'email.
    - L'envoi d'email se fait de façon asynchrone dans un thread pool ; en cas de mauvaise configuration du SMTP, l'envoi peut échouer silencieusement (voir logs).

- POST `/api/v0/auth/validate-new-password/`
  - Description : soumet l'OTP reçu et le nouveau mot de passe ; si l'OTP est valide le mot de passe est réinitialisé.
  - Corps (JSON) :
    ```json
    {
      "email": "user@example.com",
      "otp_code": "123456",
      "new_password": "NewStrongPass123"
    }
    ```
  - Réponses :
    - 200 : `{ "detail": "Password reset successful." }`
    - 400 : plusieurs motifs possibles :
      - `{ "detail": "Invalid or expired OTP." }`
      - `{ "detail": "Invalid OTP." }` (tentatives dépassées ou code faux)
      - `{ "detail": "User not found." }`
      - erreurs de validation (par ex. mot de passe trop court)

Détails d'implémentation utiles

- Paramètres par défaut (voir `core/settings.py`):
  - `OTP_LENGTH = 6`
  - `OTP_EXPIRY_SECONDS = 600` (10 minutes)
  - `OTP_MAX_ATTEMPTS = 5`

- Comportement OTP (modèle `otp.OTP`):
  - Le code est stocké *haché* (`code_hash`) pour éviter de conserver le code en clair.
  - `verify(code)` contrôle l'expiration, le verrouillage par nombre d'essais, et compare le code.
  - Si le code est valide, l'OTP est marqué `is_used = True`.

Intégration côté frontend

- En-têtes requis : `Content-Type: application/json`.
- Ces endpoints sont accessibles sans authentification (AllowAny). Par défaut il n'est pas nécessaire d'envoyer des cookies ni un token.

Exemples

- Demande d'OTP (curl) :
  ```bash
  curl -X POST "${BACKEND}/api/v0/auth/forgot-password/" \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com"}'
  ```

- Validation du nouveau mot de passe (curl) :
  ```bash
  curl -X POST "${BACKEND}/api/v0/auth/validate-new-password/" \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","otp_code":"123456","new_password":"NewStrongPass123"}'
  ```

- Exemple `fetch` (JS) :
  ```javascript
  // demander OTP
  await fetch(`${BACKEND}/api/v0/auth/forgot-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  // valider le nouveau mot de passe
  await fetch(`${BACKEND}/api/v0/auth/validate-new-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code, new_password })
  })
  ```

CORS / CSRF

- CORS : assurez‑vous que l'origine du frontend (ex. `http://10.185.221.14:5173` ou `http://localhost:5173`) figure dans `CORS_ALLOWED_ORIGINS` de `core/settings.py`.
- CSRF : ces endpoints utilisent `APIView` et sont conçus pour être appelés sans authentification par un client JS standard ; normalement aucun token CSRF n'est nécessaire.

Dépannage rapide

- Si le frontend ne peut pas joindre le backend :
  - exécutez `hostname -I` côté backend et utilisez l'IP de l'interface réseau (ex. Wi‑Fi) — *ne pas* utiliser l'IP du bridge Docker (`172.17.0.1`) depuis un autre appareil sur le Wi‑Fi.
  - vérifiez que Daphne écoute sur `0.0.0.0:8000` (pour accepter les connexions externes) et que le pare‑feu autorise le port.
  - test simple depuis la machine frontend :
    ```bash
    curl -v http://<BACKEND_HOST>:8000/api/v0/auth/forgot-password/ -d '{"email":"x"}' -H 'Content-Type: application/json'
    ```

- Si l'OTP n'arrive pas par email :
  - vérifiez la configuration SMTP (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`).
  - consultez les logs (l'envoi est asynchrone, les erreurs sont journalisées ; en `DEBUG=True` une exception est remontée).

Sécurité et recommandations

- Ne divulguez pas si une adresse e‑mail existe : le endpoint `forgot-password` renvoie déjà un message générique — bonne pratique.
- Ajoutez un rate limit côté API (ex.  per‑IP / per‑email) pour éviter l'abus d'envoi d'OTP.
- Validez la force du mot de passe côté frontend et backend.
- Surveillez et corrigez (si nécessaire) les points critiques dans le code de validation OTP (voir note ci‑dessous).

Note importante pour les développeurs

- Observation de sécurité critique : la méthode `OTP.verify()` renvoie un tuple `(bool, reason)` ; le code existant dans `accounts.views.ValidateNewPasswordView` appelle `otp.verify(otp_code)` puis teste `if not otp.verify(...):` — ceci est incorrect car un tuple non vide est toujours truthy en Python. Cela peut permettre de contourner la vérification si le tuple n'est pas correctement destructuré. Recommandation :

  - appeler `ok, reason = otp.verify(code)` et tester `if not ok:` ; ou modifier `verify()` pour ne renvoyer que `bool`.

  - Corriger ce comportement est prioritaire — sinon la réinitialisation de mot de passe pourrait être faussée.

Historique / paramètres

- Valeurs par défaut : voir [core/settings.py](../core/settings.py) pour `OTP_LENGTH`, `OTP_EXPIRY_SECONDS`, `OTP_MAX_ATTEMPTS`.

Fin

Si vous voulez, j'ajoute des exemples Postman / collection OpenAPI ou crée un test d'intégration automatisé pour ces routes.
