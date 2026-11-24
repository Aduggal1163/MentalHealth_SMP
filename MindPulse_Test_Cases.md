# Software Engineering — MindPulse AI Simple Test Cases
**Template Standard**: Dr. Ghazy Assassa Test Case Template (Doc: T_01)  
**System**: MindPulse AI — Social Media Mental Health & Distress Language Analyzer  

---

## Test Case 1 (Backend — TC_BE_01: Short Text Validation) [COVERS FAIL]

| Field | Value | Field | Value | Page |
| :--- | :--- | :--- | :--- | :---: |
| **Test Case #:** | **TC_BE_01** | **Test Case Name:** | Short Text Validation Test | **Page: 1 of 1** |
| **System:** | MindPulse AI | **Subsystem:** | Backend API | |
| **Designed by:** | Abhishek Duggal | **Design Date:** | 24/11/2026 | |
| **Executed by:** | Abhishek Duggal | **Execution Date:** | 24/11/2026 | |
| **Short Description:**| Test sending a 1-letter post to check if the backend rejects it properly. | | | |

### Pre-conditions
1. The backend server is running on `http://127.0.0.1:8000`.

### Test Steps & Execution Table
| Step | Action | Expected System Response | Pass/Fail | Comment |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Open API tool and enter URL `http://127.0.0.1:8000/api/analyze`. | Tool connects to the server successfully. | **Pass** | Connected to backend. |
| **2** | Enter body with 1 letter: `{"post": "a"}` and click Send. | Server receives the request. | **Pass** | Request sent. |
| **3** | Check the response status and message. | System returns `400 Bad Request` saying `"Text must be at least 3 letters"`. | **FAIL** | **Bug BE-01**: Server gave `500 Server Error` instead of friendly 400 message. |
| **4** | Check post-condition 1. | Bad post `"a"` is not saved in history. | **Pass** | History remains clean. |

### Post-conditions
1. Invalid 1-letter text is not saved in the database or history.

---

## Test Case 2 (Backend — TC_BE_02: Clear History Endpoint) [COVERS FAIL]

| Field | Value | Field | Value | Page |
| :--- | :--- | :--- | :--- | :---: |
| **Test Case #:** | **TC_BE_02** | **Test Case Name:** | Clear History API Test | **Page: 1 of 1** |
| **System:** | MindPulse AI | **Subsystem:** | Backend History Store | |
| **Designed by:** | Abhishek Duggal | **Design Date:** | 24/11/2026 | |
| **Executed by:** | Abhishek Duggal | **Execution Date:** | 24/11/2026 | |
| **Short Description:**| Test sending DELETE command to clear all past saved posts. | | | |

### Pre-conditions
1. Backend is running and contains 2 previously analyzed posts in history.

### Test Steps & Execution Table
| Step | Action | Expected System Response | Pass/Fail | Comment |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Send `GET /api/history` to view current history. | System returns list with 2 saved posts. | **Pass** | 2 posts found. |
| **2** | Send `DELETE /api/history` to clear all history. | Server receives the delete request. | **Pass** | Delete request sent. |
| **3** | Check the response status code. | System returns `200 OK` confirming history is deleted. | **FAIL** | **Bug BE-02**: Server returned `405 Method Not Allowed` because route was configured as POST instead of DELETE. |
| **4** | Send `GET /api/history` again. | History list should be empty `[]`. | **FAIL** | **Bug BE-02**: Old 2 posts are still present in history. |

### Post-conditions
1. All saved posts should be erased from memory.

---

## Test Case 3 (Frontend — TC_FE_01: Clear Button Functionality) [COVERS FAIL]

| Field | Value | Field | Value | Page |
| :--- | :--- | :--- | :--- | :---: |
| **Test Case #:** | **TC_FE_01** | **Test Case Name:** | Clear Text Button Test | **Page: 1 of 1** |
| **System:** | MindPulse AI | **Subsystem:** | Frontend Input Box | |
| **Designed by:** | Abhishek Duggal | **Design Date:** | 24/11/2026 | |
| **Executed by:** | Abhishek Duggal | **Execution Date:** | 24/11/2026 | |
| **Short Description:**| Test if clicking the "Clear" button removes all text from the input box. | | | |

### Pre-conditions
1. Web app is open in browser at `http://localhost:5173`.

### Test Steps & Execution Table
| Step | Action | Expected System Response | Pass/Fail | Comment |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Type `"I am feeling very tired today"` into the text box. | Text appears in the box and counter shows 6 words. | **Pass** | Text typed and counter works. |
| **2** | Click the `"Clear"` button below the box. | Text box is emptied and word counter resets to `"0 words"`. | **FAIL** | **Bug FE-01**: Text did not clear; button click event handler was missing. |
| **3** | Manually select all text with keyboard (`Ctrl+A`) and press Backspace. | Text is deleted manually. | **Pass** | Manual delete works. |
| **4** | Check post-condition 1. | Input box is empty. | **Pass** | Box is now empty. |

### Post-conditions
1. Input box should be empty and ready for new text.

---

## Test Case 4 (Frontend — TC_FE_02: Crisis Helpline Popup Button) [COVERS FAIL]

| Field | Value | Field | Value | Page |
| :--- | :--- | :--- | :--- | :---: |
| **Test Case #:** | **TC_FE_02** | **Test Case Name:** | Crisis Helpline Popup Test | **Page: 1 of 1** |
| **System:** | MindPulse AI | **Subsystem:** | Frontend Navigation & Modal | |
| **Designed by:** | Abhishek Duggal | **Design Date:** | 24/11/2026 | |
| **Executed by:** | Abhishek Duggal | **Execution Date:** | 24/11/2026 | |
| **Short Description:**| Test if clicking the "Crisis Resources" button opens the emergency phone numbers popup. | | | |

### Pre-conditions
1. Web app is open in browser at `http://localhost:5173`.

### Test Steps & Execution Table
| Step | Action | Expected System Response | Pass/Fail | Comment |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Look at the top navigation bar. | The `"Crisis Resources"` button is visible. | **Pass** | Button is visible on screen. |
| **2** | Click the `"Crisis Resources"` button. | A popup window opens showing emergency numbers (like 988). | **FAIL** | **Bug FE-02**: Popup did not open; state variable was stuck on false. |
| **3** | Refresh the web page (`F5`) and click the button again. | Page reloads and button is clickable again. | **Pass** | Page refreshed. |
| **4** | Check post-condition 1. | User can see emergency contact numbers. | **FAIL** | **Bug FE-02**: Emergency numbers still not displayed on screen. |

### Post-conditions
1. Crisis numbers popup should be open and visible to the user.
