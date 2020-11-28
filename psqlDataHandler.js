import { request } from 'express';
import pg from 'pg';

const DB_NAME = 'birding';

// NOTES TABLE
const NOTES_TABLE = 'notes';
const COL_ID = 'id';
export const COL_NOTE_DATE_TIME = 'noted_date_time';
const COL_BIRDS_JIZZ = 'birds_jizz';
const COL_BEHAVIOR = 'noted_behavior';
const COL_FLOCK_DETAILS = 'flock_details';
const COL_HABITAT_DATA = 'habitat_data';
const COL_USER_ID = 'user_id';
export const COL_SPECIES_ID = 'species_id';

// Desription for the column names, that will be displayed to the user
const DESC_NOTE_DATE_TIME = 'Observed Date & Time';
const DESC_BIRDS_JIZZ = 'Bird\'s Appearance / Identification';
const DESC_BEHAVIOR = 'Behavior Details';
const DESC_FLOCK_DETAILS = 'Flock Information';
const DESC_HABITAT_DATA = 'Habitat Details';

// An array, representing the properties of notes prepared
export const NOTE_PROPERTIES_ARRAY = [
  { colDesc: DESC_NOTE_DATE_TIME, colName: COL_NOTE_DATE_TIME },
  { colDesc: DESC_BIRDS_JIZZ, colName: COL_BIRDS_JIZZ },
  { colDesc: DESC_BEHAVIOR, colName: COL_BEHAVIOR },
  { colDesc: DESC_FLOCK_DETAILS, colName: COL_FLOCK_DETAILS },
  { colDesc: DESC_HABITAT_DATA, colName: COL_HABITAT_DATA },
];

export const NOTE_COL_DESC_NAME = {
  [DESC_NOTE_DATE_TIME]: COL_NOTE_DATE_TIME,
  [DESC_BIRDS_JIZZ]: COL_BIRDS_JIZZ,
  [DESC_BEHAVIOR]: COL_BEHAVIOR,
  [DESC_FLOCK_DETAILS]: COL_FLOCK_DETAILS,
  [DESC_HABITAT_DATA]: COL_HABITAT_DATA,
};

export const NOTE_COL_NAME_DESC = {
  [COL_NOTE_DATE_TIME]: DESC_NOTE_DATE_TIME,
  [COL_BIRDS_JIZZ]: DESC_BIRDS_JIZZ,
  [COL_BEHAVIOR]: DESC_BEHAVIOR,
  [COL_FLOCK_DETAILS]: DESC_FLOCK_DETAILS,
  [COL_HABITAT_DATA]: DESC_HABITAT_DATA,
};

export const DISPLAY_ALL_NOTE_COL_NAME_DESC = {
  [COL_BIRDS_JIZZ]: DESC_BIRDS_JIZZ,
  [COL_BEHAVIOR]: DESC_BEHAVIOR,
  [COL_NOTE_DATE_TIME]: DESC_NOTE_DATE_TIME,
};

// USERS Table
const USERS_TABLE = 'users';
const COL_USERS_EMAIL = 'email';
const COL_USERS_PWD = 'password';
const COL_USERS_USERNAME = 'username';

// Species Table
const SPECIES_TABLE = 'species';
export const COL_SPECIES_NAME = 'name';
const COL_SCI_NAME = 'scientific_name';

// Birds Behaviour table
const BIRDS_BEHAVIOURS_TABLE = 'bird_behaviours';
export const COL_BEHAVIOUR_NAME = 'behaviour';

// Relation table between note id and opted behaviours
const NOTES_BEHAVIOURS_TABLE = 'notes_behaviours';
const COL_NOTES_ID = 'notes_id';
const COL_BEHAVIOR_ID = 'behaviour_id';

const USER_COMMENTS_TABLE = 'user_comments';
export const COL_COMMENTS = 'comments';
export const COL_COMMENTS_DATE = 'comment_date';

// Initialize the DB connection
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'veenas',
  host: 'localhost',
  database: DB_NAME,
  port: 5432, // Postgres server always runs on this port by default
};

const pool = new Pool(pgConnectionConfigs);

/**
 *
 * @param {*} newNoteID  - Newly created note id
 * @param {*} behaviourIDArray - Behaviours selected by user while creating new note
 * @param {*} callbackFunction - A callback function that returns the id of newly created note
 */
const mapNewNoteToBehaviours = (newNoteID, behaviourIDArray, callbackFunction) => {
  console.log(behaviourIDArray, typeof (behaviourIDArray));

  const insertQuery = `INSERT INTO ${NOTES_BEHAVIOURS_TABLE} (${COL_NOTES_ID}, ${COL_BEHAVIOR_ID}) VALUES ($1, $2)`;
  let queryDoneCounter = 0;
  if (typeof (behaviourIDArray) === 'string')
  {
    const insertValues = [newNoteID, behaviourIDArray];
    pool.query(insertQuery, insertValues, (insertError, insertResult) => {
      callbackFunction(insertError, newNoteID);
    });
  }
  else {
    behaviourIDArray.forEach((behaviourID) => {
      const insertValues = [newNoteID, behaviourID];
      pool.query(insertQuery, insertValues, (insertError, insertResult) => {
      // Query counter is incremented only after a query execution is completed
        queryDoneCounter += 1;
        console.log(insertResult);
        // check to see if all the queries are done
        if (queryDoneCounter === behaviourIDArray.length)
        {
          callbackFunction(insertError, newNoteID);
        }
      });
    });
  }
};

