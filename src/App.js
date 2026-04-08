import { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "./firebase";  
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import "./App.css";

const notesCollection = collection(db, "notes");

function App() {
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["general", "ideas", "todo", "inspiration"];

  const fetchNotes = useCallback(async () => {
    const data = await getDocs(notesCollection);
    setNotes(
      data.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }))
    );
    setLoading(false);
  }, []);

  // Filter notes by search query and selected category
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.category && n.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || (n.category || "general") === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [notes, searchQuery, selectedCategory]);

  const addNote = async () => {
    const text = note.trim();
    if (text === "") return;

    const id = crypto.randomUUID();
    const payload = {
      text,
      category: category || "general",
      createdAt: new Date(),
    };
    setNote("");
    setNotes((prev) => [{ id, ...payload }, ...prev]);

    try {
      await setDoc(doc(db, "notes", id), payload);
    } catch {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setNote(text);
    }
  };

  const deleteNote = async (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch {
      fetchNotes();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addNote();
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="app">
      <div className="noise" />

      <header className="header">
        <div className="header-top">
          <div className="brand">
            <span className="label">✨ NOTESPACE</span>
            <p className="subtitle">Capture. Organize. Inspire.</p>
          </div>
          <div className="note-count">{notes.length}</div>
        </div>
      </header>

      <main className="main">
        {/* Search Bar */}
        <div className="search-section">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search your notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Input row */}
        <div className="input-section">
          <div className="input-row">
            <input
              className="input"
              type="text"
              placeholder="What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="button" className="btn-add" onClick={addNote} title="Add note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Category selector */}
          <div className="category-selector">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                <span className="category-dot"></span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="filter-section">
          <button
            className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All Notes
          </button>
          {categories.map((cat) => (
            <button
              key={`filter-${cat}`}
              className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes grid */}
        <div className="notes-section">
          {loading ? (
            <div className="empty-state">
              <div className="spinner large" />
              <p className="empty-text">Loading your notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">
                {notes.length === 0
                  ? "Nothing here yet.\nAdd your first note above."
                  : "No notes match your search.\nTry a different query."}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((n, i) => (
                <div
                  className="note-card"
                  key={n.id}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="note-header">
                    <span className={`note-category ${(n.category || "general").toLowerCase()}`}>
                      {n.category || "general"}
                    </span>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => deleteNote(n.id)}
                      aria-label="Delete note"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <p className="note-text">{n.text}</p>
                  <p className="note-time">{formatTime(n.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <span>Made with ✨ • Firebase + React</span>
      </footer>
    </div>
  );
}

function formatTime(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}

export default App;