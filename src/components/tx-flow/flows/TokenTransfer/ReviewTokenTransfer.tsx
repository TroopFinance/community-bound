import { useContext, useEffect } from 'react'
import useBalances from '@/hooks/useBalances'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import SendToBlock from '@/components/tx-flow/flows/TokenTransfer/SendToBlock'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/tx-sender'
import type { TokenTransferParams } from '.'
import { SafeTxContext } from '../../SafeTxProvider'
import { useWeb3 } from '@/hooks/wallets/web3'
import * as PushAPI from '@pushprotocol/restapi'

const ReviewTokenTransfer = ({
  params,
  onSubmit,
  txNonce,
}: {
  params: TokenTransferParams
  onSubmit: () => void
  txNonce?: number
}) => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const provider = useWeb3()

  useEffect(() => {
    if (txNonce !== undefined) {
      setNonce(txNonce)
    }

    if (!token) return

    const txParams = createTokenTransferParams(
      params.recipient,
      params.amount,
      token.tokenInfo.decimals,
      token.tokenInfo.address,
    )

    createTx(txParams, txNonce).then(setSafeTx).catch(setSafeTxError)
    // onchain call: createProposal(safeTx, "some message")
  }, [params, txNonce, token, setNonce, setSafeTx, setSafeTxError])
  console.log({ txNonce, setSafeTx })

  const handleSubmit = async () => {
    onSubmit()
    const response = await PushAPI.chat.send({
      // read from chain: readProposal(safeTx) => SafeTransaction API (we have data about proposal) + "some message"
      messageContent: `I want to send ${params.amount} of ${token?.tokenInfo.name} to ${params.recipient}`,
      messageType: 'Text',
      receiverAddress: 'ab033a57f7ca3eece9b428c99b7c680e76edaeab05bac17b0da6ee5b88dcf9c3',
      signer: provider?.getSigner(0),
    })
    console.log({ response }, 'something')
  }
  return (
    <SignOrExecuteForm onSubmit={handleSubmit}>
      {token && <SendAmountBlock amount={params.amount} tokenInfo={token.tokenInfo} />}

      <SendToBlock address={params.recipient} />
    </SignOrExecuteForm>
  )
}

export default ReviewTokenTransfer
