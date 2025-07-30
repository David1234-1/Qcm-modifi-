# 🚀 Guide de Déploiement Netlify - StudyHub V7

Guide complet pour déployer StudyHub V7 sur Netlify sans erreurs.

## ⚡ Déploiement Rapide

### 1. Préparation du Repository

Assurez-vous que votre code est sur GitHub avec :
- ✅ Tous les fichiers présents
- ✅ `package.json` avec les bonnes dépendances
- ✅ `netlify.toml` ou `_redirects` configuré
- ✅ Variables d'environnement prêtes

### 2. Déploiement sur Netlify

#### Option A : Via l'interface Netlify
1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez "New site from Git"
3. Connectez votre compte GitHub
4. Sélectionnez votre repository
5. Configurez les paramètres :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
   - **Node version** : `18`

#### Option B : Via CLI Netlify
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Déployer
netlify deploy --prod
```

### 3. Configuration des Variables d'Environnement

Dans Netlify Dashboard > Site settings > Environment variables :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

### 4. Configuration Supabase

#### URLs de Redirection
Dans votre projet Supabase > Authentication > URL Configuration :

```
Site URL: https://your-site.netlify.app
Redirect URLs: 
- https://your-site.netlify.app/auth/callback
- https://your-site.netlify.app/dashboard
```

## 🔧 Résolution des Problèmes Courants

### ❌ Erreur "Page not found"
**Cause** : Routes React Router non configurées
**Solution** : Vérifiez que `_redirects` ou `netlify.toml` est présent

### ❌ Erreur "Build failed"
**Cause** : Dépendances manquantes ou erreurs de build
**Solution** :
```bash
# Vérifiez les dépendances
npm install

# Testez le build localement
npm run build

# Vérifiez les logs Netlify
```

### ❌ Erreur "Supabase not configured"
**Cause** : Variables d'environnement manquantes
**Solution** : Ajoutez les variables dans Netlify Dashboard

### ❌ Erreur "CORS"
**Cause** : Configuration Supabase incorrecte
**Solution** : Vérifiez les URLs de redirection dans Supabase

### ❌ Erreur "Module not found"
**Cause** : Problème de build Vite
**Solution** : Vérifiez `vite.config.js` et les imports

## 📋 Checklist de Déploiement

### ✅ Pré-déploiement
- [ ] Code testé localement (`npm run dev`)
- [ ] Build local réussi (`npm run build`)
- [ ] Repository GitHub à jour
- [ ] Variables d'environnement prêtes

### ✅ Configuration Netlify
- [ ] Build command : `npm run build`
- [ ] Publish directory : `dist`
- [ ] Node version : 18
- [ ] Variables d'environnement configurées

### ✅ Configuration Supabase
- [ ] URLs de redirection mises à jour
- [ ] Tables créées
- [ ] Politiques RLS activées
- [ ] Authentification configurée

### ✅ Post-déploiement
- [ ] Site accessible
- [ ] Authentification fonctionne
- [ ] Routes React Router fonctionnent
- [ ] Mode démo accessible

## 🛠️ Configuration Avancée

### Optimisation des Performances
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Variables d'Environnement par Branche
```toml
[context.deploy-preview.environment]
  VITE_SUPABASE_URL = "https://preview-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "preview-key"

[context.production.environment]
  VITE_SUPABASE_URL = "https://prod-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "prod-key"
```

## 🔍 Debugging

### Logs de Build
1. Netlify Dashboard > Deploys
2. Cliquez sur un déploiement
3. Vérifiez les logs de build

### Console Browser
1. Ouvrez les DevTools (F12)
2. Vérifiez la console pour les erreurs
3. Vérifiez l'onglet Network

### Test Local
```bash
# Test du build
npm run build

# Test du preview
npm run preview

# Test des variables d'environnement
echo $VITE_SUPABASE_URL
```

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs Netlify** dans le dashboard
2. **Testez localement** avec `npm run build`
3. **Vérifiez la console browser** pour les erreurs JavaScript
4. **Consultez la documentation** : README.md
5. **Ouvrez une issue** sur GitHub

---

**StudyHub V7** - Déployé avec succès sur Netlify ! 🚀