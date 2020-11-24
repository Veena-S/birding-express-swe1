import pg from 'pg';

const DB_NAME = 'birding';
const NOTES_TABLE = 'notes';
const COL_ID = 'id';
export const COL_NOTE_DATE_TIME = 'noted_date_time';
const COL_BIRDS_JIZZ = 'birds_jizz';
const COL_BEHAVIOR = 'noted_behavior';
const COL_FLOCK_DETAILS = 'flock_details';
const COL_HABITAT_DATA = 'habitat_data';

// Desription for the column names, that will be displayed to the user
const DESC_NOTE_DATE_TIME = 'Observed Date & Time';
const DESC_BIRDS_JIZZ = 'Bird\'s Appearance / Identification';
const DESC_BEHAVIOR = 'Observed Behavior';
const DESC_FLOCK_DETAILS = 'Flock Information';
const DESC_HABITAT_DATA = 'Observed Habitat Details';

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
 * @param {*} newNoteData - object containing the details of new note to be inserted
 * @param {*} callbackFunction - after the insert query, this function will be called
 *
 * This function inserts a new note into the notes table.
 */
export const addNewNote = (newNoteData, callbackFunction) => {
  // console.log(newNoteData);
  // console.log(newNoteData[COL_NOTE_DATE_TIME]);
  const insertQuery = `INSERT INTO ${NOTES_TABLE} (${COL_NOTE_DATE_TIME}, ${COL_BIRDS_JIZZ}, ${COL_BEHAVIOR}, ${COL_FLOCK_DETAILS}, ${COL_HABITAT_DATA}) VALUES ('${newNoteData[COL_NOTE_DATE_TIME]}', '${newNoteData[COL_BIRDS_JIZZ]}', '${newNoteData[COL_BEHAVIOR]}', '${newNoteData[COL_FLOCK_DETAILS]}', '${newNoteData[COL_HABITAT_DATA]}') RETURNING ${COL_ID}`;
  console.log(`Query: ${insertQuery}`);

  pool.query(insertQuery, (errorInsert, resultInsert) => {
    if (errorInsert)
    {
      callbackFunction(errorInsert);
      return;
    }
    console.log('resultInsert:', resultInsert);
    const newlyAddedNoteID = resultInsert.rows[0][COL_ID];
    console.log(newlyAddedNoteID);
    callbackFunction(errorInsert, newlyAddedNoteID);
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
