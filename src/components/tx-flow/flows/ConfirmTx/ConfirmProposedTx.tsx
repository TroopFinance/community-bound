import { type ReactElement, useContext, useEffect } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useChainId } from '@/hooks/useChainId'
import useWallet from '@/hooks/wallets/useWallet'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { isExecutable, isSignableBy } from '@/utils/transaction-guards'
import { Typography } from '@mui/material'
import { createExistingTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import { useWeb3 } from '@/hooks/wallets/web3'
import { ethers } from 'ethers'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/config/constants'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
}

const SIGN_TEXT = 'Sign this transaction.'
const EXECUTE_TEXT = 'Submit the form to execute this transaction.'
const SIGN_EXECUTE_TEXT = 'Sign or immediately execute this transaction.'

const ConfirmProposedTx = ({ txSummary }: ConfirmProposedTxProps): ReactElement => {
  const wallet = useWallet()
  const { safe, safeAddress } = useSafeInfo()
  const chainId = useChainId()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  const txId = txSummary.id
  const canExecute = isExecutable(txSummary, wallet?.address || '', safe)
  const canSign = isSignableBy(txSummary, wallet?.address || '')

  useEffect(() => {
    createExistingTx(chainId, safeAddress, txId).then(setSafeTx).catch(setSafeTxError)
  }, [txId, safeAddress, chainId, setSafeTx, setSafeTxError])

  const text = canSign ? (canExecute ? SIGN_EXECUTE_TEXT : SIGN_TEXT) : EXECUTE_TEXT

  return (
    <SignOrExecuteForm txId={txId} onSubmit={async () => {}} isExecutable={canExecute} onlyExecute={!canSign}>
      <Typography mb={2}>{text}</Typography>
    </SignOrExecuteForm>
  )
}

export default ConfirmProposedTx
