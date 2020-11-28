import jsSHA from 'jsSHA';
import { addNewUser, getUserInfo } from './psqlDataHandler.js';

const saltEnvVar = process.env.SALT_ENV_VAR;

/**
 *
 * @param {*} unhashedValueInput - Value to be hashed
 * @param {*} useSalt - Boolean value expected indicating whether
 *                      to append Salt value also to hashed value
 *
 * This function generates the hashed value of the specified value.
 */
const generatedHashedValue = (unhashedValueInput, useSalt) => {
  /**
   * Hashing passwords using jsSHA library
   */
  let unhashedValue = unhashedValueInput;
  if (useSalt)
  {
    unhashedValue += `-${saltEnvVar}`;
  }
  // initialise the SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(unhashedValue);
  // get the hashed password as output from the SHA object
  const hashedValue = shaObj.getHash('HEX');
  return hashedValue;
};

/**
 *
 * @param {*} loginData  - email & password specified in the login request
 * @param {*} searchReturnUserInfoArray - Search result returned from the db query
 * @param {*} response  - to send HTTP response
 *
 * This function validates the given user name against the data retrieved from the database
 * Also, sends the cookie also along with response
 */
const validateAndLoginUser = (loginData, searchReturnUserInfoArray, response) => {
  if ((searchReturnUserInfoArray.length === 0) || (searchReturnUserInfoArray.length > 1))
  {
    response.status(300).render('messagePage', { message: 'User is not found' });
    return;
  }
  const userInfo = searchReturnUserInfoArray[0];

  // Get the hashed value of the user provided password
  const hashedInputPassword = generatedHashedValue(loginData.inputPassword, false);
  // If the user's hashed password in the database does not
  // match the hashed input password, login fails
  if (userInfo.password !== hashedInputPassword) {
    // the error for incorrect email and incorrect password are the same for security reasons.
    // This is to prevent detection of whether a user has an account for a given service.
    response.status(300).render('messagePage', { message: 'login failed!' });
    return;
  }
  // create an unhashed cookie string based on user ID and salt
  const hashedCookieString = generatedHashedValue(loginData.inputEmail, true);
  // set the loggedInHash and username cookies in the response
  response.cookie('loggedInSession', hashedCookieString);
  response.cookie('userInfo', userInfo.email);
  // end the request-response cycle
  // response.send('logged in!');
  response.redirect('/');
};

/**
 *
 * @param {*} requestCookies - Cookies from the request
 *
 * This function validates the session, by checking the cookie values.
 * If cookies don't match, it will return false, else true.
 */
export const validateCookies = (requestCookies) => {
  const { loggedInSession, userInfo } = requestCookies;
  if (loggedInSession === undefined || userInfo === undefined)
  {
    return false;
  }
  // create hashed value for the user info provided.
  const hashedUserInfo = generatedHashedValue(userInfo, true);
  if (hashedUserInfo !== loggedInSession)
  {
    return false;
  }
  return true;
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
export const handleSignUpFormDisplayRequest = (request, response) => {
  console.log('handleSignUpFormDisplayRequest');
  response.render('signupForm', { displayType: 'signup' });
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
export const handleSignUpRequest = (request, response) => {
  console.log(`Before hashing: ${request.body.inputPassword}`);

  // set the hashed password back to the request, which will be set to users table in db
  request.body.inputPassword = generatedHashedValue(request.body.inputPassword, false);

  console.log(`After hashing: ${request.body.inputPassword}`);

  addNewUser(request.body, (returnError, returnResult) => {
    if (returnError)
    {
      console.log('Error occurred while adding new user', returnError.stack);
      response.status(300).render('messagePage', { message: 'Error occurred while adding new user' });
    }
    // Show a modal box for conveying the message.
    // To DO:
    // response.render('signupForm', { displayType: 'signup-done' });
    response.redirect('/');
  });
};

/**
 *
 * @param {*} request
 * @param {*} response
 */
export const handleLoginFormDisplayRequest = (request, response) => {
  console.log('handleLoginFormDisplayRequest');
  response.render('loginForm', { displayType: 'login' });
};

/**
 *
 * @param {*} request
 * @param {*} response
 *
 * Function that validates the user login request
 */
export const handleLoginRquest = (request, response) => {
  console.log('handleLoginRquest', request.body);
  const loginData = {
    inputEmail: request.body.inputEmail,
    inputPassword: request.body.inputPassword,
  };
  getUserInfo(loginData.inputEmail, (returnError, returnResult) => {
    if (returnError)
    {
      console.log('Error occurred while logging in', returnError.stack);
      response.status(300).render('messagePage', { message: 'Error occurred while logging in' });
    }
    validateAndLoginUser(loginData, returnResult, response);
  });
};

/**
 *
 * @param {*} request
 * @param {*} response
 *
 * This function deletes the cookies stored
 */
export const handleLogoutRequest = (request, response) => {
  response.clearCookie('loggedInSession');
  response.clearCookie('userInfo');
  response.send('Logged out');
};
