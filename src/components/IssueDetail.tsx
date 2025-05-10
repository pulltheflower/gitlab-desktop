import React, { useContext, useEffect, useState } from 'react';
import { GitLabIssue, GitLabNote, fetchImageWithToken } from '../services/gitlab';
import IssueNotes from './IssueNotes';
import ReactMarkdown from 'react-markdown';
import { GitLabContext } from '../contexts/GitLabContext';

interface IssueDetailProps {
  issue: GitLabIssue;
  issueDetails: any;
  issueNotes: GitLabNote[];
  isIssueDetailLoading: boolean;
  isNotesLoading: boolean;
  onClose: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({
  issue,
  issueDetails,
  issueNotes,
  isIssueDetailLoading,
  isNotesLoading,
  onClose
}) => {
  const { config } = useContext(GitLabContext);
  const handleBackdropClick = (e: React.MouseEvent) => {
    // 确保点击的是背景层而不是内容区域
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-end transition-opacity"
      onClick={handleBackdropClick}  // 添加点击事件处理器
    >
      <div className="w-2/3 bg-white h-full shadow-2xl overflow-auto">
        {/* 头部导航栏 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Issue #{issue.iid}</h2>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              issue.state === 'opened' 
                ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' 
                : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
            }`}>
              {issue.state === 'opened' ? '开启' : '已关闭'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 break-words">{issue.title}</h1>
          
          {isIssueDetailLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : issueDetails ? (
            <div className="space-y-6">
              {/* 作者信息卡片 */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={issueDetails.author.avatar_url} 
                      alt={issueDetails.author.name}
                      className="h-10 w-10 rounded-full ring-2 ring-white"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{issueDetails.author.name}</div>
                      <div className="text-sm text-gray-500">创建于 {new Date(issueDetails.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {issueDetails.closed_at && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      关闭于 {new Date(issueDetails.closed_at).toLocaleString()}
                      {issueDetails.closed_by && (
                        <span className="ml-1">由 {issueDetails.closed_by.name}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Issue 引用 */}
              <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="text-sm text-gray-600">
                  <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200 text-gray-700">
                    {issueDetails.references.full}
                  </span>
                </div>
              </div>

              {/* 任务进度 */}
              {issueDetails.task_completion_status.count > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">任务完成状态</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                        style={{
                          width: `${(issueDetails.task_completion_status.completed_count / issueDetails.task_completion_status.count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {issueDetails.task_completion_status.completed_count}/{issueDetails.task_completion_status.count}
                    </span>
                  </div>
                </div>
              )}

              {/* 指派人 */}
              {issueDetails.assignees.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">指派给</h3>
                  <div className="flex flex-wrap gap-2">
                    {issueDetails.assignees.map((assignee: { id: number; avatar_url: string; name: string }) => (
                      <div key={assignee.id} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                        <img src={assignee.avatar_url} alt={assignee.name} className="h-6 w-6 rounded-full" />
                        <span className="text-sm text-gray-700">{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 描述内容 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">描述</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      </svg>
                      {issueDetails.user_notes_count} 条评论
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                      {issueDetails.upvotes} 赞同
                    </span>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <ReactMarkdown components={{
                      img: ({ src, ...props }) => {
                        const [imageUrl, setImageUrl] = useState(src);

                        useEffect(() => {
                          if (src && src.startsWith('/uploads/') && config?.url && config?.token) {
                            const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
                            const fullUrl = `${baseUrl}/-/project/${issueDetails.project_id}${src}`;
                            fetchImageWithToken(fullUrl, config.token)
                              .then(url => setImageUrl(url))
                              .catch(error => console.error('Failed to load image:', error));
                          }
                        }, [src, config?.url, config?.token, issueDetails.project_id]);

                        return <img src={imageUrl} {...props} />;
                    }
                  }}>{issueDetails.description}</ReactMarkdown>
                </div>
              </div>

              {/* 评论列表 */}
              <IssueNotes notes={issueNotes} isLoading={isNotesLoading} />
              
              {/* 标签 */}
              {issueDetails.labels.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {issueDetails.labels.map((label: string) => (
                      <span 
                        key={label}
                        className="px-3 py-1 text-sm rounded-full bg-white text-gray-700 shadow-sm border border-gray-100"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 时间追踪 */}
              {(issueDetails.time_stats.time_estimate > 0 || issueDetails.time_stats.total_time_spent > 0) && (
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">时间追踪</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500">预估时间</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {issueDetails.time_stats.human_time_estimate || '无'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="text-sm text-gray-500">已花费时间</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">
                        {issueDetails.time_stats.human_total_time_spent || '无'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 底部操作栏 */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <a
                  href={issueDetails.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  在 GitLab 中查看
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">无法加载 Issue 详情</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;