import { useState, useEffect, useRef } from 'react';
import { GitLabProject, GitLabConfig } from '../services/gitlab';
import { fetchProjects } from '../services/gitlab';

interface ProjectSelectProps {
  config: GitLabConfig;
  onProjectChange: (projectId?: number) => void;
  selectedProjectId?: number;
  onProjectSelect?: (project: GitLabProject | null) => void;
  isOpen?: boolean;
  onDropdownToggle?: () => void;
}

export default function ProjectSelect({ 
  config, 
  onProjectChange,
  // Removed unused selectedProjectId
  onProjectSelect,
  isOpen: propIsOpen,
  onDropdownToggle 
}: ProjectSelectProps) {
  const [projects, setProjects] = useState<GitLabProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<GitLabProject | null>(null);
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

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const fetchedProjects = await fetchProjects(config, searchTerm);
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      loadProjects();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [config, searchTerm]);

  const handleProjectSelect = (project: GitLabProject | null) => {
    setSelectedProject(project);
    onProjectChange(project?.id);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
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
    <div className="relative font-sans" ref={selectRef}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={toggleDropdown}
          className="inline-flex items-center px-4 py-2.5 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[220px] justify-between transition-all duration-200"
        >
          <div className="flex items-center space-x-2 truncate">
            {selectedProject?.avatar_url && (
              <img
                src={selectedProject.avatar_url}
                alt={selectedProject.name}
                className="h-5 w-5 rounded-full object-cover shadow-sm"
              />
            )}
            <span className="truncate font-medium">
              {selectedProject ? selectedProject.name_with_namespace : '所有项目'}
            </span>
          </div>
          <svg className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {effectiveIsOpen && (
        <div className="absolute z-10 mt-2 w-96 bg-white shadow-xl max-h-96 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-100">
          <div className="sticky top-0 bg-white border-b border-gray-100 z-20 shadow-sm">
            <div className="relative px-4 py-3">
              <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                placeholder="搜索项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[calc(24rem-4rem)]">
            <div className="py-2">
              <button
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                  !selectedProject ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                onClick={() => handleProjectSelect(null)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">所有项目</span>
                </div>
              </button>
              
              {isLoading ? (
                <div className="px-4 py-6 text-sm text-gray-500 flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>加载中...</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">
                  <svg className="mx-auto h-10 w-10 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>没有找到项目</p>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                      selectedProject?.id === project.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-center">
                      {project.avatar_url ? (
                        <img
                          src={project.avatar_url}
                          alt={project.name}
                          className="h-8 w-8 rounded-full mr-3 object-cover border border-gray-100 shadow-sm"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-100 mr-3 flex items-center justify-center shadow-sm border border-gray-200">
                          <span className="text-sm font-medium text-gray-500">
                            {project.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{project.name}</div>
                        <div className="text-xs text-gray-500 truncate">{project.path_with_namespace}</div>
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