import { invoke } from '@tauri-apps/api/tauri';

export interface GitLabConfig {
  url: string;
  token: string;
}

export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export interface GitLabMilestone {
  id: number;
  iid: number;
  title: string;
  state: string;
  due_date: string;
  start_date: string;
  web_url: string;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: GitLabUser | null;
  labels: string[];
  milestone: GitLabMilestone | null;
  assignees: GitLabUser[];
  author: GitLabUser;
  assignee: GitLabUser | null;
  web_url: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
}

export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  description: string;
  web_url: string;
  avatar_url: string | null;
  star_count: number;
  forks_count: number;
  last_activity_at: string;
}

export async function validateGitLabConfig(config: GitLabConfig): Promise<boolean> {
  try {
    const response = await fetch(`${config.url}/api/v4/user`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return !!data.id; // 如果返回了用户 ID，说明验证成功
  } catch (error) {
    console.error('GitLab config validation failed:', error);
    return false;
  }
}

export async function saveGitLabConfig(config: GitLabConfig): Promise<void> {
  await invoke('save_gitlab_config', { config });
}

export async function fetchImageWithToken(url: string, token: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function loadGitLabConfig(): Promise<GitLabConfig | null> {
  try {
    return await invoke('load_gitlab_config');
  } catch (error) {
    console.error('Failed to load GitLab config:', error);
    return null;
  }
}

export async function fetchProjects(config: GitLabConfig, search?: string): Promise<GitLabProject[]> {
  try {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    const response = await fetch(`${config.url}/api/v4/projects?membership=true${searchParam}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

export async function fetchProjectUsers(config: GitLabConfig, projectId: number): Promise<GitLabUser[]> {
  try {
    const response = await fetch(`${config.url}/api/v4/projects/${projectId}/users`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch project users:', error);
    throw error;
  }
}

export async function fetchIssues(
  config: GitLabConfig, 
  page: number = 1, 
  perPage: number = 20, 
  projectId?: number,
  assigneeId?: number,
  authorId?: number
): Promise<{ issues: GitLabIssue[], pagination: PaginationInfo }> {
  try {
    const projectPath = projectId ? `/projects/${projectId}` : '';
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    
    if (assigneeId) {
      params.append('assignee_id', assigneeId.toString());
    }
    if (authorId) {
      params.append('author_id', authorId.toString());
    }

    const response = await fetch(`${config.url}/api/v4${projectPath}/issues?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const issues = await response.json();
    const totalItems = parseInt(response.headers.get('X-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-Total-Pages') || '1');
    const currentPage = parseInt(response.headers.get('X-Page') || '1');
    const itemsPerPage = parseInt(response.headers.get('X-Per-Page') || '20');

    return {
      issues,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        perPage: itemsPerPage
      }
    };
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    throw error;
  }
}

export interface GitLabIssueDetails extends GitLabIssue {
  closed_by: GitLabUser | null;
  user_notes_count: number;
  merge_requests_count: number;
  upvotes: number;
  downvotes: number;
  due_date: string | null;
  confidential: boolean;
  discussion_locked: boolean | null;
  issue_type: string;
  time_stats: {
    time_estimate: number;
    total_time_spent: number;
    human_time_estimate: string | null;
    human_total_time_spent: string | null;
  };
  task_completion_status: {
    count: number;
    completed_count: number;
  };
  blocking_issues_count: number;
  has_tasks: boolean;
  task_status: string;
  _links: {
    self: string;
    notes: string;
    award_emoji: string;
    project: string;
    closed_as_duplicate_of: string | null;
  };
  references: {
    short: string;
    relative: string;
    full: string;
  };
  severity: string;
  subscribed: boolean;
  moved_to_id: number | null;
  service_desk_reply_to: string | null;
  epic_iid: number | null;
  epic: any | null;
  iteration: any | null;
  health_status: string | null;
}

export async function fetchIssueDetails(config: GitLabConfig, projectId: number, issueIid: number): Promise<GitLabIssueDetails> {
  const url = `${config.url}/api/v4/projects/${projectId}/issues/${issueIid}`;
  
  const response = await fetch(url, {
    headers: {
      'Private-Token': config.token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch issue details: ${response.statusText}`);
  }

  return await response.json();
}


export interface GitLabNote {
  id: number;
  type: string | null;
  body: string;
  attachment: any | null;
  author: {
    id: number;
    username: string;
    name: string;
    state: string;
    locked: boolean;
    avatar_url: string;
    web_url: string;
  };
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
  project_id: number;
  resolvable: boolean;
  confidential: boolean;
  internal: boolean;
  imported: boolean;
  imported_from: string;
  noteable_iid: number;
  commands_changes: Record<string, any>;
}

export async function fetchIssueNotes(config: GitLabConfig, projectId: number, issueIid: number): Promise<any[]> {
  try {
    const response = await fetch(`${config.url}/api/v4/projects/${projectId}/issues/${issueIid}/notes?sort=asc`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch issue notes:', error);
    throw error;
  }
}