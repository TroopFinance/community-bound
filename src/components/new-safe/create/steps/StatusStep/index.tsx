import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Divider, Paper, Tooltip, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import * as PushAPI from '@pushprotocol/restapi'

import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import StatusMessage from '@/components/new-safe/create/steps/StatusStep/StatusMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import type { NewSafeFormData } from '@/components/new-safe/create'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { PendingSafeTx } from '@/components/new-safe/create/types'
import useSafeCreationEffects from '@/components/new-safe/create/steps/StatusStep/useSafeCreationEffects'
import { SafeCreationStatus, useSafeCreation } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import StatusStepper from '@/components/new-safe/create/steps/StatusStep/StatusStepper'
import { trackEvent } from '@/services/analytics'
import { getRedirect } from '@/components/new-safe/create/logic'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import { AppRoutes } from '@/config/routes'
import { lightPalette } from '@safe-global/safe-react-components'
import { useCurrentChain } from '@/hooks/useChains'
import { useWeb3 } from '@/hooks/wallets/web3'

export const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export type PendingSafeData = NewSafeFormData & {
  txHash?: string
  tx?: PendingSafeTx
  taskId?: string
}

export const getInitialCreationStatus = (willRelay: boolean): SafeCreationStatus =>
  willRelay ? SafeCreationStatus.PROCESSING : SafeCreationStatus.AWAITING

export const CreateSafeStatus = ({ data, setProgressColor }: StepRenderProps<NewSafeFormData>) => {
  const [pendingSafe, setPendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
  const router = useRouter()
  const chainInfo = useCurrentChain()
  const chainPrefix = chainInfo?.shortName || ''
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isConnected = wallet && !isWrongChain

  // The willRelay flag can come from the previous step or from local storage
  const willRelay = !!(data.willRelay || pendingSafe?.willRelay)
  const initialStatus = getInitialCreationStatus(willRelay)
  const [status, setStatus] = useState<SafeCreationStatus>(initialStatus)
  const provider = useWeb3()

  const { handleCreateSafe } = useSafeCreation(pendingSafe, setPendingSafe, status, setStatus, willRelay)
  const members = data?.owners?.length > 0 ? data.owners.map((item) => item?.address) : []
  const filteredMembers = members?.filter((item) => item !== '0xBBe5e05DBFc5e852513A398682f38479119ff4E6') || []
  useSafeCreationEffects({
    pendingSafe,
    setPendingSafe,
    status,
    setStatus,
  })

  const onClose = useCallback(() => {
    setPendingSafe(undefined)
    router.push(AppRoutes.welcome)
  }, [router, setPendingSafe])

  const handleRetry = useCallback(() => {
    setStatus(initialStatus)
    void handleCreateSafe()
  }, [handleCreateSafe, initialStatus])

  const onFinish = useCallback(async () => {
    trackEvent(CREATE_SAFE_EVENTS.GET_STARTED)

    const { safeAddress } = pendingSafe || {}

    if (safeAddress) {
      setPendingSafe(undefined)

      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const createGroupRes = await PushAPI.chat.createGroup({
            groupName: data.name,
            groupDescription: data.name,
            members: filteredMembers,
            groupImage: null,
            admins: [safeAddress],
            isPublic: true,
            signer: provider?.getSigner(0),
          })
          router.push(getRedirect(chainPrefix, safeAddress, router.query?.safeViewRedirectURL))
        }
      } catch (error) {
        console.log({ error })
      }
    }
  }, [chainPrefix, pendingSafe, router, setPendingSafe])

  const displaySafeLink = status >= SafeCreationStatus.INDEXED
  const isError = status >= SafeCreationStatus.WALLET_REJECTED && status <= SafeCreationStatus.TIMEOUT

  useEffect(() => {
    if (!setProgressColor) return

    if (isError) {
      setProgressColor(lightPalette.error.main)
    } else {
      setProgressColor(lightPalette.secondary.main)
    }
  }, [isError, setProgressColor])

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <Box className={layoutCss.row}>
        <StatusMessage status={status} isError={isError} />
      </Box>

      {!isError && pendingSafe && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <StatusStepper pendingSafe={pendingSafe} status={status} />
          </Box>
        </>
      )}

      {displaySafeLink && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <Track {...CREATE_SAFE_EVENTS.GO_TO_SAFE}>
              <Button variant="contained" onClick={onFinish}>
                Start using {'Safe{Wallet}'}
              </Button>
            </Track>
          </Box>
        </>
      )}

      {isError && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
              <Track {...CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE}>
                <Button onClick={onClose} variant="outlined">
                  Cancel
                </Button>
              </Track>
              <Track {...CREATE_SAFE_EVENTS.RETRY_CREATE_SAFE}>
                <Tooltip
                  title={!isConnected ? 'Please make sure your wallet is connected on the correct network.' : ''}
                >
                  <Typography display="flex" height={1}>
                    <Button onClick={handleRetry} variant="contained" disabled={!isConnected}>
                      Retry
                    </Button>
                  </Typography>
                </Tooltip>
              </Track>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  )
}
