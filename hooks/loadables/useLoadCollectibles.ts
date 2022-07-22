import { useEffect } from 'react'
import { getCollectibles, type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync, { type AsyncResult } from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { Errors, logError } from '@/services/exceptions'

export const useLoadCollectibles = (): AsyncResult<SafeCollectibleResponse[]> => {
  const { safe, safeAddress, safeLoaded } = useSafeInfo()
  const { chainId, collectiblesTag } = safe

  // Re-fetch assets when the Safe address or the collectibes tag updates
  const [data, error, loading] = useAsync<SafeCollectibleResponse[] | undefined>(
    async () => {
      if (!safeLoaded) return
      return getCollectibles(chainId, safeAddress)
    },
    [safeAddress, chainId, collectiblesTag],
    false,
  )

  // Log errors
  useEffect(() => {
    if (error) {
      logError(Errors._604, error.message)
    }
  }, [error])

  return [data, error, loading]
}

export default useLoadCollectibles