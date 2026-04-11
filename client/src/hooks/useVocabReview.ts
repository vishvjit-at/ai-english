import { useCallback, useState } from 'react'
import { fetchVocabularyForReview, evaluateVocabulary } from '@/lib/api'
import type { VocabularyItem, VocabEvaluation } from '@/lib/types'

interface ReviewResult {
  word: string
  sentence: string
  evaluation: VocabEvaluation
}

export function useVocabReview() {
  const [words, setWords] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<ReviewResult[]>([])
  const [loading, setLoading] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [currentEval, setCurrentEval] = useState<VocabEvaluation | null>(null)
  const [phase, setPhase] = useState<'idle' | 'reviewing' | 'evaluated' | 'done'>('idle')

  const startReview = useCallback(async (limit = 10) => {
    setLoading(true)
    try {
      const { words: fetched } = await fetchVocabularyForReview(limit)
      if (fetched.length === 0) {
        setPhase('idle')
        return false
      }
      setWords(fetched)
      setCurrentIndex(0)
      setResults([])
      setCurrentEval(null)
      setPhase('reviewing')
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  const submitSentence = useCallback(async (sentence: string) => {
    const word = words[currentIndex]
    if (!word) return

    setEvaluating(true)
    try {
      const { evaluation } = await evaluateVocabulary(word.id, word.word, sentence)
      setCurrentEval(evaluation)
      setResults((prev) => [...prev, { word: word.word, sentence, evaluation }])
      setPhase('evaluated')
    } finally {
      setEvaluating(false)
    }
  }, [words, currentIndex])

  const nextWord = useCallback(() => {
    setCurrentEval(null)
    if (currentIndex + 1 >= words.length) {
      setPhase('done')
    } else {
      setCurrentIndex((i) => i + 1)
      setPhase('reviewing')
    }
  }, [currentIndex, words.length])

  const currentWord = words[currentIndex] || null
  const progress = { current: currentIndex + 1, total: words.length }
  const correctCount = results.filter((r) => r.evaluation.correct).length

  return {
    phase,
    loading,
    evaluating,
    currentWord,
    currentEval,
    progress,
    results,
    correctCount,
    startReview,
    submitSentence,
    nextWord,
  }
}
