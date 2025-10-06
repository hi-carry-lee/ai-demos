import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeToken, removeUser, getUser } from '@/lib/axios';
import NavBar from '@/components/NavBar';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface Chat {
  id: string;
  title: string;
  description: string;
}

interface User {
  username?: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chat = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Article Summary',
      description: 'Summarize the key points of the article',
    },
    {
      id: '2',
      title: 'Marketing Campaign',
      description: 'Generate a marketing campaign for a new product',
    },
    {
      id: '3',
      title: 'Quantum Computing Explanation',
      description: 'Explain the concept of quantum computing',
    },
    {
      id: '4',
      title: 'Translation',
      description: 'Translate the following text into Spanish',
    },
  ]);

  useEffect(() => {
    // 为了测试，设置一个模拟用户
    setUser({ username: 'Test User', email: 'test@example.com' });

    // 检查用户是否登录
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate('/login');
  };

  const handleStartChat = () => {
    setIsChatOpen(true);
    // 添加欢迎消息
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: '你好！我是ChatAI助手，有什么可以帮助你的吗？',
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSelectChat = (chatId: string) => {
    // TODO: 实现选择聊天功能
    console.log('Selected chat:', chatId);
  };

  const handleNavigation = (path: string) => {
    // TODO: 实现导航功能
    console.log('Navigate to:', path);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `我收到了你的消息："${userMessage.content}"。这是一个模拟回复，实际应用中这里会调用AI API。`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setMessages([]);
    setInputMessage('');
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-glass group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <NavBar
          title="ChatAI"
          onLogout={handleLogout}
          onNavigation={handleNavigation}
        />

        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="glass-card rounded-2xl p-4 mb-4">
              <h2 className="text-glass-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Chats
              </h2>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className="flex items-center gap-4 bg-glass px-4 min-h-[72px] py-2 cursor-pointer hover:bg-glass-card-hover transition-all duration-300 rounded-lg hover-lift"
                >
                  <div className="text-glass-primary flex items-center justify-center rounded-lg bg-glass-card shrink-0 size-12 glow">
                    <MessageCircle className="w-6 h-6 text-glass-primary" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-glass-primary text-base font-medium leading-normal line-clamp-1">
                      {chat.title}
                    </p>
                    <p className="text-glass-muted text-sm font-normal leading-normal line-clamp-2">
                      {chat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {!isChatOpen ? (
              <div className="glass-card rounded-2xl p-8 hover-lift">
                <h2 className="text-glass-primary tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
                  Welcome to ChatAI
                </h2>
                <p className="text-glass-primary text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
                  Start a new chat or select an existing one to continue the
                  conversation.
                </p>

                <div className="flex px-4 py-3 justify-center">
                  <button
                    onClick={handleStartChat}
                    className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-glass-button text-sm font-bold leading-normal tracking-[0.015em] glass-button hover-lift glow ${
                      theme === 'dark' ? 'text-white' : 'text-glass-primary'
                    }`}
                  >
                    <span className="truncate">Start Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl flex flex-col h-[600px] overflow-hidden">
                {/* 聊天窗口头部 */}
                <div className="flex items-center justify-between p-4 border-b border-glass">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-glass-button flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-glass-primary font-semibold">
                        ChatAI Assistant
                      </h3>
                      <p className="text-glass-muted text-sm">在线</p>
                    </div>
                  </div>
                  <button
                    onClick={closeChat}
                    className="text-glass-muted hover:text-glass-primary transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.sender === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-glass-button flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'bg-glass-button text-white'
                            : 'bg-glass-card text-glass-primary'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'user'
                              ? 'text-white/70'
                              : 'text-glass-muted'
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-glass-card flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-glass-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-glass-button flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-glass-card rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-glass-muted rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-glass-muted rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-glass-muted rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 输入框 */}
                <div className="p-4 border-t border-glass">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入你的消息..."
                        className="w-full bg-glass-input border border-glass-input-border rounded-xl px-4 py-3 pr-12 text-glass-primary placeholder-glass-muted resize-none focus:outline-none focus:ring-2 focus:ring-glass-button focus:border-transparent"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className={`px-4 py-3 rounded-xl transition-all duration-200 ${
                        inputMessage.trim() && !isLoading
                          ? 'bg-glass-button text-white hover:bg-glass-button-hover'
                          : 'bg-glass-input text-glass-muted cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
