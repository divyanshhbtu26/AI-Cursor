import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiLoader, FiMessageSquare, FiUser } from 'react-icons/fi'

function ChatInterface({ setCode, setLoading }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const userMessage = input
    setInput('')
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    // Show processing state
    setIsProcessing(true)
    setLoading(true)
    
    try {
      // Call backend API
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }].map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            text: msg.content
          }))
        }),
      });

      const data = await response.json();
      
      // Handle the response
      if (data.files) {
        // Extract HTML, CSS, and JS from files
        const codeContent = [];
        if (data.files.html) codeContent.push(`<!-- HTML -->\n${data.files.html}`);
        if (data.files.css) codeContent.push(`/* CSS */\n${data.files.css}`);
        if (data.files.js) codeContent.push(`// JavaScript\n${data.files.js}`);
        
        const combinedCode = codeContent.join('\n\n');
        setCode(combinedCode);
        
        // Add response message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message || "I've generated the website code for you!"
        }]);
      } else if (data.message) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message
        }]);
      }
      
      setIsProcessing(false)
      setLoading(false)
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }])
      setIsProcessing(false)
      setLoading(false)
    }
  }

  return (
    <motion.div 
      className="flex flex-col h-full bg-dark-200/80 rounded-xl overflow-hidden border border-white/10 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 bg-dark-100/80 backdrop-blur-sm border-b border-white/10 flex items-center">
        <FiMessageSquare className="text-primary-400 mr-2" />
        <h2 className="text-xl font-semibold text-white">Chat Interface</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-dark-300">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              className="h-full flex flex-col items-center justify-center text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <FiMessageSquare className="text-white text-2xl" />
              </motion.div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm mt-2 max-w-md text-center">
                Ask about web development, code generation, or any tech-related queries
              </p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`max-w-[80%] rounded-xl p-3 shadow
                    ${message.role === 'user' 
                      ? 'bg-secondary-600/80 text-white ml-4' 
                      : 'bg-dark-300/80 text-white border border-white/10 mr-4'}`
                  }
                >
                  <div className="flex items-center mb-1">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-2
                      ${message.role === 'user' ? 'bg-secondary-800' : 'bg-primary-700'}`}>
                      {message.role === 'user' 
                        ? <FiUser className="text-xs" /> 
                        : <FiMessageSquare className="text-xs" />
                      }
                    </div>
                    <span className="text-xs font-semibold">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  <div className="text-left whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {isProcessing && (
            <motion.div 
              className="flex justify-start mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-dark-300/80 text-white border border-white/10 rounded-xl p-3 shadow max-w-[80%]">
                <div className="flex items-center mb-1">
                  <div className="h-6 w-6 bg-primary-700 rounded-full flex items-center justify-center mr-2">
                    <FiMessageSquare className="text-xs" />
                  </div>
                  <span className="text-xs font-semibold">AI Assistant</span>
                </div>
                <div className="flex items-center">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="p-4 border-t border-white/10 bg-dark-300/80 backdrop-blur-sm"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex rounded-lg overflow-hidden shadow-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-dark-100 text-white placeholder-white/50 border-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isProcessing}
          />
          <motion.button
            type="submit"
            className="px-4 bg-primary-600 text-white flex items-center justify-center"
            whileHover={{ backgroundColor: '#0284c7' }}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing || !input.trim()}
          >
            {isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <FiLoader className="text-xl" />
              </motion.div>
            ) : (
              <FiSend className="text-xl" />
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  )
}

export default ChatInterface
