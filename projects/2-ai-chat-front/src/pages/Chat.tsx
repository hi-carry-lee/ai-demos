import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { removeToken, removeUser, getUser } from '@/lib/axios';
import NavBar from '@/components/NavBar';
import { MessageCircle, Send, Bot, User, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';

interface Conversation {
  id: string;
  title: string;
  description: string;
  messages: Message[];
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'model';
  createdAt: Date;
}

const Conversation = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const { error } = useToast();

  const [chatList, setChatList] = useState<Conversation[]>([]);

  useEffect(() => {
    // 检查用户是否登录
    const currentUser = getUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser as User);
  }, [navigate]);

  // 获取conversation列表
  useEffect(() => {
    const fetchChatList = async () => {
      const response = await axios.get('/conversations');
      setChatList(response.data.conversations);
    };
    fetchChatList();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate('/login');
  };

  const handleStartChat = async () => {
    setIsChatOpen(true);
    // 添加欢迎消息
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: 'Welcome to ChatAI',
      role: 'model',
      createdAt: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const handleSelectChat = async (chatId: string) => {
    // 根据chatId，查询/conversations/:id，获取conversation
    const response = await axios.get(`/conversations/${chatId}`);
    setMessages(response.data.conversation.messages);
    setIsChatOpen(true);
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = (await axios.delete(`/conversations/${chatId}`)) as {
        success: boolean;
        message: string;
      };
      if (response.success) {
        setChatList(prev => prev.filter(chat => chat.id !== chatId));
      } else {
        error(response.message || '删除对话失败');
      }
    } catch (err) {
      error(err instanceof Error ? err.message : '删除对话失败');
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const message = inputMessage.trim();
    const title = message.split(' ').slice(0, 30).join(' ');

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      try {
        const response = await axios.post('/conversations', {
          title: title,
          model: 'gemini-2.5-flash',
          status: 'active',
          userId: user?.id,
        });
        // 因为下方的状态更新是异步的：setConversationId 是异步的，不会立即更新 conversationId 的值，所有偶尔会出现conversationId为null的情况
        currentConversationId = response.data.conversation.id;
        setConversation(response.data.conversation);
        setConversationId(response.data.conversation.id);
      } catch (err) {
        error(err instanceof Error ? err.message : '创建对话失败');
        setIsLoading(false);
        return; // 如果创建对话失败，直接返回，不继续发送消息
      }
    }

    // 立即显示用户消息
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`, // 临时ID
      content: message,
      role: 'user',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = (await axios.post('/messages', {
        conversationId: currentConversationId,
        role: 'user',
        content: message,
      })) as {
        success: boolean;
        message: string;
        data: { message: { id: string; messageId: string; message: string } };
      };

      // 用服务器返回的真实ID替换临时消息
      const realUserMessage: Message = {
        id: response.data.message.id,
        content: message,
        role: 'user',
        createdAt: new Date(),
      };

      // 替换临时消息
      setMessages(prev =>
        prev.map(msg => (msg.id === tempUserMessage.id ? realUserMessage : msg))
      );

      if (conversation) {
        conversation?.messages?.push(realUserMessage);
        setChatList(prev => [...prev, conversation]);
      }

      if (response.success) {
        const aiMessage: Message = {
          id: response.data.message.messageId,
          content: response.data.message.message,
          role: 'model',
          createdAt: new Date(),
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      } else {
        error(response.message || '发送消息失败');
        setIsLoading(false);
      }
    } catch (err) {
      // 如果发送失败，移除临时消息
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      error(err instanceof Error ? err.message : '发送消息失败');
      setIsLoading(false);
    }
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
    setConversationId('');
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
        <NavBar title="ChatAI" onLogout={handleLogout} />

        <div className="gap-6 px-6 flex flex-1 justify-center py-5">
          {/* 聊天列表 */}
          <div className="layout-content-container flex flex-col w-80">
            <div className="glass-card rounded-2xl p-4 mb-4 h-[500px] overflow-y-auto scrollbar-thin">
              <h2 className="text-glass-primary text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Chats
              </h2>
              {chatList ? (
                chatList.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="group relative flex items-center gap-4 bg-glass px-4 min-h-[72px] py-2 cursor-pointer hover:bg-glass-card-hover transition-all duration-300 rounded-lg hover-lift"
                  >
                    <div className="text-glass-primary flex items-center justify-center rounded-lg bg-glass-card shrink-0 size-12 glow">
                      <MessageCircle className="w-6 h-6 text-glass-primary" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <p className="text-glass-primary text-base font-medium leading-normal line-clamp-1 overflow-hidden">
                        {chat.title}
                      </p>
                    </div>
                    {/* Delete button - appears on hover */}
                    <button
                      onClick={e => {
                        e.stopPropagation(); // Prevent triggering the chat selection
                        handleDeleteChat(chat.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-red-500/20 text-glass-muted hover:text-red-500"
                      title="删除对话"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p>No chats</p>
              )}
            </div>
          </div>
          {/* 聊天窗口 */}
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
                    </div>
                  </div>
                  <button
                    onClick={closeChat}
                    className="text-glass-muted hover:text-glass-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      {message.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-glass-button flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-glass-button text-white'
                            : 'bg-glass-card text-glass-primary'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === 'user'
                              ? 'text-white/70'
                              : 'text-glass-muted'
                          }`}
                        >
                          {message.createdAt.toLocaleString()}
                        </p>
                      </div>
                      {message.role === 'user' && (
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
                          <div className="w-2 h-2 bg-glass-muted rounded-full animate-bo" />
                          <div
                            className="w-2 h-2 bg-glass-muted rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-glass-muted rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
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

export default Conversation;