/**
 *
 * @param {*} newNoteData - object containing the details of new note to be inserted
 * @param {*} callbackFunction - after the insert query, this function will be called
 *
 * This function inserts a new note into the notes table.
 */
export const addNewNote = (newNoteData, userID, callbackFunction) => {
  // console.log(newNoteData);
  // console.log(newNoteData[COL_NOTE_DATE_TIME]);
  const insertQuery = `INSERT INTO ${NOTES_TABLE} (${COL_NOTE_DATE_TIME}, ${COL_BIRDS_JIZZ}, ${COL_BEHAVIOR}, ${COL_FLOCK_DETAILS}, ${COL_HABITAT_DATA}, ${COL_USER_ID}, ${COL_SPECIES_ID}) VALUES ('${newNoteData[COL_NOTE_DATE_TIME]}', '${newNoteData[COL_BIRDS_JIZZ]}', '${newNoteData[COL_BEHAVIOR]}', '${newNoteData[COL_FLOCK_DETAILS]}', '${newNoteData[COL_HABITAT_DATA]}', ${userID}, ${newNoteData[COL_SPECIES_ID]}) RETURNING ${COL_ID}`;
  console.log(`Query: ${insertQuery}`);

  pool.query(insertQuery, (errorInsert, resultInsert) => {
    if (errorInsert)
    {
      console.log(errorInsert);
      callbackFunction(errorInsert);
      return;
    }
    console.log('resultInsert:', resultInsert);
    const newlyAddedNoteID = resultInsert.rows[0][COL_ID];
    console.log(newlyAddedNoteID);

    // Add this new note id and specified behaviour id to notes_behaviours table
    mapNewNoteToBehaviours(newlyAddedNoteID, newNoteData.behaviour_ids, callbackFunction);
  });
};

/**
 *
 * @param {*} noteID - ID of the note to be retrieved from table
 * @param {*} callbackFunction - Callback function takes the error and return result object
 *
 * This function gets the note corresponding to the specified note id
 */
export const getNoteByID = (noteID, callbackFunction) => {
  console.log('getNoteByID', noteID);
  const selectQuery = `SELECT * FROM ${NOTES_TABLE} WHERE ${COL_ID} = ${noteID}`;
  console.log(selectQuery);
  pool.query(selectQuery, (selectError, selectResult) => {
    if (selectError)
    {
      callbackFunction(selectError);
      return;
    }
    callbackFunction(selectError, selectResult.rows);
  });
};

/**
 *
 * @param {*} callbackFunction - Function to be called after query execution
 *
 * This function gets all the notes present in the table
 */
export const getAllNotes = (callbackFunction) => {
  const selectQuery = `SELECT * FROM ${NOTES_TABLE}`;
  pool.query(selectQuery, (error, selectResult) => {
    if (error)
    {
      callbackFunction(error);
      return;
    }
    callbackFunction(error, selectResult.rows);
  });
};

/**
 *
 * @param {*} requestedID
 * @param {*} updatedNoteData
 * @param {*} callbackFunction
 */
export const editNoteByID = (requestedID, updatedNoteData, callbackFunction) =>
{
  console.log(updatedNoteData);
  // Select update query
  const updateQuery = `UPDATE ${NOTES_TABLE} SET ${COL_NOTE_DATE_TIME} = '${updatedNoteData[COL_NOTE_DATE_TIME]}', ${COL_BIRDS_JIZZ} = '${updatedNoteData[COL_BIRDS_JIZZ]}', ${COL_BEHAVIOR} = '${updatedNoteData[COL_BEHAVIOR]}', ${COL_FLOCK_DETAILS} = '${updatedNoteData[COL_FLOCK_DETAILS]}', ${COL_HABITAT_DATA} = '${updatedNoteData[COL_HABITAT_DATA]}' WHERE ${COL_ID} = ${requestedID} RETURNING *`;

  console.log(updateQuery);

  pool.query(updateQuery, (updateError, returnResult) => {
    callbackFunction(updateError, returnResult);
  });
};

/**
 *
 * @param {*} requestedID
 * @param {*} callbackFunction
 */
export const deleteNoteByID = (requestedID, callbackFunction) => {
  const deleteQuery = `DELETE FROM ${NOTES_TABLE} WHERE ${COL_ID}=${requestedID};`;
  console.log(deleteQuery);
  pool.query(deleteQuery, (deleteError, result) => {
    callbackFunction(deleteError, result);
  });
};

/**
 *
 * @param {*} newUserInfo - new user's information. Also, this function expects the
 *                        - password at this point of time will be in hashed form.
 *                        - no further transformation is made
 * @param {*} callbackFunction - called after insert query
 *
 * This function inserts the new user data into users table.
 */
