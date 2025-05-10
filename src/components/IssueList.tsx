import { GitLabIssue, PaginationInfo } from '../services/gitlab';

interface IssueListProps {
  issues: GitLabIssue[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onIssueSelect: (issue: GitLabIssue) => void;
}

export default function IssueList({ issues, pagination, onPageChange, onIssueSelect }: IssueListProps) {
  const { currentPage, totalPages } = pagination;

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 上一页按钮
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">上一页</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // 下一页按钮
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">下一页</span>
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    );

    return pages;
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 text-indigo-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Issues
        </h3>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
          共 {pagination.totalItems || issues.length} 个
        </span>
      </div>
      
      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center flex-grow">
          <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">暂无 Issues</p>
          <p className="text-gray-400 text-sm mt-2">当前没有可显示的 Issues</p>
        </div>
      ) : (
        <div className="overflow-auto flex-grow">
          <ul className="divide-y divide-gray-100">
            {issues.map((issue) => (
              <li key={issue.id} className="hover:bg-gray-50 transition-colors duration-200">
                <div className="px-6 py-5">
                  {/* 卡片头部：标题、状态和编号 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                      <span className="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-1 rounded-md">#{issue.iid}</span>
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        issue.state === 'opened' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.state === 'opened' ? '进行中' : '已关闭'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <svg className="h-3.5 w-3.5 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      更新于 {new Date(issue.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* 卡片主体：标题和内容 */}
                  <div className="mb-4">
                    <h4 
                      className="text-base font-medium text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors duration-200 cursor-pointer"
                      onClick={() => onIssueSelect(issue)}
                    >
                      {issue.title}
                    </h4>
                    
                    {/* 标签区域 */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {issue.labels.map((label) => {
                        // 根据标签类型设置不同的颜色
                        let bgColor = 'bg-gray-100 text-gray-800';
                        if (label.includes('bug')) {
                          bgColor = 'bg-red-100 text-red-800';
                        } else if (label.includes('feature')) {
                          bgColor = 'bg-blue-100 text-blue-800';
                        } else if (label.includes('enhancement')) {
                          bgColor = 'bg-green-100 text-green-800';
                        } else if (label.includes('priority')) {
                          bgColor = 'bg-yellow-100 text-yellow-800';
                        }

                        return (
                          <span
                            key={label}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${bgColor}`}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 卡片底部：作者、指派人和操作 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <img
                          className="h-8 w-8 rounded-full border border-gray-200 shadow-sm object-cover"
                          src={issue.author.avatar_url}
                          alt={issue.author.name}
                        />
                        <div className="text-sm text-gray-600">{issue.author.name}</div>
                      </div>
                      
                      {issue.milestone && (
                        <div className="hidden sm:flex items-center text-xs text-gray-500">
                          <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{issue.milestone.title}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {issue.assignees.length > 0 && (
                        <div className="flex -space-x-2 overflow-hidden">
                          {issue.assignees.map((assignee) => (
                            <img
                              key={assignee.id}
                              className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                              src={assignee.avatar_url}
                              alt={assignee.name}
                              title={assignee.name}
                            />
                          ))}
                        </div>
                      )}
                      
                      <a
                        href={issue.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        查看详情
                        <svg className="ml-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 flex-shrink-0">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {renderPagination()}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}