
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Files folder and JSON file
const filesDir = path.join(__dirname, "files");
const notesFile = path.join(filesDir, "notes.json");

// Create files folder automatically
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
}

// Create notes.json automatically
if (!fs.existsSync(notesFile)) {
    fs.writeFileSync(notesFile, "[]", "utf8");
}

// Read notes from JSON file
function readNotes() {
    try {
        const data = fs.readFileSync(notesFile, "utf8");
        const notes = JSON.parse(data);

        return Array.isArray(notes) ? notes : [];
    } catch (error) {
        console.error("Error reading notes:", error);
        throw error;
    }
}

// Write notes into JSON file
function writeNotes(notes) {
    fs.writeFileSync(
        notesFile,
        JSON.stringify(notes, null, 4),
        "utf8"
    );
}

// Home route
app.get("/", (req, res) => {
    try {
        const notes = readNotes();

        res.render("index", { notes });

    } catch (error) {
        res.status(500).send("Unable to load notes.");
    }
});

// Create note
app.post("/add", (req, res) => {
    try {
        const { title, content } = req.body;

        if (
            typeof title !== "string" ||
            typeof content !== "string" ||
            !title.trim() ||
            !content.trim()
        ) {
            return res.status(400).send("Title and content are required.");
        }

        const notes = readNotes();

        const newNote = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            date: new Date().toLocaleString()
        };

        notes.unshift(newNote);

        writeNotes(notes);

        res.redirect("/");

    } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).send("Unable to create note.");
    }
});

// Delete note
app.post("/delete/:id", (req, res) => {
    try {
        const notes = readNotes();

        const updatedNotes = notes.filter(
            note => note.id !== req.params.id
        );

        writeNotes(updatedNotes);

        res.redirect("/");

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).send("Unable to delete note.");
    }
});

// Start server
app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Notes App Started Successfully!");
    console.log(`http://localhost:${PORT}`);
    console.log("--------------------------------");
});

