import { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { motion } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import CodeViewer from "./components/CodeViewer";
import { FaGithub } from 'react-icons/fa';
import './App.css';

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const scrollRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [codeGenerationStarted, setCodeGenerationStarted] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  // Function to animate AI typing effect
  const animateAIResponse = async (fullText, updatedChats) => {
    let displayedText = "";
    setIsTyping(true);
    
    // For large responses, don't animate character by character
    if (fullText.length > 500) {
      setChats([...updatedChats, { role: "model", text: fullText }]);
      setIsTyping(false);
      return;
    }
    
    // For shorter responses, animate
    for (let i = 0; i < fullText.length; i++) {
      displayedText += fullText[i];
      setChats([...updatedChats, { role: "model", text: displayedText }]);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    setIsTyping(false);
  };

  const parseFileContent = (responseData) => {
    // Start code generation view if not already started
    if (!codeGenerationStarted) {
      setCodeGenerationStarted(true);
    }
    
    // Handle file content if it's a writeFile command
    if (typeof responseData === 'object') {
      if (responseData.path && responseData.content) {
        const fileName = responseData.path.split('/').pop() || responseData.path.split('\\').pop();
        const fileExtension = fileName.split('.').pop().toLowerCase();
        const language = 
          fileExtension === 'html' ? 'html' : 
          fileExtension === 'css' ? 'css' : 
          fileExtension === 'js' ? 'javascript' : 'text';
        
        setGeneratedFiles(prev => {
          const existingIndex = prev.findIndex(file => file.name === fileName);
          if (existingIndex !== -1) {
            // Replace the existing file
            const newFiles = [...prev];
            newFiles[existingIndex] = {
              name: fileName,
              content: responseData.content,
              language: language
            };
            return newFiles;
          } else {
            // Add new file
            return [...prev, {
              name: fileName,
              content: responseData.content,
              language: language
            }];
          }
        });
      }
      
      // Process files returned directly from the backend
      if (responseData.files) {
        const newFiles = [];
        
        if (responseData.files.html) {
          newFiles.push({
            name: "index.html",
            content: responseData.files.html,
            language: "html"
          });
        }
        
        if (responseData.files.css) {
          newFiles.push({
            name: "style.css",
            content: responseData.files.css,
            language: "css"
          });
        }
        
        if (responseData.files.js) {
          newFiles.push({
            name: "script.js",
            content: responseData.files.js,
            language: "javascript"
          });
        }
        
        if (newFiles.length > 0) {
          setGeneratedFiles(prev => {
            // Create a map of existing files for quick lookup
            const existingFilesMap = new Map(prev.map(file => [file.name, file]));
            
            // Process each new file
            newFiles.forEach(newFile => {
              existingFilesMap.set(newFile.name, newFile);
            });
            
            // Convert map back to array
            return Array.from(existingFilesMap.values());
          });
        }
      }
    }
  };

  // Function to handle sending messages
  const handleSend = async (message) => {
    try {
      if (!message.trim()) return;

      const updatedChats = [...chats, { role: "user", text: message }];
      setChats(updatedChats);
      setMessage("");
      setIsTyping(true);
      
      const response = await fetch("http://localhost:3000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedChats.map(chat => ({
            role: chat.role,
            text: chat.text
          })),
        }),
      });

      const data = await response.json();
      
      // Parse file content
      parseFileContent(data);
      
      // Add AI's response to chat
      if (typeof data.message === 'string') {
        await animateAIResponse(data.message, updatedChats);
      } else {
        // Show a message indicating the AI is working on files
        await animateAIResponse("I'm creating your website. This might take a few moments...", updatedChats);
        // Enable code viewer if it's not already shown
        if (!codeGenerationStarted) {
          setCodeGenerationStarted(true);
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsTyping(false);
      
      // Add error message to chat
      setChats(prev => [
        ...prev,
        { role: "system", text: "Sorry, there was an error processing your request. Please try again." }
      ]);
    }
  };

  // Update state to handle file contents more effectively
  useEffect(() => {
    if (code && code.trim().length > 0) {
      // Code has been set, process it into files
      const htmlMatch = code.match(/<!-- HTML -->\n([\s\S]*?)(?=\/\*|$)/);
      const cssMatch = code.match(/\/\* CSS \*\/\n([\s\S]*?)(?=\/\/|$)/);
      const jsMatch = code.match(/\/\/ JavaScript\n([\s\S]*?)$/);
      
      const newFiles = [];
      
      if (htmlMatch && htmlMatch[1]) {
        newFiles.push({
          name: "index.html",
          content: htmlMatch[1].trim(),
          language: "html"
        });
      }
      
      if (cssMatch && cssMatch[1]) {
        newFiles.push({
          name: "style.css",
          content: cssMatch[1].trim(),
          language: "css"
        });
      }
      
      if (jsMatch && jsMatch[1]) {
        newFiles.push({
          name: "script.js",
          content: jsMatch[1].trim(),
          language: "javascript"
        });
      }
      
      if (newFiles.length > 0) {
        setGeneratedFiles(newFiles);
        setCodeGenerationStarted(true);
      }
    }
  }, [code]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen animated-bg flex flex-col"
    >
      <motion.header 
        className="py-4 px-6 flex justify-between items-center border-b border-white/10 bg-dark-400/80 backdrop-blur-md"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div 
            className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text">
            WebAgent
          </h1>
        </motion.div>
        <motion.a
          href="https://github.com/yourusername/webagent"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white flex items-center gap-2"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGithub className="text-xl" />
          <span className="hidden md:inline">GitHub</span>
        </motion.a>
      </motion.header>

      <main className="flex flex-1 flex-col md:flex-row p-4 gap-4 overflow-hidden">
        <motion.div 
          className="flex-1 min-w-0 h-[40vh] md:h-auto"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ChatInterface 
            setCode={setCode}
            setLoading={setLoading}
          />
        </motion.div>
        
        <motion.div 
          className="flex-1 min-w-0 h-[40vh] md:h-auto"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CodeViewer 
            files={generatedFiles} 
            loading={loading} 
          />
        </motion.div>
      </main>

      <motion.footer 
        className="p-4 text-center text-white/50 text-sm border-t border-white/10 bg-dark-400/80 backdrop-blur-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>Powered by Advanced AI • {new Date().getFullYear()}</p>
      </motion.footer>
    </motion.div>
  );
}

export default App;
