import { ErrorState } from '../ui/ErrorState'
import { LoadingState } from '../ui/LoadingState'

type QueryStateProps = {
  isPending: boolean
  isError: boolean
  error?: Error | null
  onRetry: () => void
}

export function QueryState({
  isPending,
  isError,
  error,
  onRetry,
}: QueryStateProps) {
  if (isPending) {
    return <LoadingState />
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  return null
}
