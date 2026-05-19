# Rapport Technique — Frontend NoThrowam

---

## 1. La Stack Technique

### 1.1 Vue d'ensemble

Le frontend de NoThrowam repose sur un ensemble de technologies modernes, sélectionnées pour offrir une expérience utilisateur fluide, une base de code maintenable et un cycle de développement rapide.

| Technologie | Version | Catégorie | Rôle |
|---|---|---|---|
| **React** | 19.2 | Framework UI | Bibliothèque principale pour la construction de l'interface |
| **TypeScript** | 5.9 | Langage | Typage statique du code JavaScript |
| **Vite** | 7.3 | Build Tool | Serveur de développement et bundler de production |
| **Tailwind CSS** | 4.2 | Framework CSS | Stylisation utility-first |
| **GSAP** | 3.14 | Animation | Animations avancées et performantes |
| **Lenis** | 1.3 | UX / Scroll | Défilement fluide (smooth scroll) |
| **React Router DOM** | 7.13 | Routage | Navigation côté client (SPA) |
| **Leaflet / React-Leaflet** | 1.9 / 5.0 | Cartographie | Cartes interactives |
| **Lucide React** | 0.575 | Icônes | Bibliothèque d'icônes SVG |
| **ESLint** | 9.39 | Qualité de code | Linting et respect des conventions |

### 1.2 Détail des choix techniques

#### 1.2.1 React (v19.2)

React est le cœur de l'application. Il a été choisi pour les raisons suivantes :

- **Architecture à base de composants** : Chaque élément de l'interface (Navbar, carte produit, formulaire, etc.) est un composant isolé et réutilisable, ce qui favorise la modularité et la maintenabilité du code.
- **Virtual DOM** : React met à jour uniquement les parties de l'interface qui ont changé, assurant des performances optimales même avec des interfaces complexes.
- **Écosystème riche** : React bénéficie d'un écosystème mature avec un grand nombre de bibliothèques tierces compatibles (React Router, React-Leaflet, etc.).
- **Hooks** : L'utilisation des Hooks (`useState`, `useEffect`, `useContext`, custom hooks) permet une gestion de l'état et des effets de bord élégante, sans recourir aux composants de classe.

#### 1.2.2 TypeScript (v5.9)

TypeScript apporte une couche de **typage statique** au-dessus de JavaScript. Son adoption dans le projet est motivée par :

- **Détection précoce des erreurs** : Les erreurs de type sont détectées dès la phase de développement (compilation), réduisant significativement les bugs en production.
- **Documentation implicite** : Les interfaces et les types servent de documentation vivante du code. Par exemple, l'interface `User` dans `AuthContext.tsx` décrit précisément la structure d'un utilisateur (`id`, `email`, `role`, etc.).
- **Productivité accrue** : L'autocomplétion et l'IntelliSense dans l'IDE sont grandement améliorés grâce au typage.
- **Refactoring sûr** : Renommer une propriété ou modifier une interface est sécurisé par le compilateur qui signale immédiatement tous les endroits à mettre à jour.

Le projet utilise une configuration TypeScript structurée en trois fichiers :
- `tsconfig.json` — Fichier racine qui référence les deux configurations suivantes.
- `tsconfig.app.json` — Configuration pour le code applicatif (`src/`).
- `tsconfig.node.json` — Configuration pour le code côté Node (configuration Vite, ESLint, etc.).

#### 1.2.3 Vite (v7.3)

Vite est utilisé comme outil de build et serveur de développement, en remplacement de Webpack. Les raisons de ce choix :

- **Hot Module Replacement (HMR) quasi-instantané** : Les modifications de code sont reflétées dans le navigateur en quelques millisecondes, sans rechargement complet de la page.
- **Démarrage ultra-rapide** : Contrairement à Webpack qui bundle tout le code au démarrage, Vite sert les modules ES natifs et ne transforme que les fichiers réellement demandés par le navigateur.
- **Configuration minimale** : Le fichier `vite.config.ts` est concis et lisible. Il intègre le plugin React (`@vitejs/plugin-react`) et le plugin Tailwind CSS (`@tailwindcss/vite`).
- **Proxy intégré** : Vite est configuré pour proxier les requêtes `/api` vers le backend (`https://no-throwam-backend.onrender.com`), évitant les problèmes de CORS en développement.

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://no-throwam-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

