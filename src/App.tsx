import React, { useState, useEffect, useContext } from 'react';
import Settings from './components/Settings';
import IssueList from './components/IssueList';
import ProjectSelect from './components/ProjectSelect';
import UserSelect from './components/UserSelect';
import { GitLabConfig, GitLabIssue, PaginationInfo, fetchIssues, fetchIssueDetails, fetchIssueNotes, GitLabNote } from './services/gitlab';
import { invoke } from '@tauri-apps/api/tauri';
import IssueDetail from './components/IssueDetail';
import { GitLabContext, GitLabProvider } from './contexts/GitLabContext';

function AppContent() {
  const { config, setConfig } = useContext(GitLabContext);
  const [issues, setIssues] = useState<GitLabIssue[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 20
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const [assigneeId, setAssigneeId] = useState<number | undefined>();
  const [authorId, setAuthorId] = useState<number | undefined>();
  const [selectedIssue, setSelectedIssue] = useState<GitLabIssue | null>(null);
  const [issueDetails, setIssueDetails] = useState<any | null>(null);
  const [isIssueDetailLoading, setIsIssueDetailLoading] = useState(false);
  const [issueNotes, setIssueNotes] = useState<GitLabNote[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await invoke<GitLabConfig>('get_gitlab_config');
        if (savedConfig) {
          setConfig(savedConfig);
        }
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const loadIssues = async (page: number = 1) => {
    if (!config || !selectedProjectId) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchIssues(config, page, 20, selectedProjectId, assigneeId, authorId);
      setIssues(result.issues);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load issues:', error);
      setError('加载问题列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssues(1);
  }, [config, selectedProjectId, assigneeId, authorId]);

  const handlePageChange = (page: number) => {
    loadIssues(page);
  };

  const handleIssueSelect = async (issue: GitLabIssue) => {
    if (!config) return;
    
    setSelectedIssue(issue);
    setIsIssueDetailLoading(true);
    setIsNotesLoading(true);
    
    try {
      const [details, notes] = await Promise.all([
        fetchIssueDetails(config, issue.project_id, issue.iid),
        fetchIssueNotes(config, issue.project_id, issue.iid)  // This is line 81
      ]);
      setIssueDetails(details);
      setIssueNotes(notes);
    } catch (error) {
      console.error('Failed to load issue details:', error);
    } finally {
      setIsIssueDetailLoading(false);
      setIsNotesLoading(false);
    }
  };

  const handleCloseIssueDetails = () => {
    setSelectedIssue(null);
    setIssueDetails(null);
  };

  if (isLoading && !config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!config) {
    return <Settings onConfigSave={setConfig} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col h-screen">
      <div className="flex-grow flex flex-col h-full">
        <div className="flex-grow flex flex-col h-full">
          <div className="flex flex-col flex-grow h-full">
            <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择项目</label>
                  <ProjectSelect
                    config={config}
                    onProjectChange={setSelectedProjectId}
                    isOpen={openDropdown === 'project'}
                    onDropdownToggle={() => handleDropdownToggle('project')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">指派给</label>
                  <UserSelect
                    config={config}
                    projectId={selectedProjectId}
                    onUserChange={setAssigneeId}
                    placeholder="选择指派者"
                    type="assignee"
                    isOpen={openDropdown === 'assignee'}
                    onDropdownToggle={() => handleDropdownToggle('assignee')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">创建者</label>
                  <UserSelect
                    config={config}
                    projectId={selectedProjectId}
                    onUserChange={setAuthorId}
                    placeholder="选择创建者"
                    type="author"
                    isOpen={openDropdown === 'author'}
                    onDropdownToggle={() => handleDropdownToggle('author')}
                  />
                </div>
              </div>
            </div>

            <div className="flex-grow flex bg-gray-50 relative">
              {isLoading ? (
                <div className="flex justify-center items-center w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 w-full">{error}</div>
              ) : (
                <div className="w-full flex-grow">
                  <IssueList 
                    issues={issues} 
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onIssueSelect={handleIssueSelect}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          issueDetails={issueDetails}
          issueNotes={issueNotes}
          isIssueDetailLoading={isIssueDetailLoading}
          isNotesLoading={isNotesLoading}
          onClose={handleCloseIssueDetails}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <GitLabProvider>
      <AppContent />
    </GitLabProvider>
  );
}

export default App;


