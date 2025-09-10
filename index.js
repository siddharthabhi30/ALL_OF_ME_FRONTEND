// index.js

// -- 1. DEFINE THE REAL Backend API URL --
// THIS IS THE ONLY LINE YOU NEED TO CHANGE.
// It points to your live Render server and the `/ask` endpoint we created.
const BACKEND_URL = 'https://all-of-me.onrender.com/ask';


// -- 2. GET REFERENCES to our HTML elements (Unchanged) --
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const responseArea = document.getElementById('response-area');


// -- 3. SET UP an Event Listener for the form submission (Unchanged) --
promptForm.addEventListener('submit', async function(event) {
    
    // a. Prevent the browser's default behavior of reloading the page.
    event.preventDefault();

    // b. Get the user's question from the textarea.
    const userQuestion = promptInput.value.trim();

    // c. If the user didn't type anything, do nothing.
    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // d. Show a "loading" message to the user.
    responseArea.style.display = 'block';
    responseArea.textContent = 'Thinking...';
    
    // -- 4. MAKE THE LIVE API CALL using fetch() (The URL now works!) --
    try {
        // Send the user's question to your live backend.
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // LATER: You will add authentication here if needed.
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ prompt: userQuestion })
        });
        
        // Check if the server responded successfully
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the JSON data from the response (e.g., { answer: "Here is the result." })
        const data = await response.json();
        
        // e. Display the final answer from the backend.
        responseArea.textContent = data.answer;

    } catch (error) {
        // f. If anything goes wrong, show a helpful error message.
        console.error("Error making API call:", error);
        responseArea.textContent = 'Oops! An error occurred while communicating with the server. Please try again later.';
    }
});