import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify'; // Add this for security
import './ToolChainResult.css';
import { formatGPTResponse } from '../utils/toolExecutor';

function ToolChainResult({ result, steps, explanation }) {
  const [visibleOutputs, setVisibleOutputs] = useState({});
  const [viewMode, setViewMode] = useState('plain'); // 'plain' or 'markdown'
  
  // Function to toggle visibility of step outputs
  const toggleOutput = (stepIndex) => {
    setVisibleOutputs(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  // Check if result is a string before passing to ReactMarkdown
  const markdownContent = typeof result === 'string' ? result : 
    (typeof result === 'object' ? JSON.stringify(result) : '');

  // Create a safe HTML version (sanitized to prevent XSS)
  const sanitizedHtml = DOMPurify.sanitize(markdownContent);
  const formattedHtml = formatGPTResponse(markdownContent);

  // Function to convert markdown to plain text
  const markdownToPlainText = (markdown) => {
    return markdown
      // Remove headers
      .replace(/#{1,6}\s?/g, '')
      // Remove bold/italic
      .replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
      .replace(/(\*|_)(.*?)(\*|_)/g, '$2')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```(.*?)\n|```$/g, '').trim();
      })
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      // Convert lists to plain text with dashes
      .replace(/^\s*[\*\-\+]\s+/gm, '- ');
  };

  // Then use this in your render function
  const plainTextContent = markdownToPlainText(markdownContent);

  return (
    <div className="result-container">
      <h2>Dynamic Tool Chaining Result</h2>
      
      <div className="view-toggle">
        <button 
          className={viewMode === 'plain' ? 'active' : ''} 
          onClick={() => setViewMode('plain')}
        >
          Plain Text
        </button>
        <button 
          className={viewMode === 'markdown' ? 'active' : ''} 
          onClick={() => setViewMode('markdown')}
        >
          Formatted
        </button>
      </div>
      
      {viewMode === 'plain' ? (
        <div className="plain-text-content">
          {plainTextContent.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      ) : (
        <div className="markdown-content">
          <div dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </div>
      )}
      
      {steps && steps.length > 0 && (
        <div className="steps-container">
          <h3>Tool Chain Steps:</h3>
          {steps.map((step, index) => (
            <div key={index} className="step">
              <strong>{index + 1}. {step.tool}</strong>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                onClick={() => toggleOutput(index)}
              >
                {visibleOutputs[index] ? 'Hide Output' : 'Show Output'}
              </button>
              {visibleOutputs[index] && (
                <div className="step-output">
                  {typeof step.output === 'object' ? (
                    <pre>{JSON.stringify(step.output, null, 2)}</pre>
                  ) : (
                    // Use ReactMarkdown for step outputs too
                    <ReactMarkdown
                      children={step.output || ''}
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {explanation && (
        <div className="chain-explanation">
          <h3>How this works:</h3>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default ToolChainResult;