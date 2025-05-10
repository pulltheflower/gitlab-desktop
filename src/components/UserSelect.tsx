import React, { useState, useEffect, useRef } from 'react';
import { GitLabUser, GitLabConfig } from '../services/gitlab';
import { fetchProjectUsers } from '../services/gitlab';

interface UserSelectProps {
  config: GitLabConfig;
  projectId?: number;
  onUserChange: (userId?: number) => void;
  placeholder?: string;
  type: 'assignee' | 'author';
  isOpen?: boolean;
  onDropdownToggle?: () => void;
}

export default function UserSelect({
  config,
  projectId,
  onUserChange,
  placeholder = '选择用户',
  type,
  isOpen: propIsOpen,
  onDropdownToggle
}: UserSelectProps) {
  const [users, setUsers] = useState<GitLabUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GitLabUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const effectiveIsOpen = propIsOpen !== undefined ? propIsOpen : isOpen;

  // 添加点击外部区域的事件监听
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        if (onDropdownToggle) {
          onDropdownToggle();
        } else {
          setIsOpen(false);
        }
      }
    };

    if (effectiveIsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return undefined;
  }, [onDropdownToggle, effectiveIsOpen]);

  // 添加 filteredUsers 的定义
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadUsers = async () => {
      if (!projectId) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedUsers = await fetchProjectUsers(config, projectId);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [config, projectId]);

  const handleUserSelect = (user: GitLabUser | null) => {
    setSelectedUser(user);
    onUserChange(user?.id);
    if (!onDropdownToggle) {
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (onDropdownToggle) {
      onDropdownToggle();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={selectRef}>
      <div 
        className="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[220px] justify-between transition-all duration-200"
        onClick={toggleDropdown}
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedUser?.avatar_url && (
            <img
              src={selectedUser.avatar_url}
              alt={selectedUser.name}
              className="h-5 w-5 rounded-full"
            />
          )}
          <span className="truncate">
            {selectedUser ? selectedUser.name : placeholder}
          </span>
        </div>
        <svg className="h-5 w-5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {effectiveIsOpen && (
        <div className="absolute z-10 mt-1 w-80 bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white border-b border-gray-200">
            <div className="relative px-4 py-2">
              <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="搜索用户..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(24rem-4rem)]">
            <div className="py-1">
              <button
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                  !selectedUser ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                }`}
                onClick={() => handleUserSelect(null)}
              >
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  <span>所有用户</span>
                </div>
              </button>
              
              {isLoading ? (
                <div className="px-4 py-2 text-sm text-gray-500 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  加载中...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500 text-center">没有找到用户</div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      selectedUser?.id === user.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-6 w-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500">@{user.username}</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}