export const addNewUser = (newUserInfo, callbackFunction) => {
  console.log(newUserInfo);
  const hashedPassword = newUserInfo.inputPassword;
  const insertUserQuery = `INSERT INTO ${USERS_TABLE} (${COL_USERS_EMAIL}, ${COL_USERS_PWD}, ${COL_USERS_USERNAME}) VALUES ('${newUserInfo.inputEmail}', '${hashedPassword}', '${newUserInfo.username}')`;

  console.log(insertUserQuery);

  pool.query(insertUserQuery, (insertError, insertResult) => {
    if (insertError) {
      console.log('Insertion to User table failed.', insertError);
      callbackFunction(insertError);
      return;
    }
    callbackFunction(insertError, insertResult);
  });
};

/**
 *
 * @param {*} userEmail - email specified with the login request
 * @param {*} callbackFunction - called after the select query
 *
 * This function gets the user information with the specified email
 */
export const getUserInfo = (userEmail, callbackFunction) => {
  const selectUserQuery = `SELECT * FROM ${USERS_TABLE} WHERE ${COL_USERS_EMAIL} = '${userEmail}'`;
  pool.query(selectUserQuery, (selectError, selectResult) => {
    if (selectError)
    {
      console.log('Select query to users table failed.', selectError);
      callbackFunction(selectError);
      return;
    }
    callbackFunction(selectError, selectResult.rows);
  });
};

/**
 * Function to get all the species currently in database
 */
export const getAllSpecies = (callbackFunction) => {
  const selectSpeciesQuery = `SELECT * FROM ${SPECIES_TABLE}`;
  pool.query(selectSpeciesQuery, (selectError, selectResult) => {
    callbackFunction(selectError, selectResult);
  });
};

/**
 *
 * @param {*} speciesID - species ID to be searched
 * @param {*} callbackFunction - callback fucntion
 */
export const getSpeciesNameBySpeciesID = (speciesID, callbackFunction) => {
  const selectSpeciesQuery = `SELECT ${COL_SPECIES_NAME} FROM ${SPECIES_TABLE} WHERE ${COL_ID} = ${Number(speciesID)}`;
  pool.query(selectSpeciesQuery, (selectError, selectResult) => {
    callbackFunction(selectError, selectResult);
  });
};

/**
 *
 * Function gets all the existing behabiours in the database
 */
export const getAllBirdsBehaviour = (callbackFunction) => {
  const selectBehaviourQuery = `SELECt * FROM ${BIRDS_BEHAVIOURS_TABLE}`;
  pool.query(selectBehaviourQuery, (selectError, selectResult) => {
    callbackFunction(selectError, selectResult);
  });
};

/**
 *
 * @param {*} noteID - Notes ID of whose behaviours has to be found out
 * @param {*} callbackFunction - callback function to be returned
 */
export const getBirdsBehaviourByNoteID = (noteID, callbackFunction) => {
  const selectBirdBehaviourQuery = `SELECT ${BIRDS_BEHAVIOURS_TABLE}.${COL_BEHAVIOUR_NAME} FROM ${BIRDS_BEHAVIOURS_TABLE} INNER JOIN ${NOTES_BEHAVIOURS_TABLE} ON ${BIRDS_BEHAVIOURS_TABLE}.${COL_ID}= ${NOTES_BEHAVIOURS_TABLE}.${COL_BEHAVIOR_ID} WHERE ${NOTES_BEHAVIOURS_TABLE}.${COL_NOTES_ID} = ${noteID}`;
  console.log(selectBirdBehaviourQuery);
  pool.query(selectBirdBehaviourQuery, (selectError, selectResult) => {
    callbackFunction(selectError, selectResult);
  });
};

/**
 *
 * @param {*} commentsInfo - includes note ID, user ID, comments
 * @param {*} callbackFunction - function to called after insertion
 */
export const addNewCommentsByNoteID = (commentsInfo, callbackFunction) => {
  const insertQuery = `INSERT INTO ${USER_COMMENTS_TABLE} (${COL_USER_ID}, ${COL_NOTES_ID}, ${COL_COMMENTS}) VALUES (${commentsInfo.userID}, ${commentsInfo.noteID}, '${commentsInfo.comments}')`;

  console.log(commentsInfo);
  console.log(insertQuery);
  pool.query(insertQuery, (insertError, insertResult) => {
    if (insertError)
    {
      console.log(insertError);
    }
    callbackFunction(insertError);
  });
};

/**
 *
 * @param {*} noteID - note id whose comments are to be taken
 * @param {*} callbackFunction
 *
 * This function gets all the comments for a particular Note
 */
export const getAllCommentsByNoteID = (noteID, callbackFunction) => {
  const selectCommentQuery = `SELECT * FROM ${USER_COMMENTS_TABLE} WHERE ${COL_NOTES_ID} = ${noteID}`;
  console.log(selectCommentQuery);
  pool.query(selectCommentQuery, (selectError, selectResult) => {
    callbackFunction(selectError, selectResult);
  });
};
