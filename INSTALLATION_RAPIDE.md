# 🚀 Installation Rapide - StudyHub V7

Guide d'installation express pour StudyHub V7 avec authentification moderne et IA.

## ⚡ Installation Express (5 minutes)

### 1. Prérequis
- Node.js 18+ installé
- Compte Supabase (gratuit)
- Clé OpenAI (optionnel)

### 2. Cloner et installer
```bash
git clone <repository-url>
cd studyhub-v7
npm install
```

### 3. Configuration Supabase (2 minutes)

#### A. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez "New Project"
3. Choisissez votre organisation
4. Nommez le projet "studyhub-v7"
5. Créez un mot de passe pour la base de données
6. Cliquez "Create new project"

#### B. Récupérer les clés
1. Dans votre projet, allez dans Settings > API
2. Copiez :
   - Project URL
   - anon public key

#### C. Configurer l'authentification
1. Authentication > Settings
2. Activez "Enable email confirmations"
3. Dans "Site URL", mettez : `http://localhost:5173`
4. Dans "Redirect URLs", ajoutez : `http://localhost:5173/auth/callback`

#### D. Créer les tables
1. SQL Editor > New query
2. Copiez-collez le script SQL du README principal
3. Exécutez le script

### 4. Configuration locale
```bash
cp .env.example .env
```

Éditez `.env` :
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key  # Optionnel
```

### 5. Lancer l'application
```bash
npm run dev
```

🎉 **C'est tout !** L'application est accessible sur `http://localhost:5173`

## 🔐 Test de l'authentification

### Magic Link
1. Cliquez sur "Magic Link"
2. Entrez votre email
3. Vérifiez votre boîte mail
4. Cliquez sur le lien reçu

### OTP SMS (si configuré)
1. Cliquez sur "SMS"
2. Entrez votre numéro de téléphone
3. Entrez le code reçu

## 🤖 Test de l'IA (optionnel)

### Configuration OpenAI
1. Allez sur [platform.openai.com](https://platform.openai.com)
2. Créez un compte ou connectez-vous
3. API Keys > Create new secret key
4. Copiez la clé dans votre `.env`

### Test d'upload
1. Créez une matière dans l'app
2. Allez dans "Upload IA"
3. Uploadez un PDF de cours
4. L'IA génère automatiquement le contenu !

## 🚀 Déploiement rapide

### Netlify (recommandé)
1. Push votre code sur GitHub
2. Connectez-vous sur [netlify.com](https://netlify.com)
3. "New site from Git"
4. Sélectionnez votre repository
5. Dans "Environment variables", ajoutez vos variables d'environnement
6. Deploy !

### Variables d'environnement Netlify
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=your-openai-key
```

## 🔧 Dépannage rapide

### Erreur "Supabase non configuré"
- Vérifiez vos variables d'environnement
- Redémarrez le serveur de développement

### Erreur "Service IA non configuré"
- Ajoutez votre clé OpenAI dans `.env`
- Ou utilisez l'app sans IA (fonctionne aussi !)

### Erreur d'authentification
- Vérifiez les URLs de redirection dans Supabase
- Assurez-vous que l'email est confirmé

### Erreur de base de données
- Vérifiez que le script SQL a été exécuté
- Vérifiez les politiques RLS

## 📞 Support

- **Documentation complète** : README.md
- **Issues** : GitHub Issues
- **Email** : support@studyhub.com

---

**StudyHub V7** - Votre assistant d'étude intelligent ! 🧠✨