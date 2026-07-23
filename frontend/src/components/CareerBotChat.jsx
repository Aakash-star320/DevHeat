import React, { useState, useEffect, useRef } from 'react';
import careerBotService from '../services/careerBotService';
import './CareerBotChat.css';

const CareerBotChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load chat history on mount
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await careerBotService.getHistory();
            setMessages(data.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.created_at,
                ai_service: msg.ai_service
            })));
        } catch (err) {
            console.error('Failed to load history:', err);
            // Don't show error for history load failure
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setError(null);

        // Optimistically add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await careerBotService.sendMessage(userMessage);

            // Add assistant response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.assistant_message,
                ai_service: response.ai_service,
                timestamp: response.timestamp
            }]);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Send message error:', err);

            // Remove optimistic user message on error
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
            return;
        }

        try {
            await careerBotService.clearHistory();
            setMessages([]);
            setError(null);
        } catch (err) {
            setError('Failed to clear history');
            console.error('Clear history error:', err);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div className="career-bot-chat">
            <div className="chat-header">
                <h2>AI Career Coach</h2>
                <button onClick={handleClearHistory} className="clear-btn" title="Clear conversation history">
                    Clear History
                </button>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && !isLoading && (
                    <div className="welcome-message">
                        <h3>👋 Welcome to your AI Career Coach!</h3>
                        <p>I'm here to help you with personalized career guidance.</p>
                        <p>Ask me anything about:</p>
                        <ul>
                            <li>Your skills and how to improve them</li>
                            <li>Career paths based on your GitHub projects</li>
                            <li>Interview preparation and job search strategies</li>
                            <li>Learning resources and next steps</li>
                        </ul>
                        <p className="data-note">
                            I have access to your GitHub profile, resume, and coding stats to provide personalized advice.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-content">
                            {msg.content}
                        </div>
                        {msg.ai_service && (
                            <div className="message-meta">
                                Powered by {msg.ai_service}
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant loading">
                        <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your career, skills, or next steps..."
                    disabled={isLoading}
                    className="chat-input"
                />
                <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="send-btn"
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default CareerBotChat;
