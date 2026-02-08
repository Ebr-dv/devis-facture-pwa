# 📄 PWA Devis & Factures

Une Progressive Web App complète pour gérer vos devis et factures de manière simple et efficace.

## ✨ Fonctionnalités

- ✅ **Gestion complète** : Créer, modifier, supprimer devis et factures
- ✅ **Clients** : Sauvegarde et gestion des informations clients
- ✅ **Articles/Services** : Gestion flexible des articles avec prix et quantités
- ✅ **Génération PDF** : Créer des PDFs professionnels automatiquement
- ✅ **Offline** : Fonctionne hors ligne grâce au Service Worker
- ✅ **Stockage local** : IndexedDB pour la persistance des données
- ✅ **Statistiques** : Vue d'ensemble de votre activité
- ✅ **Responsive** : Fonctionnement optimal sur tous les appareils
- ✅ **Installable** : Installez comme une app native
- ✅ **Import/Export** : Sauvegarde et restauration de données

## 🚀 Installation

### Sur le Web
1. Ouvrez l'application dans votre navigateur
2. Cliquez sur "Installer" (si disponible)

### Déploiement
- Déployez sur GitHub Pages, Vercel, Netlify ou votre serveur préféré
- L'app nécessite HTTPS en production

## 📱 Utilisation

### Créer un document
1. Cliquez sur "+ Nouveau"
2. Choisissez le type (Devis/Facture)
3. Remplissez les informations client
4. Ajoutez des articles/services
5. Enregistrez

### Générer un PDF
1. Ouvrez le document
2. Cliquez sur "Générer PDF"
3. Le PDF est automatiquement téléchargé

### Paramètres
- Configurez vos informations (nom, email, adresse)
- Exportez/importez vos données
- Effacez toutes les données si nécessaire

## 🛠️ Technologie

- **HTML5** - Structure
- **CSS3** - Design responsive
- **JavaScript (Vanilla)** - Logique applicative
- **IndexedDB** - Base de données locale
- **Service Worker** - Offline support
- **Canvas** - Génération PDF

## 📊 Statistiques

- Devis en attente
- Factures impayées
- Chiffre d'affaires total
- Chiffre d'affaires réalisé

## 💾 Données

Toutes les données sont stockées localement sur votre appareil via IndexedDB. Vous pouvez :
- Exporter en JSON pour sauvegarde
- Importer depuis un fichier JSON
- Effacer toutes les données

## 🔒 Sécurité

- Aucune donnée n'est envoyée à des serveurs externes
- Tout reste sur votre appareil
- Données chiffrées localement

## 📦 Structure du projet

```
devis-facture-pwa/
├── index.html           # Page principale
├── manifest.json        # Configuration PWA
├── service-worker.js    # Gestion offline
├── styles/
│   └── style.css       # Feuille de styles
├── js/
│   ├── app.js          # Logique principale
│   ├── db.js           # Gestion IndexedDB
│   └── pdf-generator.js # Génération PDF
├── images/             # Icônes PWA
└── README.md           # Documentation
```

## 🤝 Contribution

Les contributions sont bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests.

## 📄 Licence

MIT

---

**Créé avec ❤️ pour faciliter votre gestion administrative**