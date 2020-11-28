import {
  COL_NOTE_DATE_TIME, NOTE_COL_DESC_NAME, NOTE_COL_NAME_DESC, DISPLAY_ALL_NOTE_COL_NAME_DESC,
  COL_SPECIES_ID, COL_SPECIES_NAME, COL_BEHAVIOUR_NAME, COL_COMMENTS, COL_COMMENTS_DATE,
  addNewNote, getNoteByID, getAllNotes, editNoteByID, deleteNoteByID, getUserInfo,
  getAllSpecies, getAllBirdsBehaviour, addNewCommentsByNoteID,
  getAllCommentsByNoteID, getBirdsBehaviourByNoteID, getSpeciesNameBySpeciesID,
} from './psqlDataHandler.js';
import { validateCookies } from './httpUserHandler.js';

/**
 *
 * @param {*} noteID
 * @param {*} response
 */
const displaySingleNote = (noteID, response, bEdit) => {
  console.log('displaySingleNote', noteID);
  getNoteByID(noteID, (error, returnRows) => {
    if (error)
    {
      response.status(300).render('messagePage', { message: 'Failed to get note.' });
      console.log(error);
      return;
    }
    console.log(returnRows);
    if (!bEdit) // Just to display the data retrieved
    {
      // Display the comments too
      getAllCommentsByNoteID(noteID, (commentError, commentResult) => {
        if (commentError)
        {
          response.status(300).render('messagePage', { message: 'Failed to get comments for the note.' });
          console.log(commentError);
          return;
        }
        console.log('commentResult.rows: ', commentResult.rows);
        response.render('singleNote', {
          displayData: returnRows[0],
          noteColNameDesc: NOTE_COL_NAME_DESC,
          noteComments: commentResult.rows,
        });
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

      // Get the species name
      getSpeciesNameBySpeciesID(returnRows[0][COL_SPECIES_ID], (speciesError, speciesResult) => {
        if (speciesError)
        {
          response.status(300).render('messagePage', { message: 'Failed to get Species Name.' });
          console.log(speciesError);
          return;
        }
        // Get all the associated behaviours also
        getBirdsBehaviourByNoteID(noteID, (behavError, behavResult) => {
          if (behavError)
          {
            response.status(300).render('messagePage', { message: 'Failed to get Behaviour for this note.' });
            console.log(behavError);
            return;
          }
          console.log(speciesResult);
          response.render('editSingleNote', {
            requestedItemIndex: noteID,
            displayData: returnRows[0],
            noteColNameDesc: NOTE_COL_NAME_DESC,
            speciesName: speciesResult.rows[0][COL_SPECIES_NAME],
            birdBehaviours: behavResult.rows,
          });
        }); // getBirdsBehaviourByNoteID
      }); // getSpeciesNameBySpeciesID
    } // else
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
    response.status(300).render('messagePage', { message: 'No notes are found.' });
    return;
  }
  response.render('listOfNotes', { allNotesArray: returnedRows, noteColNameDesc: DISPLAY_ALL_NOTE_COL_NAME_DESC });
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

  // Before displaying the form, find out all the available species in there
  // Send those species also to the form, to make a selection list
  getAllSpecies((error, returnSearchResult) => {
    if (error)
    {
      console.log('Erorr reading species list', error);
      response.status(300).render('messagePage', { message: 'Species list not found.' });
      return;
    }
    // Send the behaviours available also to the form, so that the user can
    // select from an existing one.
    getAllBirdsBehaviour((errorBehaviour, returnedBehaviour) => {
      if (errorBehaviour)
      {
        console.log('Erorr reading behaviour list', errorBehaviour);
        response.status(300).render('messagePage', { message: 'Behaviour list not found.' });
        return;
      }

      response.render('newNote', {
        noteColDescName: NOTE_COL_DESC_NAME,
        speciesList: returnSearchResult.rows,
        behaviourList: returnedBehaviour.rows,
      });
    });
  });
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

  // Validate the session is logged in or not using cookies
  if (!validateCookies(request.cookies))
  {
    response.status(300).render('messagePage', { message: 'Please login to create a new record!' });
    return;
  }
  const { loggedInSession, userInfo } = request.cookies;
  getUserInfo(userInfo, (returnError, returnResult) => {
    if (returnError)
    {
      response.status(300).render('messagePage', { message: 'Signup/Login to create new notes.' });
      return;
    }
    if ((returnResult.length === 0) || (returnResult.length > 1))
    {
      response.status(300).render('messagePage', { message: 'User is not found.' });
      return;
    }
    const userDetails = returnResult[0];
    // Function to insert new note and later display the newly added data
    addNewNote(request.body, userDetails.id, (error, newID) => {
      if (error) {
        response.status(300).render('messagePage', { message: 'Failed to add new note.' });
        console.log(error);
        return;
      }
      // Display the newly added note
      // displaySingleNote(newID, response, false);

      response.redirect(`/note/${newID}`);
    });
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
      response.status(300).render('messagePage', { message: 'Failed to edit the note.' });
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
      response.status(300).render('messagePage', { message: 'Failed to delete note.' });
      return;
    }
    response.redirect('/');
  });
};

export const handleNewCommentRequest = (request, response) => {
  // Validate the session is logged in or not using cookies
  if (!validateCookies(request.cookies))
  {
    response.status(300).render('messagePage', { message: 'Please login to post comments!' });
    return;
  }
  const { loggedInSession, userInfo } = request.cookies;
  getUserInfo(userInfo, (returnError, returnResult) => {
    if (returnError)
    {
      response.status(300).render('messagePage', { message: 'Signup/Login to add comments.' });
      return;
    }
    if ((returnResult.length === 0) || (returnResult.length > 1))
    {
      response.status(300).render('messagePage', { message: 'User is not found' });
      return;
    }
    const userDetails = returnResult[0];
    const requestedNoteID = request.params.id;
    // Get the User ID of the request
    const commentsInfo = {
      noteID: requestedNoteID,
      userID: userDetails.id,
      comments: request.body.comment,
    };
    // Function to insert new note and later display the newly added data
    addNewCommentsByNoteID(commentsInfo, (error) => {
      if (error) {
        response.status(300).render('messagePage', { message: 'Failed to add comments.' });
        console.log(error);
        return;
      }
      // response.redirect(`/note/${commentsInfo.noteID}`);
      response.redirect('/');
    });
  });
};
