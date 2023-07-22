import React, { useState } from 'react'
import { TextField, Button, Box } from '@mui/material'

interface ChatInputProps {
  onSendMessage: (message: string) => void
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }

  const handleSend = () => {
    if (message.trim() !== '') {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'green',
        padding: '8px',
        position: 'absolute',
        bottom: 0,
        width: '100%',
      }}
    >
      <TextField
        sx={{ flex: 1, border: 'green', color: 'black' }}
        variant="outlined"
        placeholder="Type your message..."
        value={message}
        onChange={handleChange}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            handleSend()
          }
        }}
      />
      <Button sx={{ marginLeft: '4px' }} variant="contained" color="primary" onClick={handleSend}>
        Send
      </Button>
    </Box>
  )
}

export default ChatInput