#### 1.2.4 Tailwind CSS (v4.2)

Tailwind CSS est un framework CSS **utility-first** qui permet de styliser les composants directement dans le JSX via des classes utilitaires. Il a été choisi pour :

- **Rapidité de développement** : Pas besoin de créer des fichiers CSS séparés pour chaque composant ; les styles sont appliqués inline via des classes comme `flex`, `bg-blue-500`, `rounded-lg`, etc.
- **Cohérence visuelle** : Les valeurs prédéfinies (couleurs, espacements, tailles) garantissent une uniformité du design sur l'ensemble de l'application.
- **Taille du bundle optimisée** : Tailwind purge automatiquement les classes CSS non utilisées en production, résultant en un fichier CSS final très léger.
- **Intégration avec Vite** : Le plugin `@tailwindcss/vite` assure une intégration native sans configuration supplémentaire.

#### 1.2.5 GSAP (GreenSock Animation Platform) (v3.14)

GSAP est une bibliothèque d'animation JavaScript de niveau professionnel. Elle est utilisée dans le projet pour :

- **Animations complexes et performantes** : Animations de la page d'accueil (Hero section), transitions de sections, effets de parallaxe.
- **ScrollTrigger** : Le plugin `ScrollTrigger` de GSAP permet de déclencher et de contrôler des animations en fonction de la position de défilement de l'utilisateur.
- **Synchronisation avec Lenis** : GSAP est synchronisé avec la bibliothèque Lenis via le `gsap.ticker`, garantissant des animations parfaitement fluides sur la même boucle `RequestAnimationFrame`.
- **Compatibilité navigateur** : GSAP gère automatiquement les préfixes vendeurs et les incompatibilités entre navigateurs.
- **React Integration** : Le package `@gsap/react` fournit un hook `useGSAP` pour intégrer proprement les animations dans le cycle de vie des composants React.

#### 1.2.6 Lenis (v1.3)

Lenis est une bibliothèque de **smooth scroll** (défilement fluide) légère et performante. Elle est utilisée pour :

- **Expérience utilisateur premium** : Le défilement natif du navigateur est remplacé par un défilement à inertie, donnant une sensation haut de gamme au site.
- **Configuration fine** : Durée d'inertie, multiplicateurs de vitesse pour la molette et le tactile, et easing personnalisé sont configurés dans le composant `SmoothScroll.tsx`.
- **Compatibilité avec GSAP** : Lenis est intégré au ticker GSAP pour synchroniser le défilement avec les animations `ScrollTrigger`.

```typescript
// Extrait de SmoothScroll.tsx — Configuration Lenis
const lenisInstance = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});
```

#### 1.2.7 React Router DOM (v7.13)

React Router DOM gère le **routage côté client** de l'application (Single Page Application). Il est utilisé pour :

- **Navigation sans rechargement** : Les transitions entre pages sont instantanées car seul le contenu de la page change, sans rechargement du document HTML.
- **Routes protégées** : Un composant `ProtectedRoute` encapsule les pages nécessitant une authentification et vérifie le rôle de l'utilisateur (`CUSTOMER`, `MANAGER`, `SELLER`) avant d'autoriser l'accès.
- **Redirection basée sur les rôles** : Le composant `RoleBasedRedirect` redirige automatiquement les utilisateurs connectés vers leur tableau de bord correspondant.

#### 1.2.8 Leaflet & React-Leaflet (v1.9 / v5.0)

Leaflet est une bibliothèque de cartographie interactive open-source. React-Leaflet fournit les composants React correspondants. Ils sont utilisés pour :

- **Visualisation géographique** : Affichage des points de collecte de déchets, des marchés et des zones d'intervention sur une carte interactive.
- **Interaction utilisateur** : Les utilisateurs peuvent cliquer sur des marqueurs, zoomer et naviguer sur la carte.
- **Légèreté** : Leaflet est beaucoup plus léger que les alternatives (ex. Google Maps SDK), tout en offrant des fonctionnalités riches via son système de plugins.

#### 1.2.9 Lucide React (v0.575)

Lucide React est une bibliothèque d'icônes SVG moderne et légère. Elle a été choisie pour :

