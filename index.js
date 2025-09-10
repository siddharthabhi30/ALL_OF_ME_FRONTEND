// index.js

// -- 1. DEFINE a placeholder for our Backend API URL --
// When you deploy your backend, you will replace this string with your real Render URL.
const BACKEND_URL = 'https://your-backend-will-go-here.onrender.com/ask';


// -- 2. GET REFERENCES to our HTML elements --
// We get them by their ID so we can interact with them.
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const responseArea = document.getElementById('response-area');


// -- 3. SET UP an Event Listener for the form submission --
// This function will run every time the user clicks the "Ask" button.
promptForm.addEventListener('submit', async function(event) {
    
    // a. Prevent the browser's default behavior of reloading the page.
    event.preventDefault();

    // b. Get the user's question from the textarea.
    const userQuestion = promptInput.value.trim(); // .trim() removes any accidental whitespace

    // c. If the user didn't type anything, do nothing.
    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // d. Show a "loading" message to the user and make the response area visible.
    responseArea.style.display = 'block';
    responseArea.textContent = 'Thinking...';
    
    // -- 4. MAKE THE API CALL using fetch() --
    // We wrap this in a try...catch block to handle potential errors gracefully.
    try {
        // Here we send the user's question to the backend.
        const response = await fetch(BACKEND_URL, {
            method: 'POST', // We use POST because we are sending data
            headers: {
                'Content-Type': 'application/json',
                // LATER: You will add your authentication token here
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ prompt: userQuestion }) // We send the data as a JSON object
        });
        
        // Check if the network response was successful
        if (!response.ok) {
            // If the server responded with an error (e.g., 404, 500), throw an error.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Get the JSON data from the response (e.g., { answer: "Here is the result." })
        const data = await response.json();
        
        // e. Display the answer from the backend in our response area.
        responseArea.textContent = data.answer;

    } catch (error) {
        // f. If anything goes wrong (network error, URL is wrong, backend is down), show an error message.
        console.error("Error making API call:", error);
        responseArea.textContent = 'Oops! Something went wrong. The backend might not be available yet. Please try again later.';
    }
});