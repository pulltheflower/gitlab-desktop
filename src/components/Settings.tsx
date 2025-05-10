import React, { useState, useEffect } from 'react';
import { validateGitLabConfig, saveGitLabConfig, loadGitLabConfig, GitLabConfig } from '../services/gitlab';

interface SettingsProps {
  onConfigSave: (config: GitLabConfig) => void;
}

export default function Settings({ onConfigSave }: SettingsProps) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // 加载保存的配置
    loadGitLabConfig().then((config) => {
      if (config) {
        setUrl(config.url);
        setToken(config.token);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError(null);
    setSuccess(null);

    try {
      const config: GitLabConfig = { url, token };
      const isValid = await validateGitLabConfig(config);

      if (isValid) {
        await saveGitLabConfig(config);
        onConfigSave(config);
        setSuccess('配置已保存并验证成功！');
      } else {
        setError('无效的 GitLab URL 或 Token');
      }
    } catch (err) {
      setError('验证过程中发生错误');
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">GitLab 配置</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                      GitLab URL
                    </label>
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="https://gitlab.example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                      Access Token
                    </label>
                    <input
                      type="password"
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}
                  {success && (
                    <div className="text-green-600 text-sm">{success}</div>
                  )}
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? '验证中...' : '保存配置'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 