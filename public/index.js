let notes = [];

const noteArea = document.getElementById('noteArea');
const createBtn = document.getElementById('createBtn');
const clearBtn = document.getElementById('clearBtn');
const noteContainer = document.getElementById('noteContainer');

createBtn.addEventListener('click', createNote);
clearBtn.addEventListener('click', () => { noteArea.value = ''; noteArea.focus(); });

function renderNotes() {
    noteContainer.innerHTML = '';
    
    notes.slice().reverse().forEach(n => {
        const newNote = document.createElement('div');
        newNote.className = 'w-full py-4 rounded-md bg-gray-200 px-2 flex justify-between items-center';
        newNote.id = n.id;
        const content = document.createElement('div');
        content.textContent = n.content;
        if (n.content.length > 20) content.classList.add('truncate');

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'note py-1 px-2 bg-red-500 text-white rounded-lg';
        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', (e) => {e.stopPropagation(); deleteNote(n.id)});

        newNote.appendChild(content);
        newNote.appendChild(deleteBtn);
        noteContainer.prepend(newNote);
    });
}

async function loadNotes() {
    try {
        const res = await fetch('/api/notes');
        notes = await res.json();
        renderNotes();
    } catch (err) {
        console.error('Failed to load notes', err);
    }
}

async function createNote() {
    const text = noteArea.value.trim();
    if (!text) return;
    try {
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text })
        });
        if (!res.ok) throw new Error('Create failed');
        const note = await res.json();
        notes.push(note);
        renderNotes();
        noteArea.value = '';
    } catch (err) {
        console.error(err);
    }
}

async function deleteNote(id) {
    try {
        const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        if (res.status === 204) {
            const idx = notes.findIndex(n => n.id === id);
            if (idx !== -1) notes.splice(idx, 1);
            const el = document.getElementById(id);
            if (el) el.remove();
        } else {
            console.error('Delete failed', await res.text());
        }
    } catch (err) {
        console.error(err);
    }
}

// initial load
loadNotes();
