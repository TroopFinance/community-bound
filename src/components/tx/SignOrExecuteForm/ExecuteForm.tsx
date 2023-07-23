import { type ReactElement, type SyntheticEvent, useContext, useState } from 'react'
import { Button, CardActions, Divider } from '@mui/material'
import classNames from 'classnames'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { logError, Errors } from '@/services/exceptions'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import useIsValidExecution from '@/hooks/useIsValidExecution'
import CheckWallet from '@/components/common/CheckWallet'
import { useImmediatelyExecutable, useIsExecutionLoop, useTxActions } from './hooks'
import { useRelaysBySafe } from '@/hooks/useRemainingRelays'
import useWalletCanRelay from '@/hooks/useWalletCanRelay'
import { ExecutionMethod, ExecutionMethodSelector } from '../ExecutionMethodSelector'
import { hasRemainingRelays } from '@/utils/relaying'
import type { SignOrExecuteProps } from '.'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { TxModalContext } from '@/components/tx-flow'
import { SuccessScreen } from '@/components/tx-flow/flows/SuccessScreen'
import useGasLimit from '@/hooks/useGasLimit'
import AdvancedParams, { useAdvancedParams } from '../AdvancedParams'
import { asError } from '@/services/exceptions/utils'

import css from './styles.module.css'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import NonOwnerError from '@/components/tx/SignOrExecuteForm/NonOwnerError'
import { useWeb3 } from '@/hooks/wallets/web3'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config/constants'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useSafeInfo from '@/hooks/useSafeInfo'

const ExecuteForm = ({
  safeTx,
  txId,
  onSubmit,
  disableSubmit = false,
  origin,
  onlyExecute,
}: SignOrExecuteProps & {
  safeTx?: SafeTransaction
}): ReactElement => {
  // Form state
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const { safe, safeAddress } = useSafeInfo()

  const addresses = safe.owners.map((address) => address.value)

  // Hooks
  const isOwner = useIsSafeOwner()
  const currentChain = useCurrentChain()
  const { executeTx } = useTxActions()
  const [relays] = useRelaysBySafe()
  const { setTxFlow } = useContext(TxModalContext)
  const { needsRiskConfirmation, isRiskConfirmed, setIsRiskIgnored } = useContext(TxSecurityContext)
  // Check that the transaction is executable
  const isCreation = !txId
  const isNewExecutableTx = useImmediatelyExecutable() && isCreation
  const isExecutionLoop = useIsExecutionLoop()

  // We default to relay, but the option is only shown if we canRelay
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)

  // SC wallets can relay fully signed transactions
  const [walletCanRelay] = useWalletCanRelay(safeTx)

  // The transaction can/will be relayed
  const canRelay = walletCanRelay && hasRemainingRelays(relays)
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY

  // Estimate gas limit
  const { gasLimit, gasLimitError } = useGasLimit(safeTx)
  const [advancedParams, setAdvancedParams] = useAdvancedParams(gasLimit)

  // Check if transaction will fail
  const { executionValidationError, isValidExecutionLoading } = useIsValidExecution(safeTx, advancedParams.gasLimit)

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()

    if (needsRiskConfirmation && !isRiskConfirmed) {
      setIsRiskIgnored(true)
      return
    }

    setIsSubmittable(false)
    setSubmitError(undefined)

    const txOptions = getTxOptions(advancedParams, currentChain)

    try {
      const executedTxId = await executeTx(txOptions, safeTx, txId, origin, willRelay)
      setTxFlow(<SuccessScreen txId={executedTxId} />, undefined, false)
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        const tx = await contract.addMultipleCommunityMembers(addresses)
        tx.wait()
        const finalTx = await contract.mint(safeTx?.data.to, 20)
        finalTx.wait()
      }
    } catch (_err) {
      const err = asError(_err)
      logError(Errors._804, err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    onSubmit()
  }

  const cannotPropose = !isOwner && !onlyExecute
  const submitDisabled =
    !safeTx || !isSubmittable || disableSubmit || isValidExecutionLoading || isExecutionLoop || cannotPropose

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className={classNames(css.params, { [css.noBottomBorderRadius]: canRelay })}>
          <AdvancedParams
            willExecute
            params={advancedParams}
            recommendedGasLimit={gasLimit}
            onFormSubmit={setAdvancedParams}
            gasLimitError={gasLimitError}
            willRelay={willRelay}
          />

          {canRelay && (
            <div className={css.noTopBorder}>
              <ExecutionMethodSelector
                executionMethod={executionMethod}
                setExecutionMethod={setExecutionMethod}
                relays={relays}
              />
            </div>
          )}
        </div>

        {/* Error messages */}
        {cannotPropose ? (
          <NonOwnerError />
        ) : isExecutionLoop ? (
          <ErrorMessage>
            Cannot execute a transaction from the Safe Account itself, please connect a different account.
          </ErrorMessage>
        ) : executionValidationError || gasLimitError ? (
          <ErrorMessage error={executionValidationError || gasLimitError}>
            This transaction will most likely fail.{' '}
            {isNewExecutableTx
              ? 'To save gas costs, avoid creating the transaction.'
              : 'To save gas costs, reject this transaction.'}
          </ErrorMessage>
        ) : (
          submitError && (
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          )
        )}

        <Divider className={commonCss.nestedDivider} sx={{ pt: 3 }} />

        <CardActions>
          {/* Submit button */}
          <CheckWallet allowNonOwner={onlyExecute}>
            {(isOk) => (
              <Button variant="contained" type="submit" disabled={!isOk || submitDisabled}>
                Submit
              </Button>
            )}
          </CheckWallet>
        </CardActions>
      </form>
    </>
  )
}

export default ExecuteForm
