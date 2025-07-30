import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, FileText, Brain, CheckCircle, AlertCircle, 
  Loader2, X, File, BookOpen, Zap, Target, 
  ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { documentService } from '../services/documentService'
import { aiService } from '../services/aiService'
import toast from 'react-hot-toast'

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [advancedOptions, setAdvancedOptions] = useState({
    flashcardCount: 10,
    quizCount: 10,
    model: 'gpt-4-turbo-preview'
  })
  const [previewText, setPreviewText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  
  const { user } = useAuthStore()
  const { subjects, refreshSubjects } = useDataStore()

  // Vérifier si l'IA est configurée
  const isAIConfigured = aiService.isConfigured()

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Vérifications
    if (!documentService.isFormatSupported(file)) {
      toast.error('Format de fichier non supporté. Formats acceptés : PDF, TXT, DOC, DOCX')
      return
    }

    if (!documentService.isFileSizeValid(file)) {
      toast.error('Fichier trop volumineux. Taille maximum : 10MB')
      return
    }

    setSelectedFile(file)

    // Extraire un aperçu du texte
    try {
      const text = await documentService.extractText(file)
      setPreviewText(text.substring(0, 500) + (text.length > 500 ? '...' : ''))
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error)
      setPreviewText('Impossible d\'extraire le texte pour l\'aperçu')
    }
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      await handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleProcessDocument = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier')
      return
    }

    if (!selectedSubject) {
      toast.error('Veuillez sélectionner une matière')
      return
    }

    if (!isAIConfigured) {
      toast.error('Service IA non configuré. Veuillez configurer votre clé API OpenAI.')
      return
    }

    setIsProcessing(true)
    setProcessingStep('Initialisation...')
    setProcessingProgress(0)

    try {
      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 1000)

      // Traitement du document
      setProcessingStep('Extraction du texte...')
      setProcessingProgress(20)

      setProcessingStep('Analyse IA du contenu...')
      setProcessingProgress(40)

      setProcessingStep('Génération du résumé...')
      setProcessingProgress(60)

      setProcessingStep('Création des flashcards...')
      setProcessingProgress(70)

      setProcessingStep('Génération des QCM...')
      setProcessingProgress(80)

      const result = await documentService.processAndSaveDocument(
        user.id,
        selectedSubject,
        selectedFile,
        advancedOptions
      )

      clearInterval(progressInterval)
      setProcessingProgress(100)
      setProcessingStep('Finalisation...')

      if (result.success) {
        toast.success(`Document traité avec succès ! ${result.flashcardsCount} flashcards et ${result.quizCount} QCM créés.`)
        
        // Rediriger vers le dashboard ou la page des documents
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error)
      toast.error(error.message || 'Erreur lors du traitement du document')
    } finally {
      setIsProcessing(false)
      setProcessingStep('')
      setProcessingProgress(0)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setSelectedSubject('')
    setPreviewText('')
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('text') || fileType.includes('markdown')) return '📄'
    return '📁'
  }

  return (
    <div className="min-h-screen bg-secondary-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Upload de Document IA</h1>
          </div>
          <p className="text-secondary-400 max-w-2xl mx-auto">
            Uploadez vos cours, documents ou notes et laissez notre IA créer automatiquement 
            des résumés, flashcards et QCM pour optimiser vos révisions.
          </p>
        </motion.div>

        {/* Zone d'upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-secondary-800 rounded-xl p-8 mb-6"
        >
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-primary-500 bg-primary-500/10' 
                : 'border-secondary-600 hover:border-secondary-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {!selectedFile ? (
              <div>
                <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Glissez-déposez votre fichier ici
                </h3>
                <p className="text-secondary-400 mb-4">
                  ou cliquez pour sélectionner un fichier
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Choisir un fichier
                </button>
                <p className="text-sm text-secondary-500 mt-4">
                  Formats supportés : PDF, TXT, DOC, DOCX (max 10MB)
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-3">{getFileIcon(selectedFile.type)}</span>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                    <p className="text-secondary-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-secondary-700 hover:bg-secondary-600 text-secondary-300 px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Masquer' : 'Aperçu'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Aperçu du texte */}
          <AnimatePresence>
            {showPreview && previewText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-secondary-700 rounded-lg"
              >
                <h4 className="text-sm font-medium text-secondary-300 mb-2">Aperçu du contenu :</h4>
                <p className="text-secondary-400 text-sm leading-relaxed">
                  {previewText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.doc,.docx,.md"
            className="hidden"
          />
        </motion.div>

        {/* Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-secondary-800 rounded-xl p-6 mb-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary-500" />
            Configuration
          </h3>

          {/* Sélection de la matière */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-300 mb-2">
              Matière *
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sélectionner une matière</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Options avancées */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center text-secondary-300 hover:text-white transition-colors"
            >
              {showAdvancedOptions ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              Options avancées
            </button>
          </div>

          <AnimatePresence>
            {showAdvancedOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Nombre de flashcards
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={advancedOptions.flashcardCount}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        flashcardCount: parseInt(e.target.value)
                      }))}
                      className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Nombre de QCM
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={advancedOptions.quizCount}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        quizCount: parseInt(e.target.value)
                      }))}
                      className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Modèle IA
                    </label>
                    <select
                      value={advancedOptions.model}
                      onChange={(e) => setAdvancedOptions(prev => ({
                        ...prev,
                        model: e.target.value
                      }))}
                      className="w-full bg-secondary-700 border border-secondary-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="gpt-4-turbo-preview">GPT-4 Turbo (Recommandé)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Plus rapide)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* État de l'IA */}
        {!isAIConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <h4 className="text-yellow-400 font-medium">Service IA non configuré</h4>
                <p className="text-yellow-300 text-sm">
                  Pour utiliser l'analyse IA, veuillez configurer votre clé API OpenAI dans les variables d'environnement.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bouton de traitement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleProcessDocument}
            disabled={!selectedFile || !selectedSubject || !isAIConfigured || isProcessing}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-secondary-600 disabled:to-secondary-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center mx-auto disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-3" />
                Traiter avec l'IA
              </>
            )}
          </button>
        </motion.div>

        {/* Barre de progression */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 bg-secondary-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{processingStep}</span>
                <span className="text-secondary-400">{processingProgress}%</span>
              </div>
              <div className="w-full bg-secondary-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DocumentUpload