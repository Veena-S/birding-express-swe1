import {
  COL_NOTE_DATE_TIME, NOTE_COL_DESC_NAME, NOTE_COL_NAME_DESC, addNewNote, getNoteByID,
  getAllNotes, editNoteByID, deleteNoteByID,
} from './psqlDataHandler.js';

/**
 *
 * @param {*} noteID
 * @param {*} response
 */
const displaySingleNote = (noteID, response, bEdit) => {
  console.log('displaySingleNote', noteID);
  getNoteByID(noteID, (error, returnRows) => {
    if (error || returnRows.length === 0)
    {
      response.status(300).send('Failed to get note.');
      return;
    }
    console.log(returnRows);
    if (!bEdit) // Just to display the data retrieved
    {
      response.render('singleNote', {
        displayData: returnRows[0],
        noteColNameDesc: NOTE_COL_NAME_DESC,
      });
    }
    else { // to display the data in the edit form
      // Convert the returning date and time to a string and store back in the returned result.
      // Otherwise, the time will not be displayed in the datatime-local input element in form
      const returnedDateTime = returnRows[0][COL_NOTE_DATE_TIME];
      const oldHours = (`0${returnedDateTime.getHours()}`).slice(-2); // Extract only the last 2 chars
      const oldMinutes = (`0${returnedDateTime.getMinutes()}`).slice(-2); // Extract only the last 2 chars
      const oldMonth = (`0${returnedDateTime.getMonth() + 1}`).slice(-2);
      const oldDate = (`0${returnedDateTime.getDate()}`).slice(-2);
      const notedDateTime = (`${returnedDateTime.getFullYear()}-${oldMonth}-${oldDate}T${oldHours}:${oldMinutes}`);
      console.log(notedDateTime);

      returnRows[0][COL_NOTE_DATE_TIME] = notedDateTime;
      response.render('editSingleNote', {
        requestedItemIndex: noteID,
        displayData: returnRows[0],
        noteColNameDesc: NOTE_COL_NAME_DESC,
      });
    }
  });
};

/**
 *
 * @param {*} error
 * @param {*} returnedRows
 * @param {*} response
 */
const displayAllNotes = (error, returnedRows, response) => {
  if (error || returnedRows.length === 0)
  {
    response.status(300).send('No Notes Found');
    return;
  }
  response.render('listOfNotes', { allNotesArray: returnedRows, noteColNameDesc: NOTE_COL_NAME_DESC });
};

/**
 *
 * @param {*} request  - represents HTTP request
 * @param {*} response - represents the HTTP response that an Express app
 *                       sends when it gets an HTTP request.
 *
 */
export const handleNewNoteFormDisplayRequest = (request, response) => {
  console.log('inside handleNewNoteFormDisplayRequest');
  response.render('newNote', { noteColDescName: NOTE_COL_DESC_NAME });
};

/**
 *
 * @param {*} request  - represents HTTP request
 * @param {*} response - represents the HTTP response that an Express app
 *                       sends when it gets an HTTP request.
 *
 * This function sets all the given data in the request to notes table in birding db
 */
export const handleNewNoteRequest = (request, response) => {
  console.log(request.body);
  // Function to insert new note and later display the newly added data
  addNewNote(request.body, (error, newID) => {
    if (error) {
      response.status(300).send('Failed to add new note.');
      return;
    }
    // Display the newly added note
    // displaySingleNote(newID, response, false);

    response.redirect(`/note/${newID}`);
  });
};

/**
 *
 * @param {*} request  - represents HTTP request
 * @param {*} response - represents the HTTP response that an Express app
 *                       sends when it gets an HTTP request.
 *
 */
export const handleSingleNoteDisplayRequest = (request, response) => {
  const requestedNoteID = request.params.id;
  displaySingleNote(requestedNoteID, response, false);
};

/**
 *
 * @param {*} request  - represents HTTP request
 * @param {*} response - represents the HTTP response that an Express app
 *                       sends when it gets an HTTP request.
 *
 */
export const handleAllNotesDisplayRequest = (request, response) => {
  getAllNotes((error, returnedRows) => {
    displayAllNotes(error, returnedRows, response);
  });
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
export const handleEditNoteFormDisplayRequest = (request, response) => {
  const requestedNoteID = request.params.id;
  displaySingleNote(requestedNoteID, response, true);
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
export const handleEditNoteRequest = (request, response) => {
  const requestedNoteID = request.params.id;
  editNoteByID(requestedNoteID, request.body, (error, result) => {
    if (error) {
      console.log(error);
      response.status(300).send('Failed to add new note.');
      return;
    }
    console.log(result);
    // Display the updated note
    // response.render('singleNote', {
    //   displayData: result.rows[0],
    //   noteColNameDesc: NOTE_COL_NAME_DESC,
    // });
    response.redirect(`/note/${requestedNoteID}`);
  });
};

export const handleDeleteNoteRequest = (request, response) => {
  const requestedNoteID = request.params.id;
  console.log(requestedNoteID);
  deleteNoteByID(requestedNoteID, (error, res) =>
  {
    if (error) {
      console.log(error);
      response.status(300).send('Failed to delete note.');
      return;
    }
    response.redirect('/');
  });
};