- **Large catalogue** : Des centaines d'icônes cohérentes et bien conçues.
- **Tree-shakable** : Seules les icônes effectivement importées sont incluses dans le bundle final, minimisant la taille.
- **Personnalisation** : Taille, couleur et épaisseur de trait peuvent être ajustées via des props.

### 1.3 Outils de développement

| Outil | Version | Rôle |
|---|---|---|
| **ESLint** | 9.39 | Analyse statique du code pour détecter les erreurs et imposer les conventions de style |
| **typescript-eslint** | 8.48 | Règles ESLint spécifiques à TypeScript |
| **eslint-plugin-react-hooks** | 7.0 | Vérifie le bon usage des Hooks React (règles des dépendances, etc.) |
| **eslint-plugin-react-refresh** | 0.4 | Assure la compatibilité du code avec le HMR de Vite |

---

## 2. Architecture du Code

### 2.1 Arborescence complète du projet

```
NoThrowam-Frontend/
├── index.html                          # Point d'entrée HTML (template Vite)
├── package.json                        # Dépendances et scripts npm
├── package-lock.json                   # Verrou des dépendances
├── vite.config.ts                      # Configuration Vite (plugins, proxy)
├── tsconfig.json                       # Configuration TypeScript (racine)
├── tsconfig.app.json                   # Configuration TypeScript (application)
├── tsconfig.node.json                  # Configuration TypeScript (Node/tooling)
├── eslint.config.js                    # Configuration ESLint
├── .env                                # Variables d'environnement
├── .gitignore                          # Fichiers exclus de Git
├── .npmrc                              # Configuration npm
├── README.md                           # Documentation du projet
│
├── public/                             # Fichiers statiques servis tels quels
│   ├── phone.png
│   └── vite.svg
│
├── Documentations/                     # Documentation technique du projet
│   ├── ARCHITECTURE.md
│   ├── AUTH_FLOW.md
│   ├── AUTH_INTEGRATION.md
│   ├── FORGOT_PASSWORD_FLOW.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── QUICK_START.md
│
└── src/                                # Code source de l'application
    ├── main.tsx                        # Point d'entrée React (bootstrap)
    ├── App.tsx                         # Composant racine (routage principal)
    ├── index.css                       # Feuille de style globale (Tailwind)
    ├── WebSocketProvider.tsx           # Provider WebSocket global
    │
    ├── api/                            # Configuration des connexions WebSocket
    │   └── websocket.ts
    │
    ├── assets/                         # Ressources statiques (images, etc.)
    │   └── istockphoto-1408969578-612x612.webp
    │
    ├── config/                         # Configuration centralisée
    │   └── api.ts                      # URLs API REST et WebSocket
    │
    ├── contexts/                       # React Contexts (état global)
    │   ├── AuthContext.tsx             # Contexte d'authentification
    │   ├── LenisContext.tsx            # Contexte Lenis (smooth scroll)
    │   ├── WebSocketContext.tsx        # Contexte WebSocket
    │   └── constants/                  # Constantes de l'application
    │       ├── constants.ts
    │       └── landingData.ts          # Données statiques de la landing page
    │
    ├── hooks/                          # Custom Hooks React
    │   ├── usePosts.ts                 # Hook de gestion des annonces
    │   └── useSellerWebSocket.ts       # Hook WebSocket pour les vendeurs
    │
    ├── types/                          # Interfaces et types TypeScript
    │   ├── AgentAPIResponse.ts         # Types des réponses de l'agent IA
    │   ├── AIMessage.ts                # Types des messages IA
    │   ├── ManagerAgentChat.ts         # Types du chat agent (Manager)
    │   ├── ManagerMap.ts               # Types de la carte (Manager)
    │   ├── MarketPoint.ts              # Types des points de marché
    │   └── WastePost.ts               # Types des annonces de déchets
    │
    ├── services/                       # Couche d'accès aux données (API)
    │   ├── authService.ts              # Service d'authentification (login, register, OTP, JWT)
    │   ├── agentService.ts             # Service de communication avec l'agent IA
    │   ├── depositService.ts           # Service de gestion des dépôts
    │   ├── wasteService.ts             # Service de gestion des annonces de déchets
    │   ├── ManagerService.ts           # Service dédié au Manager
    │   ├── ProposalAPI.ts              # Service de gestion des propositions
    │   ├── webSocketService.ts         # Service WebSocket (connexion, reconnexion)
    │   ├── eventBus.ts                 # Bus d'événements inter-composants
    │   └── modelInference.js           # Service d'inférence de modèle IA
    │
    ├── pages/                          # Pages / Vues principales (routes)
    │   ├── LandingPage.tsx             # Page d'accueil
    │   ├── LandingPageTest.tsx         # Page d'accueil (version active)
    │   ├── HomePage.tsx                # Page d'accueil (alternative)
    │   ├── SignIn.tsx                   # Page de connexion
    │   ├── Signup.tsx                   # Page d'inscription (choix du rôle)
    │   ├── SignupForm.tsx              # Formulaire d'inscription
    │   ├── SellerSignup.tsx            # Inscription Vendeur
    │   ├── CustomerSignup.tsx          # Inscription Client
    │   ├── ManagerSignup.tsx           # Inscription Manager
    │   ├── VerifyOTP.tsx               # Vérification du code OTP
    │   ├── ForgotPassword.tsx          # Mot de passe oublié
    │   ├── ResetPassword.tsx           # Réinitialisation du mot de passe
    │   ├── ReportWaste.tsx             # Signalement de déchets
    │   ├── NotFound.tsx                # Page 404
    │   └── Unauthorized.tsx            # Page 403 (accès non autorisé)
    │
    ├── components/                     # Composants UI réutilisables
    │   ├── Navbar.tsx                  # Barre de navigation principale
    │   ├── Footer.tsx                  # Pied de page
    │   ├── Logo.tsx                    # Logo de l'application
    │   ├── Hero.tsx                    # Section Hero
    │   ├── HeroTest.tsx                # Section Hero (version active)
    │   ├── HowToUse.tsx                # Section "Comment ça marche"
    │   ├── HowToUse3.tsx               # Section "Comment ça marche" (variante)
    │   ├── SuccessStories.tsx          # Section témoignages de succès
    │   ├── SuccessStories2.tsx         # Section témoignages (variante)
    │   ├── Testimonials.tsx            # Section témoignages clients
    │   ├── CtaSection.tsx              # Section Call-to-Action
    │   ├── ActorCards.tsx              # Cartes des acteurs (rôles)
    │   ├── ContactModal.tsx            # Modale de contact
    │   ├── caroussl.tsx                # Composant carrousel
    │   ├── mobile.tsx                  # Composant adaptatif mobile
    │   ├── SmoothScroll.tsx            # Wrapper Lenis (smooth scroll)
    │   ├── ProtectedRoute.tsx          # Composant de route protégée
    │   │
    │   ├── Customer/                   # Composants spécifiques au rôle Client
    │   │   ├── CustomerMessageBubble.tsx
    │   │   ├── MarketPopup.tsx
    │   │   └── PaymentPanel.tsx
    │   │
    │   ├── Manager/                    # Composants spécifiques au rôle Manager
    │   │   ├── GarbagePopup.tsx
    │   │   ├── LiveContextStrip.tsx
    │   │   └── MessageBubble.tsx
    │   │
    │   ├── Seller/                     # Composants spécifiques au rôle Vendeur
    │   │   ├── CameraCapture.tsx
    │   │   ├── MaterialMix.tsx
    │   │   ├── StatCards.tsx
    │   │   └── TableRows.tsx
    │   │
    │   └── Dashboard/                  # Composants du layout Dashboard
    │       ├── DashboardLayout.tsx
    │       ├── MobileNav.tsx
    │       └── Sidebar.tsx
    │
    ├── Customer_Section/               # Module complet — Interface Client
    │   ├── CustomerMain.tsx            # Page principale du Client
    │   ├── Customeragentchat.tsx       # Chat avec l'agent IA (Client)
    │   ├── Customer_Map.tsx            # Carte interactive (Client)
    │   └── Customer_Nav.tsx            # Navigation (Client)
    │
    ├── Manager_Section/                # Module complet — Interface Manager
    │   ├── ManagerMain.tsx             # Page principale du Manager
    │   ├── AgentChat.tsx               # Chat avec l'agent IA (Manager)
    │   ├── Manager_Map.tsx             # Carte interactive (v1)
    │   ├── ManagerMap.tsx              # Carte interactive (v2 refactorisée)
    │   ├── Manager_Nav.tsx             # Navigation (Manager)
    │   ├── MapOverlays.tsx             # Overlays de la carte
    │   ├── MapPanels.tsx               # Panneaux latéraux de la carte
    │   ├── constants.ts                # Constantes spécifiques au Manager
    │   ├── useManagerMapData.ts        # Hook — données de la carte
    │   ├── useManagerMapEvents.ts      # Hook — événements de la carte
    │   ├── useMapLeaflet.ts            # Hook — initialisation Leaflet
    │   ├── useMapMarkers.ts            # Hook — marqueurs de la carte
    │   └── utils.ts                    # Utilitaires du Manager
    │
    └── Seller_Section/                 # Module complet — Interface Vendeur
        ├── SellerDashboard.tsx          # Tableau de bord du Vendeur
        ├── MyListing.tsx               # Mes annonces
        ├── ProductModal.tsx            # Modale de création/édition produit
        ├── BuyerModal.tsx              # Modale d'information acheteur
        ├── WalletModal.tsx             # Modale du portefeuille
        └── WasteScannerModal.tsx       # Scanner IA de déchets
```

