import Editor from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";
import { useState, useMemo, useRef } from "react";
import { useEffect } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [editorReady, setEditorReady] = useState(false);
  const initialCode = `function App() {
  return <h1>Hello World</h1>;
}

export default App;`;

  const editorRef = useRef(null);

  const [draftUsername, setDraftUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [joinedUsername, setJoinedUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [joinError, setJoinError] = useState("");

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco-demo"), [ydoc]);

  useEffect(() => {
    if (!editorReady || yText.length > 0) return;
    yText.insert(0, initialCode);
  }, [editorReady, initialCode, yText]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    setEditorReady(true);
  };

  const handleJoin = (e) => {
    e.preventDefault();

    const trimmedUsername = draftUsername.trim();

    if (!trimmedUsername) {
      setJoinError("Please enter a username to continue.");
      return;
    }

    setJoinError("");
    setJoinedUsername(trimmedUsername);
    setUsers((prevUsers) => {
      const existingUser = prevUsers.find(
        (user) => user?.name === trimmedUsername,
      );
      if (existingUser) {
        return prevUsers;
      }
      return [...prevUsers, { name: trimmedUsername, color: "blue" }];
    });
    window.history.replaceState(
      null,
      "",
      `?username=${encodeURIComponent(trimmedUsername)}`,
    );
  };

  useEffect(() => {
    if (!joinedUsername || !editorReady || !editorRef.current) return;

    const provider = new SocketIOProvider("/", "monaco-demo", ydoc, {
      autoConnect: true,
    });

    provider.awareness.setLocalStateField("user", {
      name: joinedUsername,
      color: "blue",
    });

    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(states.map((state) => state.user).filter(Boolean));
    });

    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    );

    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      monacoBinding.destroy();
      provider.destroy?.();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [joinedUsername, editorReady, ydoc, yText]);

  if (!joinedUsername) {
    return (
      <main className="flex items-center justify-center h-screen bg-gray-900">
        <form
          className="bg-gray-800 p-8 rounded-lg shadow-md"
          onSubmit={handleJoin}
        >
          <h1 className="text-2xl font-bold mb-4 text-white">
            Enter your username
          </h1>
          <input
            type="text"
            name="username"
            value={draftUsername}
            onChange={(e) => {
              setDraftUsername(e.target.value);
              if (joinError) setJoinError("");
            }}
            className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Username"
          />
          {joinError ? (
            <p className="mb-4 text-sm text-red-400">{joinError}</p>
          ) : null}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white border-r border-gray-700">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Users
        </div>

        {users.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400">
            No users joined yet.
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user?.name || index}
              className="w-full px-4 py-4 text-sm text-gray-300 border-b bg-blue-500"
            >
              {user?.name || "Unknown user"}
            </div>
          ))
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          defaultValue={initialCode}
          onMount={handleMount}
          options={{
            fontSize: 15,
            minimap: {
              enabled: true,
            },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}

export default App;
