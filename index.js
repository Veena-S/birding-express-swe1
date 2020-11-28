import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import {
  handleNewNoteFormDisplayRequest, handleNewNoteRequest,
  handleSingleNoteDisplayRequest, handleAllNotesDisplayRequest,
  handleEditNoteFormDisplayRequest, handleEditNoteRequest,
  handleDeleteNoteRequest, handleNewCommentRequest,
} from './httpNoteHandler.js';

import {
  handleSignUpFormDisplayRequest, handleSignUpRequest,
  handleLoginFormDisplayRequest, handleLoginRquest, handleLogoutRequest,
} from './httpUserHandler.js';

// const PORT = 3004;
const PORT = process.argv[2];

console.log(process.argv);

const app = express();

// a library cookie-parser to parse the cookie string value in the header into a JavaScript Object.
app.use(cookieParser());

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
app.use(express.static('images'));

/**
 * 3.PCE.5: Bird Watching
 */
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

/**
 * 3.PCE.6: Bird Watching Users
 */
// Render a form that will sign up a user.
app.get('/signup', handleSignUpFormDisplayRequest);
// Accept a POST request to create a user.
app.post('/signup', handleSignUpRequest);
// Render a form that will log a user in.
app.get('/login', handleLoginFormDisplayRequest);
// Accept a POST request to log a user in.
app.post('/login', handleLoginRquest);
// Log a user out. Get rid of their cookie.
app.delete('/logout', handleLogoutRequest);

/**
 * 3.PCE.9 Bird Watching Comments
 */
app.post('/note/:id/comment', handleNewCommentRequest);

app.listen(PORT);
