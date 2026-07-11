import { useEffect, useState, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '@/store/auth'
import { Card, Button, Badge } from '@/components/ui'
import { Send, MessageSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  content: string
  createdAt: string
}

export function ChatWidget({ bookingId, disabled }: { bookingId: string, disabled?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const stompClient = useRef<Client | null>(null)
  const user = useAuthStore(s => s.user)
  const token = localStorage.getItem('hyperlocal-jwt') || ''
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch history
    const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
    fetch(`${BASE}/api/bookings/${bookingId}/chat`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to load chat history:", err))

    // Connect STOMP
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE}/ws?token=${token}`),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      setIsConnected(true)
      client.subscribe(`/topic/chat/${bookingId}`, (msg) => {
        if (msg.body) {
          const newMsg = JSON.parse(msg.body) as ChatMessage
          setMessages(prev => [...prev, newMsg])
        }
      })
    }
    
    client.onDisconnect = () => setIsConnected(false)

    client.activate()
    stompClient.current = client

    return () => {
      client.deactivate()
    }
  }, [bookingId, token])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!inputText.trim() || !isConnected || !stompClient.current) return
    stompClient.current.publish({
      destination: `/app/chat/${bookingId}`,
      body: JSON.stringify({ content: inputText.trim() })
    })
    setInputText('')
  }

  if (!user) return null

  return (
    <Card className="flex h-96 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <h3 className="flex items-center gap-2 font-semibold">
          <MessageSquare className="size-4" />
          Live Chat
        </h3>
        <Badge tone={isConnected ? 'success' : 'neutral'}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Badge>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-10">No messages yet. Say hello!</p>
        ) : (
          messages.map(m => {
            const isMe = m.senderId === user.id
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p>{m.content}</p>
                  <span className={`mt-1 block text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Type a message..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={!isConnected || disabled}
          />
          <Button onClick={handleSend} disabled={!isConnected || disabled || !inputText.trim()} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
