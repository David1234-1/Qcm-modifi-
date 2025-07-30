// Service d'IA pour l'analyse pédagogique des documents
class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.baseURL = 'https://api.openai.com/v1'
    this.model = 'gpt-4-turbo-preview' // ou 'gpt-3.5-turbo' pour les tests
    this.maxTokens = 4000
    this.temperature = 0.7
  }

  // Vérifier la configuration
  isConfigured() {
    return !!this.apiKey
  }

  // Appel API générique
  async callAPI(messages, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Clé API OpenAI non configurée')
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        stream: false
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur API OpenAI')
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  // Analyser le contenu d'un document
  async analyzeDocument(content, options = {}) {
    const systemPrompt = `Tu es un expert pédagogique spécialisé dans l'analyse de documents éducatifs. 
    Ton rôle est d'analyser le contenu fourni et d'extraire les éléments pédagogiques essentiels.
    
    Instructions :
    1. Identifie le sujet principal et le niveau de difficulté
    2. Extrais les concepts clés et définitions importantes
    3. Repère les relations entre les concepts
    4. Identifie les formules, théorèmes ou règles importantes
    5. Structure l'information de manière logique
    
    Format de réponse attendu (JSON) :
    {
      "subject": "Sujet principal",
      "level": "Niveau (débutant/intermédiaire/avancé)",
      "keyConcepts": [
        {
          "name": "Nom du concept",
          "definition": "Définition claire",
          "importance": "haute/moyenne/faible"
        }
      ],
      "structure": [
        {
          "title": "Titre de section",
          "summary": "Résumé de la section",
          "concepts": ["concept1", "concept2"]
        }
      ],
      "formulas": [
        {
          "name": "Nom de la formule",
          "formula": "Formule mathématique",
          "description": "Explication"
        }
      ]
    }`

    const userPrompt = `Analyse ce document pédagogique et extrait les éléments essentiels :
    
    ${content}
    
    Réponds uniquement en JSON valide, sans texte supplémentaire.`

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], options)

      return JSON.parse(response)
    } catch (error) {
      console.error('Erreur lors de l\'analyse du document:', error)
      throw new Error('Erreur lors de l\'analyse du document')
    }
  }

  // Générer un résumé pédagogique
  async generateSummary(analysis, options = {}) {
    const systemPrompt = `Tu es un expert pédagogique qui crée des résumés clairs et structurés.
    Crée un résumé pédagogique basé sur l'analyse fournie.
    
    Le résumé doit :
    - Être structuré par sections logiques
    - Utiliser un langage clair et accessible
    - Mettre en évidence les points importants
    - Inclure des exemples si pertinent
    - Être adapté au niveau identifié
    
    Format de réponse attendu (JSON) :
    {
      "title": "Titre du résumé",
      "overview": "Aperçu général en 2-3 phrases",
      "sections": [
        {
          "title": "Titre de section",
          "content": "Contenu de la section",
          "keyPoints": ["Point clé 1", "Point clé 2"]
        }
      ],
      "conclusion": "Conclusion et points à retenir"
    }`

    const userPrompt = `Génère un résumé pédagogique basé sur cette analyse :
    
    ${JSON.stringify(analysis, null, 2)}
    
    Réponds uniquement en JSON valide.`

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], options)

      return JSON.parse(response)
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error)
      throw new Error('Erreur lors de la génération du résumé')
    }
  }

  // Générer des flashcards
  async generateFlashcards(analysis, count = 10, options = {}) {
    const systemPrompt = `Tu es un expert en création de flashcards pédagogiques.
    Crée des flashcards de qualité basées sur l'analyse fournie.
    
    Les flashcards doivent :
    - Couvrir les concepts les plus importants
    - Avoir des questions claires et précises
    - Avoir des réponses complètes mais concises
    - Être variées (définitions, applications, comparaisons)
    - Être adaptées au niveau identifié
    
    Format de réponse attendu (JSON) :
    {
      "flashcards": [
        {
          "question": "Question claire",
          "answer": "Réponse complète",
          "category": "définition/application/comparaison",
          "difficulty": "facile/moyen/difficile",
          "concept": "Concept principal abordé"
        }
      ]
    }`

    const userPrompt = `Génère ${count} flashcards de qualité basées sur cette analyse :
    
    ${JSON.stringify(analysis, null, 2)}
    
    Réponds uniquement en JSON valide.`

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], options)

      return JSON.parse(response)
    } catch (error) {
      console.error('Erreur lors de la génération des flashcards:', error)
      throw new Error('Erreur lors de la génération des flashcards')
    }
  }

  // Générer des QCM
  async generateQuiz(analysis, count = 10, options = {}) {
    const systemPrompt = `Tu es un expert en création de QCM pédagogiques.
    Crée des QCM de qualité basées sur l'analyse fournie.
    
    Les QCM doivent :
    - Avoir 4 choix de réponse (A, B, C, D)
    - Avoir une seule bonne réponse
    - Avoir des distracteurs plausibles mais incorrects
    - Couvrir différents niveaux de difficulté
    - Être claires et sans ambiguïté
    - Inclure une explication pour la bonne réponse
    
    Format de réponse attendu (JSON) :
    {
      "questions": [
        {
          "question": "Question claire",
          "options": {
            "A": "Option A",
            "B": "Option B",
            "C": "Option C",
            "D": "Option D"
          },
          "correctAnswer": "A",
          "explanation": "Explication de la bonne réponse",
          "difficulty": "facile/moyen/difficile",
          "category": "définition/application/analyse"
        }
      ]
    }`

    const userPrompt = `Génère ${count} questions QCM de qualité basées sur cette analyse :
    
    ${JSON.stringify(analysis, null, 2)}
    
    Réponds uniquement en JSON valide.`

    try {
      const response = await this.callAPI([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], options)

      return JSON.parse(response)
    } catch (error) {
      console.error('Erreur lors de la génération du QCM:', error)
      throw new Error('Erreur lors de la génération du QCM')
    }
  }

  // Traitement complet d'un document
  async processDocument(content, options = {}) {
    try {
      console.log('🚀 Début du traitement IA du document...')
      
      // Étape 1: Analyse du document
      console.log('📊 Analyse du document...')
      const analysis = await this.analyzeDocument(content, options)
      
      // Étape 2: Génération du résumé
      console.log('📝 Génération du résumé...')
      const summary = await this.generateSummary(analysis, options)
      
      // Étape 3: Génération des flashcards
      console.log('🃏 Génération des flashcards...')
      const flashcards = await this.generateFlashcards(analysis, options.flashcardCount || 10, options)
      
      // Étape 4: Génération du QCM
      console.log('❓ Génération du QCM...')
      const quiz = await this.generateQuiz(analysis, options.quizCount || 10, options)
      
      console.log('✅ Traitement IA terminé avec succès!')
      
      return {
        analysis,
        summary,
        flashcards: flashcards.flashcards,
        quiz: quiz.questions,
        metadata: {
          processedAt: new Date().toISOString(),
          model: this.model,
          contentLength: content.length,
          options
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement IA:', error)
      throw error
    }
  }

  // Traitement par chunks pour les gros documents
  async processLargeDocument(content, chunkSize = 3000, options = {}) {
    // Découper le contenu en chunks
    const chunks = this.splitIntoChunks(content, chunkSize)
    
    console.log(`📄 Document découpé en ${chunks.length} chunks`)
    
    const results = []
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Traitement du chunk ${i + 1}/${chunks.length}`)
      
      try {
        const chunkResult = await this.processDocument(chunks[i], {
          ...options,
          chunkIndex: i,
          totalChunks: chunks.length
        })
        
        results.push(chunkResult)
        
        // Pause entre les chunks pour éviter les rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement du chunk ${i + 1}:`, error)
        throw error
      }
    }
    
    // Fusionner les résultats
    return this.mergeResults(results)
  }

  // Découper le contenu en chunks
  splitIntoChunks(content, chunkSize) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const chunks = []
    let currentChunk = ''
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }

  // Fusionner les résultats de plusieurs chunks
  mergeResults(results) {
    // Logique de fusion des résultats
    const merged = {
      analysis: {
        subject: results[0]?.analysis?.subject || 'Document',
        level: results[0]?.analysis?.level || 'intermédiaire',
        keyConcepts: [],
        structure: [],
        formulas: []
      },
      summary: {
        title: 'Résumé complet',
        overview: '',
        sections: [],
        conclusion: ''
      },
      flashcards: [],
      quiz: [],
      metadata: {
        processedAt: new Date().toISOString(),
        model: this.model,
        totalChunks: results.length,
        merged: true
      }
    }
    
    // Fusionner les concepts clés
    const conceptMap = new Map()
    results.forEach(result => {
      result.analysis?.keyConcepts?.forEach(concept => {
        if (!conceptMap.has(concept.name)) {
          conceptMap.set(concept.name, concept)
        }
      })
    })
    merged.analysis.keyConcepts = Array.from(conceptMap.values())
    
    // Fusionner les sections
    results.forEach(result => {
      merged.summary.sections.push(...(result.summary?.sections || []))
    })
    
    // Fusionner les flashcards
    results.forEach(result => {
      merged.flashcards.push(...(result.flashcards || []))
    })
    
    // Fusionner les questions QCM
    results.forEach(result => {
      merged.quiz.push(...(result.quiz || []))
    })
    
    return merged
  }
}

// Instance singleton
export const aiService = new AIService()

// Export de la classe pour les tests
export { AIService }