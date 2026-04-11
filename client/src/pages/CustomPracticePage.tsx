import { useState } from 'react'
import { startConversation } from '@/lib/api'
import { CustomScenarioSetup } from '@/components/conversation/CustomScenarioSetup'
import { ConversationView } from '@/components/conversation/ConversationView'
import type { UserContext } from '@/lib/types'

type Stage = 'setup' | 'conversation'

export function CustomPracticePage() {
  const [stage, setStage] = useState<Stage>('setup')
  const [userContext, setUserContext] = useState<UserContext | null>(null)
  const [starterMessage, setStarterMessage] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  const handleSetupComplete = async (ctx: UserContext) => {
    setIsStarting(true)
    setError('')
    try {
      const { openingLine } = await startConversation(ctx, { scenarioId: 'custom' })
      setUserContext(ctx)
      setStarterMessage(openingLine)
      setStage('conversation')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start session')
    } finally {
      setIsStarting(false)
    }
  }

  if (stage === 'setup') {
    return (
      <div className="h-full flex flex-col">
        <CustomScenarioSetup onStart={handleSetupComplete} isLoading={isStarting} />
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-50 border border-rose-200 text-rose-600 text-sm px-5 py-3 rounded-2xl shadow-lg font-body animate-scale-in">{error}</div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ConversationView
          config={{ scenarioId: 'custom', scenarioName: 'Your Own Scenario', topic: 'custom' }}
          userContext={userContext!}
          starterMessage={starterMessage}
        />
      </div>
    </div>
  )
}
