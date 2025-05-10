import React, { createContext, useState, useEffect } from 'react';
import { GitLabConfig, loadGitLabConfig } from '../services/gitlab';

interface GitLabContextType {
  config: GitLabConfig | null;
  setConfig: (config: GitLabConfig) => void;
}

export const GitLabContext = createContext<GitLabContextType>({
  config: null,
  setConfig: () => {},
});

export const GitLabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GitLabConfig | null>(null);

  useEffect(() => {
    loadGitLabConfig().then((savedConfig) => {
      if (savedConfig) {
        setConfig(savedConfig);
      }
    });
  }, []);

  return (
    <GitLabContext.Provider value={{ config, setConfig }}>
      {children}
    </GitLabContext.Provider>
  );
};