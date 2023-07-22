import React, { useEffect, useState } from 'react'
import { List, ListItem, ListItemText, Divider, Box, Button } from '@mui/material'
import axios from 'axios'
import { ethers } from 'ethers'
import * as PushAPI from '@pushprotocol/restapi'
import ChatInput from './chatInput'
import useSafeAddress from '@/hooks/useSafeAddress'
import { motion } from 'framer-motion'
import ConfettiExplosion from 'react-confetti-explosion'

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
  members: {
    wallet: string
    publicKey: string
    isAdmin: boolean
    image: string
  }[]
  pendingMembers: {
    wallet: string
    publicKey: string
    isAdmin: boolean
    image: string
  }[]
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log({ safeAddie })
        // Fetch encrypted data using the provided API

        // Fetch chats using the actual API
        const response = await PushAPI.chat.chats({
          account: `eip155:${safeAddie}`,
          toDecrypt: false,
        })

        const groupResponse = await PushAPI.chat.getGroupByName({
          groupName: 'last try',
        })
        // Process the fetched messages and convert them to the IMessageIPFS type
        setChats(response as unknown as IMessageIPFS[])
        console.log({ response, groupResponse })
      } catch (error) {
        console.error('Error fetching chats:', error)
      }
    }

    fetchData()
  }, [])

  console.log({ chats })
  const handleSendMessage = async (message: string) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const response = await PushAPI.chat.send({
          messageContent: message,
          messageType: 'Text',
          receiverAddress: 'b0a1d13e6baecd9ce8635e777fe64b1a2e92a5c8e06ddd44111955b1a5083f02',
          signer: signer,
        })

        // After sending the message, you can update the chat feed state with the new message
        setChats((prevChats) => [
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
        ])
        console.log({ response })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <List sx={{ width: '100%', height: '80vh', backgroundColor: 'black' }}>
      {chats.map((chat) => (
        <motion.div
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
            <ListItemText primary={chat.messageContent} /> {/* Access the property to render */}
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
      ))}
      <ChatInput onSendMessage={handleSendMessage} />
    </List>
  )
}

export default ChatFeed
