import express from 'express';
import methodOverride from 'method-override';
import {
  handleNewNoteFormDisplayRequest, handleNewNoteRequest,
  handleSingleNoteDisplayRequest, handleAllNotesDisplayRequest,
  handleEditNoteFormDisplayRequest, handleEditNoteRequest,
  handleDeleteNoteRequest,
} from './httpHandler.js';

const PORT = 3004;

const app = express();

// Set the view engine to generate HTML responses through ejs files in view directory
app.set('view engine', 'ejs');
// To receive POST request data as an object
// This middleware function parses incoming requests with urlenconded payloads
app.use(express.urlencoded({ extended: false }));
// override with POST having ?_method=PUT
app.use(methodOverride('_method'));
// To serve the static files like css files, image files.
// This will load the files that are in the public directory
app.use(express.static('public'));

// To render a form that will create a new not
app.get('/note', handleNewNoteFormDisplayRequest);
// To accept the POST request to create a new note
app.post('/note', handleNewNoteRequest);
// Render a single note.
app.get('/note/:id', handleSingleNoteDisplayRequest);
// Render a list of notes.
app.get('/', handleAllNotesDisplayRequest);
// Render a form to edit a note.
app.get('/note/:id/edit', handleEditNoteFormDisplayRequest);
// Accept a request to edit a single note
app.put('/note/:id/edit', handleEditNoteRequest);
// Accept a request to delete a note.
app.delete('/note/:id/delete', handleDeleteNoteRequest);

app.listen(PORT);
