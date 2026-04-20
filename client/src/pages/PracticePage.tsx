import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchScenarios, startConversation } from '@/lib/api'
import { ConversationSetup } from '@/components/conversation/ConversationSetup'
import { ConversationView } from '@/components/conversation/ConversationView'
import type { Scenario, UserContext } from '@/lib/types'

type Stage = 'loading' | 'setup' | 'conversation'

export function PracticePage() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [starterMessage, setStarterMessage] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setStage('loading')
    setScenario(null)
    setUserContext(null)
    fetchScenarios().then((data) => {
      const all = Object.values(data.scenarios).flat()
      const found = all.find((s) => s.id === scenarioId)
      if (found) { setScenario(found); setStage('setup') }
      else setError('Scenario not found')
    }).catch(() => setError('Failed to load scenarios'))
  }, [scenarioId])

  const handleSetupComplete = async (ctx: UserContext) => {
    if (!scenarioId) return
    setIsStarting(true)
    setError('')
    try {
      const { openingLine } = await startConversation(ctx, { scenarioId })
      setUserContext(ctx)
      setStarterMessage(openingLine)
      setStage('conversation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start session')
    } finally {
      setIsStarting(false)
    }
  }

  if (stage === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !scenario) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-rose-500 font-heading font-semibold">{error}</p>
        <Link to="/" className="text-primary-600 text-sm font-heading font-semibold hover:underline">Go back home</Link>
      </div>
    )
  }

  if (stage === 'setup' && scenario) {
    return (
      <div className="h-full flex flex-col">
        <ConversationSetup scenario={scenario} onStart={handleSetupComplete} isLoading={isStarting} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-5 py-3 rounded-2xl shadow-lg font-body animate-scale-in">{error}</div>
        )}
      </div>
    )
  }

  if (stage === 'conversation' && scenario && userContext) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <ConversationView
            config={{ scenarioId: scenario.id, scenarioName: scenario.name, topic: scenario.topic }}
            userContext={userContext}
            starterMessage={starterMessage}
          />
        </div>
      </div>
    )
  }

  return null
}