### 2.2 Principes architecturaux

L'architecture du frontend suit plusieurs principes directeurs :

#### 2.2.1 Architecture basée sur les composants (Component-Based Architecture)

Chaque élément de l'interface est encapsulé dans un **composant React** autonome. Un composant gère son propre rendu, sa logique interne, et peut être réutilisé dans différents contextes. Cette approche favorise :

- La **réutilisabilité** : un composant comme `ProtectedRoute` est utilisé pour protéger toutes les routes nécessitant une authentification.
- La **testabilité** : chaque composant peut être testé de manière isolée.
- La **lisibilité** : le code est plus facile à comprendre car chaque fichier a une responsabilité clairement définie.

#### 2.2.2 Séparation par couches (Layered Separation)

Le code est organisé en couches distinctes, chacune ayant un rôle précis :

```
┌─────────────────────────────────────────────┐
│                  Pages (pages/)             │  ← Routes / Vues de haut niveau
├─────────────────────────────────────────────┤
│   Sections (Customer/Manager/Seller)        │  ← Modules métier par rôle
├─────────────────────────────────────────────┤
│            Components (components/)          │  ← Composants UI réutilisables
├─────────────────────────────────────────────┤
│    Hooks (hooks/) │ Contexts (contexts/)    │  ← Logique d'état partagée
├─────────────────────────────────────────────┤
│             Services (services/)             │  ← Communication API / WebSocket
├─────────────────────────────────────────────┤
│     Types (types/) │ Config (config/)       │  ← Contrats de données et config
└─────────────────────────────────────────────┘
```

