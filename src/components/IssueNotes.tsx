import React, { useContext, useEffect, useState } from 'react';
import { GitLabNote, fetchImageWithToken } from '../services/gitlab';
import ReactMarkdown from 'react-markdown';
import { GitLabContext } from '../contexts/GitLabContext';

interface IssueNotesProps {
  notes: GitLabNote[];
  isLoading: boolean;
}

const IssueNotes: React.FC<IssueNotesProps> = ({ notes, isLoading }) => {
  const { config } = useContext(GitLabContext);

  const components = {
    img: ({ src, ...props }: { src?: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
      const [imageUrl, setImageUrl] = useState(src);

      useEffect(() => {
        if (src && src.startsWith('/uploads/') && config?.url && config?.token) {
          const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
          const fullUrl = `${baseUrl}/api/v4/projects/${notes[0]?.project_id}/repository/files${src}/raw`;
          fetchImageWithToken(fullUrl, config.token)
            .then(url => setImageUrl(url))
            .catch(error => console.error('Failed to load image:', error));
        }
      }, [src, config?.url, config?.token, notes[0]?.project_id]);

      return <img src={imageUrl} {...props} />;
    },
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-6">
          {notes.map((note) => {
            if (note.system) return null;
            return (
            <div key={note.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start space-x-3">
                <img 
                  src={note.author.avatar_url} 
                  alt={note.author.name}
                  className="h-8 w-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{note.author.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 prose max-w-none">
                    <ReactMarkdown components={components}>{note.body}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          暂无评论
        </div>
      )}
    </div>
  );
};

export default IssueNotes;