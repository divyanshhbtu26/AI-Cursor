import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaDownload, FaCheckCircle, FaCode, FaSpinner } from 'react-icons/fa';

function CodeViewer({ files = [] }) {
  const [activeFile, setActiveFile] = useState(files.length > 0 ? files[0]?.name : '');
  const [copied, setCopied] = useState(false);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update active file when files array changes
  useEffect(() => {
    if (files.length > 0 && (!activeFile || !files.some(file => file.name === activeFile))) {
      setActiveFile(files[0].name);
    }
  }, [files, activeFile]);

  // Find the currently active file
  const currentFile = files.find(file => file.name === activeFile) || { name: '', content: '', language: 'text' };

  // Split code into lines for display
  useEffect(() => {
    if (currentFile.content) {
      const codeLines = currentFile.content.split('\n');
      setLines(codeLines);
    } else {
      setLines([]);
    }
  }, [currentFile.content]);

  // Function to copy code to clipboard
  const copyToClipboard = () => {
    if (!currentFile.content) return;
    
    navigator.clipboard.writeText(currentFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Function to download the current file
  const downloadFile = () => {
    if (!currentFile.content) return;
    
    const element = document.createElement('a');
    const file = new Blob([currentFile.content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = currentFile.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'js': return '⚙️';
      default: return '📄';
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full bg-dark-200/80 rounded-xl overflow-hidden border border-white/10 shadow-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* File tabs */}
      <div className="tabs tabs-boxed bg-base-300 p-2 overflow-x-auto">
        {files.map((file) => (
          <button
            key={file.name}
            className={`tab gap-2 ${activeFile === file.name ? 'tab-active' : ''}`}
            onClick={() => setActiveFile(file.name)}
          >
            <span>{getFileIcon(file.name)}</span>
            {file.name}
          </button>
        ))}
        {files.length === 0 && (
          <span className="tab tab-disabled">No files available</span>
        )}
      </div>

      {/* Action buttons */}
      {files.length > 0 && (
        <div className="bg-base-300 px-4 py-2 flex justify-end space-x-2 border-t border-base-content/10">
          <button 
            onClick={copyToClipboard}
            className="btn btn-sm btn-ghost"
            title="Copy code"
          >
            {copied ? <FaCheckCircle className="text-success" /> : <FaCopy />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button 
            onClick={downloadFile}
            className="btn btn-sm btn-ghost"
            title="Download file"
          >
            <FaDownload />
            Download
          </button>
        </div>
      )}

      {/* Code content */}
      <div className="flex-grow bg-base-100 p-4 overflow-auto">
        {files.length > 0 ? (
          <div className="min-h-full text-left p-0 relative">
            <div className="flex">
              <div className="py-4 px-2 text-right bg-dark-300 text-gray-500 select-none">
                {lines.map((_, i) => (
                  <div key={i} className="px-2">{i + 1}</div>
                ))}
              </div>
              <motion.div 
                className="py-4 px-4 overflow-x-auto text-gray-200 flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {lines.map((line, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="whitespace-pre"
                  >
                    <SyntaxHighlight code={line} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            className="h-full flex flex-col items-center justify-center text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-dark-100 to-dark-300 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <FaCode className="text-primary-400 text-2xl" />
            </motion.div>
            <p className="text-lg font-medium">No code generated yet</p>
            <p className="text-sm mt-2 max-w-md text-center">
              Ask a question in the chat to generate code
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Simple syntax highlighting component
function SyntaxHighlight({ code }) {
  // Very simple highlighting
  return code
    .replace(/\/\/(.*)/g, '<span class="text-gray-500">$&</span>') // Comments
    .replace(/(['"`])(.*?)(['"`])/g, '<span class="text-yellow-300">$&</span>') // Strings
    .replace(/\b(function|return|const|let|var|if|else|for|while|class|import|export|from)\b/g, 
             '<span class="text-purple-400">$&</span>') // Keywords
    .replace(/\b(true|false|null|undefined)\b/g, 
             '<span class="text-blue-400">$&</span>') // Literals
    .replace(/\b(\w+)(?=\()/g, 
             '<span class="text-primary-400">$&</span>') // Function calls
    .replace(/\b(\d+)\b/g, 
             '<span class="text-orange-400">$&</span>') // Numbers
}

// This is a way to render HTML in React - in a real app, consider using a proper syntax highlighting library
SyntaxHighlight = ({ code }) => {
  // Basic syntax highlighting with regex
  let highlighted = code
    .replace(/\/\/(.*)/g, '<span style="color: #888">$&</span>') // Comments
    .replace(/(['"`])(.*?)(['"`])/g, '<span style="color: #f8c555">$&</span>') // Strings
    .replace(/\b(function|return|const|let|var|if|else|for|while|class|import|export|from)\b/g, 
             '<span style="color: #c678dd">$&</span>') // Keywords
    .replace(/\b(true|false|null|undefined)\b/g, 
             '<span style="color: #56b6c2">$&</span>') // Literals
    .replace(/\b(\w+)(?=\()/g, 
             '<span style="color: #61afef">$&</span>') // Function calls
    .replace(/\b(\d+)\b/g, 
             '<span style="color: #d19a66">$&</span>') // Numbers

  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />
}

export default CodeViewer;