- **Pages** (`pages/`) : Représentent les écrans accessibles via des routes. Elles assemblent les composants et les sections pour former une vue complète.
- **Sections** (`Customer_Section/`, `Manager_Section/`, `Seller_Section/`) : Modules autonomes regroupant la logique et les composants propres à chaque rôle utilisateur.
- **Components** (`components/`) : Composants UI atomiques et réutilisables, indépendants de la logique métier.
- **Hooks** (`hooks/`) : Encapsulent de la logique réutilisable (appels API, WebSocket) sous forme de custom hooks React.
- **Contexts** (`contexts/`) : Gèrent l'état global partagé via l'API Context de React (authentification, scroll, WebSocket).
- **Services** (`services/`) : Couche d'abstraction pour toutes les communications avec le backend (API REST et WebSocket). Chaque service encapsule les appels `fetch` et la gestion des erreurs.
- **Types** (`types/`) : Définitions TypeScript partagées qui garantissent la cohérence des structures de données à travers tout le projet.
- **Config** (`config/`) : Configuration centralisée des URLs API et WebSocket, utilisant les variables d'environnement Vite.

#### 2.2.3 Segmentation par rôle utilisateur (Role-Based Modules)

L'une des particularités de l'architecture est la **segmentation par rôle**. L'application gère trois types d'utilisateurs, chacun ayant une interface dédiée :

