// index.js

const BACKEND_URL = 'https://all-of-me.onrender.com/ask';

// Get references to ALL our interactive elements
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const authTokenInput = document.getElementById('auth-token-input');
const responseArea = document.getElementById('response-area');
const iconCards = document.querySelectorAll('.icon-card');
const submitButton = document.querySelector('#prompt-form button'); // NEW: Get the button itself
const fallbackHint = document.getElementById('fallback-hint'); // <-- ADD THIS

// Event listener for clicking the topic icons (unchanged)
iconCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
    });
});

// UPDATED Event listener for submitting the main form
promptForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const userQuestion = promptInput.value.trim();
    const authToken = authTokenInput.value.trim();

    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // --- 1. PREPARE THE UI FOR A NEW REQUEST ---

    // Disable the button to prevent multiple submissions
    submitButton.disabled = true;

    // Don't Clear the PROMPT input box for retry, but leave the auth token
    // promptInput.value = '';

    // Gather the topics from the selected icons
    const selectedCards = document.querySelectorAll('.icon-card.selected');
    const selectedTopics = Array.from(selectedCards).map(card => card.dataset.topic);
    
    // Make the response area visible and show the user's prompt and a "thinking" message.
    // This also clears any previous response.
    responseArea.style.display = 'block';
    responseArea.innerHTML = `
        <div class="prompt-echo">
            <strong>Your Prompt:</strong>
            <p>${userQuestion}</p>
        </div>
        <hr>
        <div class="response-content">
            <strong>AI's Response:</strong>
            <p class="thinking">Thinking...</p>
        </div>
    `;

    // --- 2. MAKE THE API CALL ---
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userQuestion,
                topics: selectedTopics,
                authToken: authToken
            })
        });
        
        const data = await response.json();
        
        // Find the "thinking" paragraph to replace it
        const responseParagraph = responseArea.querySelector('.thinking');
        // First, ALWAYS hide the hint at the start of a new response.
        fallbackHint.style.display = 'none';

        if (!response.ok) {
            // If the backend sent a specific error message, display it, otherwise throw an error
            responseParagraph.textContent = data.answer || `An error occurred on the server (Status: ${response.status}).`;
        } else {
            // Display the successful answer from Gemini
            responseParagraph.innerHTML = marked.parse(data.answer);

            if (data.modelType === 'fallback') {
                fallbackHint.style.display = 'block'; // Make the hint visible
            }
        }

    } catch (error) {
        // Handle network errors or other issues
        console.error("Error making API call:", error);
        const responseParagraph = responseArea.querySelector('.thinking');
        responseParagraph.textContent = 'Oops! Could not connect to the server. Please check your connection and try again.';
    } finally {
        // --- 3. RE-ENABLE THE BUTTON ---
        // This 'finally' block runs whether the API call succeeded or failed,
        // ensuring the user is never stuck with a disabled button.
        submitButton.disabled = false;
    }
});