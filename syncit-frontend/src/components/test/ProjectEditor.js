/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import NavBar from "../NavBar/NavBar";
import SockJS from 'sockjs-client';
import { Stomp } from "@stomp/stompjs";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder as FolderIcon, 
  Plus, 
  Trash2,
  Sidebar,
  Terminal as TerminalIcon,
  X,
  ChevronUp
} from 'react-feather';

import pythonIcon from '../../assets/python-icon.svg';
import cPlusIcon from '../../assets/cpp.svg';
import javaScriptIcon from '../../assets/js.svg';
import htmlIcon from '../../assets/html.svg';
import javaIcon from '../../assets/java.svg';
import cssIcon from '../../assets/css.svg';
import jsonIcon from '../../assets/json.svg';
import txtIcon from '../../assets/txt2.svg';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const extensionToLanguageMap = {
  '.js': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.txt': 'plaintext',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.ts': 'typescript',
  '.jsx': 'javascript',
  '.tsx': 'typescript',
  '.php': 'php',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.r': 'r',
  '.m': 'objective-c',
  '.pl': 'perl',
  '.lua': 'lua'
};

const extensionToIconMap = {
  '.js': javaScriptIcon,
  '.jsx': javaScriptIcon,
  '.ts': javaScriptIcon,
  '.tsx': javaScriptIcon,
  '.py': pythonIcon,
  '.java': javaIcon,
  '.cpp': cPlusIcon,
  '.c': cPlusIcon,
  '.cc': cPlusIcon,
  '.cxx': cPlusIcon,
  '.html': htmlIcon,
  '.htm': htmlIcon,
  '.css': cssIcon,
  '.json': jsonIcon,
  '.md': txtIcon,
  '.markdown': txtIcon,
  '.txt': txtIcon,
  'default': txtIcon,
};

const getFileExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? '' : filename.slice(lastDot).toLowerCase();
};

const ResizeHandle = ({ onMouseDown, orientation = 'vertical' }) => (
  <div
    className={`
      ${orientation === 'vertical' ? 'w-1 cursor-col-resize hover:bg-blue-500' : 'h-1 cursor-row-resize hover:bg-blue-500'}
      bg-gray-600 hover:bg-blue-400 transition-colors duration-200 flex-shrink-0
    `}
    onMouseDown={onMouseDown}
  />
);

const FileTree = ({
  structure,
  onFileClick,
  onAddFile,
  onAddFolder,
  onDeleteFile,
  onDeleteFolder,
  isOpen,
  onToggle,
  width
}) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (path) =>
    setExpanded(e => ({ ...e, [path]: !e[path] }));

  const renderNode = (node, basePath = '') =>
    Object.entries(node).map(([name, child]) => {
      const path = `${basePath}${name}`;
      const ext = getFileExtension(name);
      const icon = extensionToIconMap[ext] || extensionToIconMap.default;

      if (typeof child === 'object') {
        const isExpanded = expanded[path];
        return (
          <div key={path} className="ml-2">
            <div className="flex items-center space-x-1 py-1 px-2 hover:bg-gray-700 rounded group">
              <span
                className="cursor-pointer hover:text-blue-400 flex items-center flex-1"
                onClick={() => toggle(path)}
              >
                {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                <FolderIcon size={16} className="mr-2 text-yellow-400"/>
                <span className="text-sm">{name}</span>
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                <button 
                  onClick={() => onAddFile(path)} 
                  className="text-green-400 hover:text-green-200 p-1"
                  title="Add File"
                >
                  <Plus size={12}/>
                </button>
                <button 
                  onClick={() => onAddFolder(path)} 
                  className="text-blue-400 hover:text-blue-200 p-1"
                  title="Add Folder"
                >
                  <FolderIcon size={12}/>
                </button>
                <button 
                  onClick={() => onDeleteFolder(path)} 
                  className="text-red-400 hover:text-red-200 p-1"
                  title="Delete Folder"
                >
                  <Trash2 size={12}/>
                </button>
              </div>
            </div>
            {isExpanded && <div className="ml-4">{renderNode(child, `${path}/`)}</div>}
          </div>
        );
      } else {
        return (
          <div key={path} className="flex items-center ml-6 py-1 px-2 hover:bg-gray-700 rounded group">
            <img src={icon} alt="" className="mr-2 flex-shrink-0" width="16" height="16"/>
            <span
              className="cursor-pointer hover:text-blue-400 flex-1 text-sm truncate"
              onClick={() => onFileClick(path, child)}
              title={name}
            >
              {name}
            </span>
            <button 
              onClick={() => onDeleteFile(path)} 
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-200 p-1"
              title="Delete File"
            >
              <Trash2 size={12}/>
            </button>
          </div>
        );
      }
    });

  if (!isOpen) return null;

  return (
    <div 
      className="bg-gray-800 border-r border-gray-600 h-full overflow-hidden flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="bg-gray-750 border-b border-gray-600 p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">EXPLORER</span>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-1"
          title="Close Explorer"
        >
          <X size={16}/>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {Object.keys(structure).length > 0 ? (
          renderNode(structure)
        ) : (
          <div className="text-gray-500 text-sm p-4 text-center">
            No files in this project
          </div>
        )}
      </div>
    </div>
  );
};

