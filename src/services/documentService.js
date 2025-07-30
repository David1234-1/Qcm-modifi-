import { aiService } from './aiService'
import { dataService } from './supabase'

// Service de traitement de documents
class DocumentService {
  constructor() {
    this.supportedFormats = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown'
    ]
    
    this.maxFileSize = 10 * 1024 * 1024 // 10MB
  }

  // Vérifier si le format est supporté
  isFormatSupported(file) {
    return this.supportedFormats.includes(file.type)
  }

  // Vérifier la taille du fichier
  isFileSizeValid(file) {
    return file.size <= this.maxFileSize
  }

  // Extraire le texte d'un fichier
  async extractText(file) {
    try {
      if (file.type === 'application/pdf') {
        return await this.extractTextFromPDF(file)
      } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
        return await this.extractTextFromText(file)
      } else if (file.type.includes('word')) {
        return await this.extractTextFromWord(file)
      } else {
        throw new Error('Format de fichier non supporté')
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error)
      throw new Error('Impossible d\'extraire le texte du fichier')
    }
  }

  // Extraire le texte d'un PDF
  async extractTextFromPDF(file) {
    const pdfjsLib = await import('pdfjs-dist')
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
    }
    
    return fullText.trim()
  }

  // Extraire le texte d'un fichier texte
  async extractTextFromText(file) {
    return await file.text()
  }

  // Extraire le texte d'un fichier Word (basique)
  async extractTextFromWord(file) {
    // Pour les fichiers Word, on utilise une approche basique
    // En production, on pourrait utiliser mammoth.js ou une API dédiée
    const text = await file.text()
    
    // Nettoyer le contenu XML/HTML basique
    return text
      .replace(/<[^>]*>/g, ' ') // Supprimer les balises HTML/XML
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
  }

  // Traiter un document avec IA
  async processDocumentWithAI(file, options = {}) {
    try {
      console.log('📄 Début du traitement du document:', file.name)
      
      // Vérifications préliminaires
      if (!this.isFormatSupported(file)) {
        throw new Error('Format de fichier non supporté')
      }
      
      if (!this.isFileSizeValid(file)) {
        throw new Error('Fichier trop volumineux (max 10MB)')
      }
      
      if (!aiService.isConfigured()) {
        throw new Error('Service IA non configuré')
      }
      
      // Extraire le texte
      console.log('📖 Extraction du texte...')
      const text = await this.extractText(file)
      
      if (!text || text.length < 50) {
        throw new Error('Document trop court ou vide')
      }
      
      // Traitement IA
      console.log('🤖 Traitement IA...')
      const aiResult = await aiService.processDocument(text, {
        flashcardCount: options.flashcardCount || 10,
        quizCount: options.quizCount || 10,
        ...options
      })
      
      return {
        originalFile: file,
        extractedText: text,
        aiResult,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          processedAt: new Date().toISOString(),
          textLength: text.length
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement du document:', error)
      throw error
    }
  }

  // Sauvegarder les résultats dans la base de données
  async saveResults(userId, subjectId, documentData, options = {}) {
    try {
      console.log('💾 Sauvegarde des résultats...')
      
      const { aiResult, metadata } = documentData
      
      // Créer le document principal
      const documentRecord = {
        user_id: userId,
        subject_id: subjectId,
        title: aiResult.summary?.title || metadata.fileName,
        original_filename: metadata.fileName,
        file_size: metadata.fileSize,
        file_type: metadata.fileType,
        text_content: documentData.extractedText,
        ai_analysis: aiResult.analysis,
        ai_summary: aiResult.summary,
        metadata: metadata,
        created_at: new Date().toISOString()
      }
      
      const { data: savedDocument, error: docError } = await dataService.createDocument(documentRecord)
      
      if (docError) {
        throw new Error('Erreur lors de la sauvegarde du document')
      }
      
      // Sauvegarder les flashcards
      if (aiResult.flashcards && aiResult.flashcards.length > 0) {
        const flashcards = aiResult.flashcards.map(flashcard => ({
          user_id: userId,
          subject_id: subjectId,
          document_id: savedDocument[0].id,
          question: flashcard.question,
          answer: flashcard.answer,
          category: flashcard.category,
          difficulty: flashcard.difficulty,
          concept: flashcard.concept,
          created_at: new Date().toISOString()
        }))
        
        const { error: flashcardError } = await dataService.createFlashcards(flashcards)
        
        if (flashcardError) {
          console.warn('Erreur lors de la sauvegarde des flashcards:', flashcardError)
        }
      }
      
      // Sauvegarder les questions QCM
      if (aiResult.quiz && aiResult.quiz.length > 0) {
        const quizQuestions = aiResult.quiz.map(question => ({
          user_id: userId,
          subject_id: subjectId,
          document_id: savedDocument[0].id,
          question: question.question,
          options: question.options,
          correct_answer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          category: question.category,
          created_at: new Date().toISOString()
        }))
        
        const { error: quizError } = await dataService.createQuizQuestions(quizQuestions)
        
        if (quizError) {
          console.warn('Erreur lors de la sauvegarde des questions QCM:', quizError)
        }
      }
      
      console.log('✅ Résultats sauvegardés avec succès')
      
      return {
        document: savedDocument[0],
        flashcardsCount: aiResult.flashcards?.length || 0,
        quizCount: aiResult.quiz?.length || 0
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error)
      throw error
    }
  }

  // Traitement complet d'un document
  async processAndSaveDocument(userId, subjectId, file, options = {}) {
    try {
      // Traitement IA
      const documentData = await this.processDocumentWithAI(file, options)
      
      // Sauvegarde
      const saveResult = await this.saveResults(userId, subjectId, documentData, options)
      
      return {
        success: true,
        document: saveResult.document,
        flashcardsCount: saveResult.flashcardsCount,
        quizCount: saveResult.quizCount,
        summary: documentData.aiResult.summary,
        analysis: documentData.aiResult.analysis
      }
    } catch (error) {
      console.error('❌ Erreur lors du traitement complet:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Récupérer les documents d'un utilisateur
  async getUserDocuments(userId, subjectId = null) {
    try {
      const { data, error } = await dataService.getDocuments(userId, subjectId)
      
      if (error) {
        throw new Error('Erreur lors de la récupération des documents')
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des documents:', error)
      throw error
    }
  }

  // Supprimer un document
  async deleteDocument(documentId) {
    try {
      const { error } = await dataService.deleteDocument(documentId)
      
      if (error) {
        throw new Error('Erreur lors de la suppression du document')
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      throw error
    }
  }

  // Obtenir les statistiques d'un document
  async getDocumentStats(documentId) {
    try {
      const [document, flashcards, quiz] = await Promise.all([
        dataService.getDocument(documentId),
        dataService.getDocumentFlashcards(documentId),
        dataService.getDocumentQuiz(documentId)
      ])
      
      return {
        document: document.data,
        flashcardsCount: flashcards.data?.length || 0,
        quizCount: quiz.data?.length || 0
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }
}

// Instance singleton
export const documentService = new DocumentService()

// Export de la classe pour les tests
export { DocumentService }