# StudyHub V7 - Assistant d'Étude Intelligent

Une application web moderne pour optimiser vos révisions avec l'intelligence artificielle.

## 🚀 Nouvelles Fonctionnalités V7

### 🔐 Authentification Moderne
- **Magic Links** : Connexion sans mot de passe via email
- **OTP SMS** : Authentification par code SMS
- **Authentification classique** : Fallback avec email/mot de passe
- **Sessions sécurisées** : Gestion automatique des tokens et refresh
- **Redirections intelligentes** : Retour à la page demandée après connexion

### 🤖 Moteur d'IA Pédagogique
- **Analyse intelligente** : Extraction automatique des concepts clés
- **Génération de contenu** : Résumés, flashcards et QCM automatiques
- **Support multi-formats** : PDF, TXT, DOC, DOCX
- **Traitement par chunks** : Gestion des gros documents
- **Modèles configurables** : GPT-4 Turbo ou GPT-3.5 Turbo

### 📚 Fonctionnalités Pédagogiques
- **Résumés structurés** : Génération automatique de résumés par sections
- **Flashcards intelligentes** : Questions/réponses basées sur le contenu
- **QCM de qualité** : Questions avec distracteurs plausibles
- **Interface moderne** : UX fluide et responsive

## 🛠️ Technologies

- **Frontend** : React 18, Vite, Tailwind CSS
- **Authentification** : Supabase Auth (passwordless)
- **Base de données** : Supabase PostgreSQL
- **IA** : OpenAI GPT-4/GPT-3.5
- **État** : Zustand
- **Animations** : Framer Motion
- **Notifications** : React Hot Toast

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Supabase
- Clé API OpenAI (optionnel)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd studyhub-v7
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration des variables d'environnement
```bash
cp .env.example .env
```

Éditez le fichier `.env` :
```env
# Configuration Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration OpenAI (optionnel)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme

#### Configurer l'authentification
1. Dans votre projet Supabase, allez dans Authentication > Settings
2. Activez "Enable email confirmations"
3. Configurez les templates d'email pour les magic links
4. (Optionnel) Configurez l'authentification SMS

#### Créer les tables
Exécutez le script SQL suivant dans l'éditeur SQL de Supabase :

```sql
-- Table des matières
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  file_type TEXT,
  text_content TEXT,
  ai_analysis JSONB,
  ai_summary JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des flashcards
CREATE TABLE flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT,
  concept TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des questions QCM
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des résultats de quiz
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des résumés
CREATE TABLE summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politiques RLS (Row Level Security)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

-- Politiques pour les matières
CREATE POLICY "Users can view their own subjects" ON subjects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects" ON subjects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" ON subjects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" ON subjects
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les flashcards
CREATE POLICY "Users can view their own flashcards" ON flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" ON flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les questions QCM
CREATE POLICY "Users can view their own quiz questions" ON quiz_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz questions" ON quiz_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz questions" ON quiz_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quiz questions" ON quiz_questions
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les résultats de quiz
CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour les résumés
CREATE POLICY "Users can view their own summaries" ON summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries" ON summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" ON summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" ON summaries
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Lancer l'application
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🔧 Configuration OpenAI (Optionnel)

Pour utiliser l'analyse IA des documents :

1. Créez un compte sur [OpenAI](https://openai.com)
2. Générez une clé API
3. Ajoutez la clé dans votre fichier `.env`

## 📱 Utilisation

### Authentification
1. **Magic Link** : Entrez votre email et recevez un lien de connexion
2. **OTP SMS** : Entrez votre numéro de téléphone et recevez un code
3. **Classique** : Email et mot de passe

### Upload de Documents
1. Allez dans "Upload IA"
2. Glissez-déposez ou sélectionnez un fichier (PDF, TXT, DOC, DOCX)
3. Choisissez une matière
4. Configurez les options avancées si nécessaire
5. Cliquez sur "Traiter avec l'IA"

### Résultats
- **Résumés** : Générés automatiquement par sections
- **Flashcards** : Questions/réponses sur les concepts clés
- **QCM** : Questions à choix multiples avec explications

## 🚀 Déploiement

### Netlify
1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify
3. Déployez automatiquement

### Vercel
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

## 🔒 Sécurité

- Authentification sécurisée avec Supabase
- Row Level Security (RLS) activé
- Tokens JWT sécurisés
- Validation côté client et serveur
- Protection CSRF

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- Documentation : [Wiki du projet]
- Issues : [GitHub Issues]
- Email : support@studyhub.com

## 🎯 Roadmap

- [ ] Support OAuth (Google, GitHub)
- [ ] Mode hors ligne
- [ ] Export des données
- [ ] Collaboration en temps réel
- [ ] API publique
- [ ] Applications mobiles