const Terminal = ({ 
  projectId, 
  selectedFileId, 
  filePath, 
  isOpen, 
  onToggle, 
  height 
}) => {
  const [history, setHistory] = useState('Welcome to SyncIT Terminal\nType commands starting with "sync" or "clear" to clear the terminal.\n');
  const [cmd, setCmd] = useState('');
  const terminalRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (cmd.trim() === 'clear' || cmd.trim() === 'cls') {
      setHistory('');
      setCmd('');
      return;
    }
    if (!cmd.trim().startsWith('sync')) {
      setHistory(h => h + `\n$ ${cmd}\nERROR: Commands should start with "sync"`);
      setCmd('');
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/terminal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtKey')
        },
        body: JSON.stringify({
          command: cmd,
          projectId: Number(projectId),
          fileId: selectedFileId,
          extension: getFileExtension(filePath || '')
        })
      });
      const text = res.ok ? await res.text() : `Error: ${res.status} ${res.statusText}`;
      setHistory(h => `${h}\n$ ${cmd}\n${text}`);
    } catch (err) {
      setHistory(h => `${h}\n$ ${cmd}\nError: ${err.message}`);
    }
    setCmd('');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  if (!isOpen) return null;

  return (
    <div 
      className="bg-gray-900 border-t border-gray-600 flex flex-col"
      style={{ height: `${height}px` }}
    >
      <div className="bg-gray-750 border-b border-gray-600 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={16} className="text-green-400"/>
          <span className="text-sm font-medium text-gray-300">TERMINAL</span>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-1"
          title="Close Terminal"
        >
          <ChevronDown size={16}/>
        </button>
      </div>
      <div 
        ref={terminalRef}
        className="flex-1 overflow-auto p-3 font-mono text-sm text-green-400 bg-gray-900"
      >
        <pre className="whitespace-pre-wrap">{history}</pre>
      </div>
      <form onSubmit={onSubmit} className="flex items-center p-3 bg-gray-800 border-t border-gray-700">
        <span className="text-green-400 mr-2 font-mono">$</span>
        <input
          type="text"
          value={cmd}
          onChange={e => setCmd(e.target.value)}
          className="flex-1 bg-transparent text-green-400 font-mono outline-none"
          placeholder="Enter command..."
        />
      </form>
    </div>
  );
};

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projectStructure, setProjectStructure] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [canEdit, setCanEdit] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const [isFileTreeOpen, setIsFileTreeOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [fileTreeWidth, setFileTreeWidth] = useState(300);
  const [terminalHeight, setTerminalHeight] = useState(200);

  const editorRef = useRef(null);
  const lastSentValueRef = useRef('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState('file');
  const [modalParentPath, setModalParentPath] = useState('');
  const [modalInputValue, setModalInputValue] = useState('');

  const [isResizing, setIsResizing] = useState({ fileTree: false, terminal: false });

  const startFileTreeResize = (e) => {
    e.preventDefault();
    setIsResizing({ ...isResizing, fileTree: true });
  };

  const startTerminalResize = (e) => {
    e.preventDefault();
    setIsResizing({ ...isResizing, terminal: true });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing.fileTree) {
        const newWidth = Math.max(200, Math.min(600, e.clientX));
        setFileTreeWidth(newWidth);
      }
      if (isResizing.terminal) {
        const rect = document.documentElement.getBoundingClientRect();
        const newHeight = Math.max(100, Math.min(500, rect.height - e.clientY));
        setTerminalHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing({ fileTree: false, terminal: false });
    };

    if (isResizing.fileTree || isResizing.terminal) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizing.fileTree ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const fetchProjectStructure = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/project/${id}`, {
        headers: { 'Authorization': localStorage.getItem('jwtKey') }
      });
      if (res.ok) {
        setProjectStructure(await res.json());
      } else {
        console.error('Failed to fetch project structure');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkEditPermission = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/canedit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtKey')
        },
        body: JSON.stringify({ projectId: Number(id) })
      });
      return res.status === 200;
    } catch {
      return false;
    }
  };

  const openAddModal = (type, parentPath) => {
    setAddModalType(type);
    setModalParentPath(parentPath);
    setModalInputValue('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setModalInputValue('');
  };

  const handleCreateModal = async () => {
    const name = modalInputValue.trim();
    if (!name) return;

    if (addModalType === 'file') {
      const filePath = modalParentPath ? `${modalParentPath}/${name}` : name;
      try {
        const res = await fetch(`${backendUrl}/api/project/addFile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwtKey')
          },
          body: JSON.stringify({ projectId: Number(id), filePath })
        });
        if (res.ok) await fetchProjectStructure();
        else console.error('Failed to add file');
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const res = await fetch(`${backendUrl}/api/project/addFolder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('jwtKey')
          },
          body: JSON.stringify({
            projectId: Number(id),
            folderPath: modalParentPath,
            folderName: name
          })
        });
        if (res.ok) await fetchProjectStructure();
        else console.error('Failed to add folder');
      } catch (e) {
        console.error(e);
      }
    }
    closeAddModal();
  };

  const handleDeleteFile = async (filePath) => {
    if (!window.confirm('Delete this file?')) return;
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const folder = parts.join('/');
    try {
      const res = await fetch(`${backendUrl}/api/project/deleteFile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtKey')
        },
        body: JSON.stringify({
          projectId: Number(id),
          folderPath: folder,
          fileName
        })
      });
      if (res.ok) {
        await fetchProjectStructure();
        if (selectedFile?.path === filePath) {
          setSelectedFile(null);
          setFileContent('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (folderPath) => {
    if (!window.confirm('Delete this folder and all its contents?')) return;
    const parts = folderPath.split('/');
    const folderName = parts.pop();
    const parent = parts.join('/');
    try {
      const res = await fetch(`${backendUrl}/api/project/deleteFolder`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('jwtKey')
        },
        body: JSON.stringify({
          projectId: Number(id),
          folderPath: parent,
          folderName
        })
      });
      if (res.ok) {
        await fetchProjectStructure();
        if (selectedFile?.path.startsWith(folderPath)) {
          setSelectedFile(null);
          setFileContent('');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const webSocketConnection = (fileId) => {
    const sock = new SockJS(`${backendUrl}/ws`);
    const client = Stomp.over(sock);

    client.connect(
      { 'Authorization': localStorage.getItem('jwtKey') },
      () => {
        client.subscribe(`/topic/file/${fileId}`, msg => {
          const body = msg.body;
          if (body === 'LOCKED') return;
          if (body === lastSentValueRef.current) {
            lastSentValueRef.current = '';
            return;
          }
          setFileContent(body);
        });
        setStompClient(client);
        client.send(`/app/file/${fileId}/open`, {}, '');
      },
      err => console.error('STOMP error:', err)
    );

    return () => {
      if (client.connected) {
        client.send(`/app/file/${fileId}/close`, {}, '');
        client.disconnect();
      }
    };
  };

  const handleFileClick = async (path, fileId) => {
    if (stompClient) stompClient.disconnect();
    setSelectedFile({ path, id: fileId });

    const ext = getFileExtension(path);
    const detectedLanguage = extensionToLanguageMap[ext] || 'plaintext';
    setLanguage(detectedLanguage);

    const can = await checkEditPermission();
    setCanEdit(can);

    webSocketConnection(fileId);
  };

  const handleEditorChange = (value) => {
    setFileContent(value);
    if (stompClient?.connected && selectedFile) {
      lastSentValueRef.current = value;
      stompClient.send(
        `/app/file/${selectedFile.id}/edit`,
        {},
        value
      );
    }
  };

  useEffect(() => {
    fetchProjectStructure();
    return () => { if (stompClient) stompClient.disconnect(); };
  }, [id]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <NavBar
        title="SyncIT"
        signedin={true}
        setsignedin={() => {
          localStorage.removeItem('jwtKey');
          navigate('/');
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Panel */}
        <FileTree
          structure={projectStructure}
          onFileClick={handleFileClick}
          onAddFile={path => openAddModal('file', path)}
          onAddFolder={path => openAddModal('folder', path)}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
          isOpen={isFileTreeOpen}
          onToggle={() => setIsFileTreeOpen(false)}
          width={fileTreeWidth}
        />

        {/* File Tree Resize Handle */}
        {isFileTreeOpen && (
          <ResizeHandle onMouseDown={startFileTreeResize} orientation="vertical" />
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-gray-800 border-b border-gray-600 p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {!isFileTreeOpen && (
                <button
                  onClick={() => setIsFileTreeOpen(true)}
                  className="text-gray-400 hover:text-white p-1"
                  title="Open Explorer"
                >
                  <Sidebar size={18}/>
                </button>
              )}
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="markdown">Markdown</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="plaintext">Plain Text</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {selectedFile
                  ? `${selectedFile.path} ${!canEdit ? '(Read Only)' : ''}`
                  : 'No file selected'}
              </span>
              {!isTerminalOpen && (
                <button
                  onClick={() => setIsTerminalOpen(true)}
                  className="text-gray-400 hover:text-white p-1"
                  title="Open Terminal"
                >
                  <TerminalIcon size={16}/>
                </button>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={fileContent}
              theme="vs-dark"
              onChange={canEdit ? handleEditorChange : undefined}
              onMount={editor => { editorRef.current = editor; }}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                readOnly: !canEdit,
                domReadOnly: !canEdit,
                cursorStyle: canEdit ? 'line' : 'block',
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 4,
                insertSpaces: true,
              }}
            />
          </div>

          {/* Terminal Resize Handle */}
          {isTerminalOpen && (
            <ResizeHandle onMouseDown={startTerminalResize} orientation="horizontal" />
          )}

          {/* Terminal Panel */}
          <Terminal
            projectId={id}
            selectedFileId={selectedFile?.id}
            filePath={selectedFile?.path}
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(false)}
            height={terminalHeight}
          />
        </div>
      </div>

      {/* Add File/Folder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-96">
            <div className="p-4 border-b border-gray-600">
              <h2 className="text-lg font-semibold text-white">
                {addModalType === 'file' ? 'Create New File' : 'Create New Folder'}
              </h2>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={modalInputValue}
                onChange={e => setModalInputValue(e.target.value)}
                placeholder={
                  addModalType === 'file'
                    ? 'Enter file name (e.g., index.js)'
                    : 'Enter folder name'
                }
                className="w-full p-3 bg-gray-700 text-white rounded border border-gray-600 outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="p-4 border-t border-gray-600 flex justify-end space-x-3">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEditor;