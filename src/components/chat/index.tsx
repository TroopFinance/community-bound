import React, { useEffect, useMemo, useRef, useState } from 'react'
import { List, ListItem, ListItemText, Divider, Box, Button, Container, CircularProgress } from '@mui/material'
import axios from 'axios'
import { ethers } from 'ethers'
import * as PushAPI from '@pushprotocol/restapi'
import ChatInput from './chatInput'
import useSafeAddress from '@/hooks/useSafeAddress'
import { motion } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'
import { useWeb3 } from '@/hooks/wallets/web3'
import useTxQueue from '@/hooks/useTxQueue'
import { getLatestTransactions } from '@/utils/tx-list'

export interface IFeeds {
  msg: IMessageIPFS
  did: string
  wallets: string
  profilePicture: string | null
  publicKey: string | null
  about: string | null
  threadhash: string | null
  intent: string | null
  intentSentBy: string | null
  intentTimestamp: Date
  combinedDID: string
  cid?: string
  chatId?: string
  groupInformation?: GroupDTO
}

export interface IMessageIPFS {
  fromCAIP10: string
  toCAIP10: string
  fromDID: string
  toDID: string
  messageType: string
  messageContent: string
  signature: string
  sigType: string
  link: string | null
  timestamp?: number
  encType: string
  encryptedSecret: string
}

export interface GroupDTO {
  members: Array<{
    wallet: string
    publicKey: string
    isAdmin: boolean
    image: string
  }>
  pendingMembers: Array<{
    wallet: string
    publicKey: string
    isAdmin: boolean
    image: string
  }>
  contractAddressERC20: string | null
  numberOfERC20: number
  contractAddressNFT: string | null
  numberOfNFTTokens: number
  verificationProof: string
  groupImage: string | null
  groupName: string
  isPublic: boolean
  groupDescription: string | null
  groupCreator: string
  chatId: string
  scheduleAt?: Date | null
  scheduleEnd?: Date | null
  groupType: string
}

export const fadeInOutVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      ease: 'easeInOut',
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ease: 'easeInOut',
      duration: 0.3,
    },
  },
}

const chatMsgVariants = {
  initial: {
    y: '100%',
    transition: {
      opacity: 0,
      duration: 0.3,
      delay: 0.5,
    },
  },
  animate: {
    y: 0,
    transition: {
      duration: 0.3,
      opacity: 1,
    },
  },
  exit: {
    transition: {
      opacity: 0,
      duration: 0.3,
      delay: 0.5,
    },
  },
}
const ChatFeed: React.FC = () => {
  const [chats, setChats] = useState<IMessageIPFS[]>([]) // Updated to IMessageIPFS[]
  const safeAddie = useSafeAddress()
  const [isExploding, setIsExploding] = React.useState(false)
  const provider = useWeb3()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [chatsLoading, setChatsLoading] = useState(true)
  const sortedChats = chats.slice().sort((a, b) => (a.timestamp! > b.timestamp! ? -1 : 1))
  const { page, loading } = useTxQueue()
  const queuedTxns = useMemo(() => getLatestTransactions(page?.results), [page?.results])

  console.log({ queuedTxns })
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch encrypted data using the provided API

        // Fetch chats using the actual API
        const conversationHash = await PushAPI.chat.conversationHash({
          account: '0xBBe5e05DBFc5e852513A398682f38479119ff4E6',
          conversationId: 'ab033a57f7ca3eece9b428c99b7c680e76edaeab05bac17b0da6ee5b88dcf9c3',
        })

        const response = await PushAPI.chat.history({
          threadhash: conversationHash.threadHash,
          account: 'eip155:0xBBe5e05DBFc5e852513A398682f38479119ff4E6',
          limit: 20,
          toDecrypt: false,
        })
        // Process the fetched messages and convert them to the IMessageIPFS type
        setChats(response as unknown as IMessageIPFS[])
        console.log({ response })
      } catch (error) {
        console.error('Error fetching chats:', error)
      } finally {
        setChatsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chats])

  const handleSendMessage = async (message: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const response = await PushAPI.chat.send({
          messageContent: message,
          messageType: 'Text',
          receiverAddress: 'ab033a57f7ca3eece9b428c99b7c680e76edaeab05bac17b0da6ee5b88dcf9c3',
          signer: provider.getSigner(0),
        })

        // After sending the message, you can update the chat feed state with the new message
        setChats((prevChats) =>
          prevChats.length > 0
            ? [
                ...prevChats,
                {
                  fromCAIP10: '',
                  toCAIP10: 'receiver_did', // Update this with the receiver's DID
                  fromDID: '',
                  toDID: 'receiver_did', // Update this with the receiver's DID
                  messageType: 'Text',
                  messageContent: message,
                  signature: 'signature', // Replace with the signature from the API response if available
                  sigType: 'signature_type', // Replace with the signature type from the API response if available
                  link: null,
                  timestamp: Date.now(), // Use the current timestamp or the timestamp from the API response if available
                  encType: 'encryption_type', // Replace with the encryption type from the API response if available
                  encryptedSecret: 'encrypted_secret', // Replace with the encrypted secret from the API response if available
                },
              ]
            : [
                {
                  fromCAIP10: '',
                  toCAIP10: 'receiver_did',
                  fromDID: '',
                  toDID: 'receiver_did',
                  messageType: 'Text',
                  messageContent: message,
                  signature: 'signature',
                  sigType: 'signature_type',
                  link: null,
                  timestamp: Date.now(),
                  encType: 'encryption_type',
                  encryptedSecret: 'encrypted_secret',
                },
              ],
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  if (chatsLoading)
    return (
      <Container
        sx={{
          width: '100%',
          minHeight: '40vh',
          backgroundColor: 'black',
          borderRadius: '8px',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          paddingBottom: '56px', // To accommodate the height of the input box
        }}
        ref={chatContainerRef}
      >
        <CircularProgress />
      </Container>
    )

  return (
    <>
      <ChatInput onSendMessage={handleSendMessage} />

      <Container
        sx={{
          width: '100%',
          minHeight: '40vh',
          backgroundColor: 'black',
          borderRadius: '8px',
          overflow: 'hidden',
          paddingBottom: '56px', // To accommodate the height of the input box
        }}
        ref={chatContainerRef}
      >
        <List sx={{ height: '100%', overflowY: 'auto' }}>
          {sortedChats.length === 0 || !sortedChats ? (
            <motion.div
              style={{
                textAlign: 'center',
                color: 'white',
                paddingTop: '16px',
              }}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              No messages yet.
            </motion.div>
          ) : (
            sortedChats?.map((chat, index) => (
              <motion.div
                key={index}
                variants={chatMsgVariants}
                style={{
                  width: '50%',
                  padding: '8px',
                  marginBottom: '8px',
                  marginLeft: '8px',
                  border: 'solid 0.5px white',
                  borderRadius: '8px',
                }}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Box>
                  <p>{chat.fromCAIP10.replace('eip155:', '')} </p>
                  <ListItemText sx={{ marginBottom: '16px' }} color="white" primary={chat.messageContent} />
                  <Button variant="contained" color="primary" onClick={() => setIsExploding(true)}>
                    Chapeau!
                    {isExploding ? (
                      <ConfettiExplosion
                        duration={2000}
                        style={{ position: 'absolute', bottom: 1, right: 1 }}
                        onComplete={() => setIsExploding(false)}
                      />
                    ) : null}
                  </Button>
                </Box>
              </motion.div>
            ))
          )}
        </List>
      </Container>
    </>
  )
}

export default ChatFeed
