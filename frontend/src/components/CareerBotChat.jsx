import { useEffect, useRef, useState } from 'react';
import {
    ArrowUp,
    Bot,
    Check,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    MessageSquare,
    Maximize2,
    Minimize2,
    MoreHorizontal,
    Pencil,
    Plus,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react';
import careerBotService from '../services/careerBotService';
import './CareerBotChat.css';

const starterPrompts = [
    'What should I focus on for a backend role?',
    'Help me create an interview preparation plan.',
    'What strengths should I highlight in my portfolio?',
];

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
};

const CareerBotChat = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [error, setError] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const messagesEndRef = useRef(null);
    const messageAreaRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setIsFullscreen(false);
        };
        document.body.classList.toggle('career-chat-fullscreen-active', isFullscreen);
        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.classList.remove('career-chat-fullscreen-active');
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isFullscreen]);

    const loadConversations = async () => {
        try {
            setConversations(await careerBotService.listConversations());
        } catch (requestError) {
            console.error('Failed to load conversations:', requestError);
            setError('We could not load your conversations. Please refresh and try again.');
        }
    };

    const selectConversation = async (conversation) => {
        if (conversation.id === activeConversation?.id || isLoading) return;
        setActiveConversation(conversation);
        setMessages([]);
        setError('');
        setIsLoadingMessages(true);
        try {
            const data = await careerBotService.getMessages(conversation.id);
            setMessages(data.messages);
        } catch (requestError) {
            console.error('Failed to load messages:', requestError);
            setError('We could not load this conversation. Please try again.');
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const startNewConversation = () => {
        if (isLoading) return;
        setActiveConversation(null);
        setMessages([]);
        setInputMessage('');
        setError('');
        setRenamingId(null);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const ensureConversation = async () => {
        if (activeConversation) return activeConversation;
        const conversation = await careerBotService.createConversation();
        setActiveConversation(conversation);
        setConversations((current) => [conversation, ...current]);
        return conversation;
    };

    const updateConversationInList = (conversation) => {
        setConversations((current) => [
            conversation,
            ...current.filter((item) => item.id !== conversation.id),
        ]);
    };

    const handleSendMessage = async (event) => {
        event?.preventDefault();
        const message = inputMessage.trim();
        if (!message || isLoading) return;

        setInputMessage('');
        setError('');
        setIsLoading(true);

        try {
            const conversation = await ensureConversation();
            const optimisticMessage = {
                id: `pending-${Date.now()}`,
                role: 'user',
                content: message,
                created_at: new Date().toISOString(),
            };
            setMessages((current) => [...current, optimisticMessage]);
            const response = await careerBotService.sendMessage(conversation.id, message);
            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: response.assistant_message,
                    created_at: response.timestamp,
                    ai_service: response.ai_service,
                },
            ]);
            const updatedConversation = {
                ...conversation,
                updated_at: response.timestamp,
                title: conversation.title,
            };
            setActiveConversation(updatedConversation);
            updateConversationInList(updatedConversation);
        } catch (requestError) {
            console.error('Send message error:', requestError);
            setMessages((current) => current.filter((messageItem) => !messageItem.id?.startsWith('pending-')));
            setError('The coach could not respond right now. Your message was not saved — please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConversation = async (conversation, event) => {
        event.stopPropagation();
        if (isLoading || !window.confirm(`Delete “${conversation.title}”? This cannot be undone.`)) return;
        try {
            await careerBotService.deleteConversation(conversation.id);
            setConversations((current) => current.filter((item) => item.id !== conversation.id));
            if (activeConversation?.id === conversation.id) startNewConversation();
        } catch (requestError) {
            console.error('Delete conversation error:', requestError);
            setError('We could not delete this conversation. Please try again.');
        }
    };

    const beginRename = (conversation, event) => {
        event.stopPropagation();
        setRenamingId(conversation.id);
        setRenameValue(conversation.title);
    };

    const saveRename = async (conversation, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        const title = renameValue.trim();
        if (!title) return;
        try {
            const updatedConversation = await careerBotService.renameConversation(conversation.id, title);
            setActiveConversation((current) => current?.id === conversation.id ? updatedConversation : current);
            setConversations((current) => current.map((item) => (
                item.id === conversation.id ? updatedConversation : item
            )));
            setRenamingId(null);
        } catch (requestError) {
            console.error('Rename conversation error:', requestError);
            setError('We could not rename this conversation. Please try again.');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleFullscreenWheel = (event) => {
        if (!isFullscreen || event.target.closest('.conversation-list')) return;
        const messageArea = messageAreaRef.current;
        if (!messageArea || !event.deltaY) return;
        messageArea.scrollTop += event.deltaY;
        event.preventDefault();
    };

    return (
        <section
            className={`coach-workspace ${isFullscreen ? 'is-fullscreen' : ''}`}
            aria-label="AI Career Coach workspace"
            onWheel={handleFullscreenWheel}
        >
            {!isFullscreen && (
                <button
                    type="button"
                    className="quick-fullscreen-button"
                    onClick={() => setIsFullscreen(true)}
                    aria-label="Open full-screen coaching workspace"
                    title="Focus mode"
                >
                    <Maximize2 size={18} />
                    <span>Focus</span>
                </button>
            )}
            <aside className={`coach-sidebar ${sidebarOpen ? 'is-open' : 'is-collapsed'}`}>
                <div className="coach-sidebar-brand">
                    <div className="coach-brand-mark"><Sparkles size={18} /></div>
                    <div className="coach-brand-copy">
                        <span>DEVHEAT</span>
                        <strong>Career studio</strong>
                    </div>
                    <button className="icon-button sidebar-collapse" onClick={() => setSidebarOpen(false)} aria-label="Collapse conversations">
                        <ChevronLeft size={18} />
                    </button>
                </div>

                <button className="new-conversation-button" onClick={startNewConversation} disabled={isLoading}>
                    <Plus size={18} />
                    <span>New conversation</span>
                </button>

                <div className="conversation-list-heading">
                    <span>YOUR CONVERSATIONS</span>
                    <span>{conversations.length}</span>
                </div>
                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <div className="conversation-empty">Your focused coaching sessions will appear here.</div>
                    ) : conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            className={`conversation-card ${activeConversation?.id === conversation.id ? 'is-active' : ''}`}
                            onClick={() => selectConversation(conversation)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    selectConversation(conversation);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <MessageSquare size={16} />
                            <span className="conversation-card-copy">
                                {renamingId === conversation.id ? (
                                    <form onSubmit={(event) => saveRename(conversation, event)} onClick={(event) => event.stopPropagation()}>
                                        <input
                                            value={renameValue}
                                            autoFocus
                                            onChange={(event) => setRenameValue(event.target.value)}
                                            onBlur={(event) => saveRename(conversation, event)}
                                            aria-label="Conversation title"
                                        />
                                    </form>
                                ) : <strong>{conversation.title}</strong>}
                                <small>{formatDate(conversation.updated_at) || 'New'}</small>
                            </span>
                            <span className="conversation-actions">
                                <button type="button" onClick={(event) => beginRename(conversation, event)} aria-label="Rename conversation"><Pencil size={14} /></button>
                                <button type="button" onClick={(event) => handleDeleteConversation(conversation, event)} aria-label="Delete conversation"><Trash2 size={14} /></button>
                            </span>
                        </div>
                    ))}
                </div>
                <div className="coach-sidebar-footer">
                    <Bot size={17} />
                    <span>Private by conversation</span>
                </div>
            </aside>

            <div className="coach-main">
                {!sidebarOpen && <button className="icon-button sidebar-expand" onClick={() => setSidebarOpen(true)} aria-label="Show conversations"><ChevronRight size={19} /></button>}
                <header className="coach-main-header">
                    <div>
                        <span className="eyebrow"><span className="live-dot" /> FOCUSED COACHING</span>
                        <h2>{activeConversation?.title || 'Start a fresh conversation'}</h2>
                    </div>
                    <div className="coach-header-actions">
                        <div className="coach-context-chip"><Check size={14} /> Context stays in this chat</div>
                        <button
                            type="button"
                            className="icon-button fullscreen-button"
                            onClick={() => setIsFullscreen((current) => !current)}
                            aria-label={isFullscreen ? 'Exit full-screen coaching workspace' : 'Open full-screen coaching workspace'}
                            title={isFullscreen ? 'Exit full screen (Esc)' : 'Full screen'}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </header>

                <div className="coach-message-area" ref={messageAreaRef}>
                    {isLoadingMessages ? (
                        <div className="coach-loading-state"><span /><span /><span /></div>
                    ) : messages.length === 0 ? (
                        <div className="coach-welcome">
                            <div className="coach-welcome-orb"><Sparkles size={32} /></div>
                            <span className="eyebrow">YOUR PRIVATE COACHING SPACE</span>
                            <h3>Make your next career move<br />with a clearer plan.</h3>
                            <p>Ask about interviews, your skills, projects, or the best next step. This chat starts fresh and keeps its own context.</p>
                            <div className="starter-grid">
                                {starterPrompts.map((prompt) => (
                                    <button key={prompt} onClick={() => setInputMessage(prompt)}>
                                        <ClipboardCheck size={17} />
                                        {prompt}
                                        <ArrowUp size={15} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="message-stack">
                            {messages.map((message) => (
                                <article key={message.id} className={`coach-message ${message.role}`}>
                                    <div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={15} /> : 'YOU'}</div>
                                    <div className="message-body">
                                        <div className="message-label">{message.role === 'assistant' ? 'CAREER COACH' : 'YOU'}</div>
                                        <div className="message-bubble">{message.content}</div>
                                        {message.ai_service && <div className="message-provider">Response by {message.ai_service}</div>}
                                    </div>
                                </article>
                            ))}
                            {isLoading && <article className="coach-message assistant"><div className="message-avatar"><Sparkles size={15} /></div><div className="message-body"><div className="message-label">CAREER COACH</div><div className="typing-bubble"><span /><span /><span /></div></div></article>}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {error && <div className="coach-error"><X size={16} /> {error}</div>}
                <form className="coach-composer" onSubmit={handleSendMessage}>
                    <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(event) => setInputMessage(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your coach anything about your career…"
                        rows="1"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !inputMessage.trim()} aria-label="Send message">
                        {isLoading ? <MoreHorizontal size={21} /> : <ArrowUp size={20} />}
                    </button>
                </form>
                <p className="coach-composer-note">Your conversation context is isolated from your other chats.</p>
            </div>
        </section>
    );
};

export default CareerBotChat;