| Rôle | Dossier Section | Dossier Composants | Route Dashboard |
|---|---|---|---|
| **Client (Customer)** | `Customer_Section/` | `components/Customer/` | `/dashboard_customer` |
| **Manager** | `Manager_Section/` | `components/Manager/` | `/manager` |
| **Vendeur (Seller)** | `Seller_Section/` | `components/Seller/` | `/dashboard_seller` |

Chaque section est un **module autonome** contenant ses propres pages, composants, hooks et constantes. Ce découpage permet :

- Un travail d'équipe parallèle sans conflits de fichiers.
- Une isolation des bugs : un problème dans l'interface Manager n'affecte pas l'interface Client.
- Une scalabilité aisée : ajouter un nouveau rôle revient à créer un nouveau dossier section.

#### 2.2.4 Gestion de l'état global

L'état global est géré via l'API Context de React, répartie en trois providers imbriqués :

```
<StrictMode>
  <AuthProvider>                    ← Authentification (user, login, logout)
    <WebSocketProvider>             ← Connexions WebSocket temps réel
      <Router>
        <SmoothScroll>              ← LenisProvider (contexte de scroll)
          <Routes ... />
        </SmoothScroll>
      </Router>
    </WebSocketProvider>
  </AuthProvider>
</StrictMode>
```

- **`AuthProvider`** : Encapsule toute l'application. Gère l'état de l'utilisateur connecté, les fonctions `login`, `register`, `verifyOTP` et `logout`. L'état d'authentification est persisté via des tokens JWT stockés dans `localStorage`.
- **`WebSocketProvider`** : Fournit trois instances de `WebSocketService` pour les connexions en temps réel (annonces, propositions).
- **`LenisProvider`** : Fournit l'instance Lenis pour le smooth scroll, accessible dans les composants enfants via un hook dédié.

#### 2.2.5 Routage et protection des routes

Le système de routage repose sur React Router DOM et implémente une stratégie de **protection par rôle** :

1. Les routes publiques (landing page, connexion, inscription, etc.) sont accessibles sans restriction.
2. Les routes protégées sont enveloppées dans un composant `<ProtectedRoute requiredRole="...">` qui vérifie :
   - Que l'utilisateur est authentifié (token JWT valide).
   - Que son rôle correspond au rôle requis.
3. En cas d'échec : redirection vers `/signin` (non authentifié) ou `/unauthorized` (rôle insuffisant).
4. Le composant `RoleBasedRedirect` redirige automatiquement les utilisateurs connectés depuis la page d'accueil vers leur tableau de bord.

#### 2.2.6 Couche de services et communication avec le backend

La communication avec le backend est centralisée dans le dossier `services/`. Chaque service encapsule un domaine métier :

| Service | Responsabilité |
|---|---|
| `authService.ts` | Authentification complète (register, login, OTP, JWT refresh, logout) |
| `agentService.ts` | Communication avec l'agent IA conversationnel |
| `wasteService.ts` | CRUD des annonces de déchets |
| `depositService.ts` | Gestion des dépôts |
| `ManagerService.ts` | Opérations spécifiques au rôle Manager |
| `ProposalAPI.ts` | Gestion des propositions d'achat |
| `webSocketService.ts` | Classe WebSocket avec reconnexion automatique |
| `eventBus.ts` | Bus d'événements pour la communication inter-composants |
| `modelInference.js` | Inférence de modèle IA côté client |

La configuration centralisée des URLs se trouve dans `config/api.ts`, qui :
- Lit l'URL de base depuis la variable d'environnement `VITE_API_BASE`.
- Dérive automatiquement les URLs WebSocket (`ws://` ou `wss://`) à partir de l'URL HTTP.
- Expose des constantes prêtes à l'emploi (`API_AUTH_URL`, `API_POSTS_URL`, `WS_BASE_URL`, etc.).

---

## 3. Synthèse

Le frontend NoThrowam est construit sur une stack technique **moderne, performante et maintenable**. Le choix de React avec TypeScript garantit la robustesse du code, tandis que Vite assure un environnement de développement rapide. L'architecture modulaire — avec une séparation claire entre pages, composants, services, hooks et contextes — permet à l'équipe de travailler efficacement en parallèle. La segmentation par rôle utilisateur (Client, Manager, Vendeur) est un choix architectural structurant qui isole les responsabilités et facilite l'évolution future de la plateforme.
