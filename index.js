// index.js

const BACKEND_URL = 'https://all-of-me.onrender.com/ask';

// Get references to ALL our interactive elements
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const authTokenInput = document.getElementById('auth-token-input'); // NEW
const responseArea = document.getElementById('response-area');
const iconCards = document.querySelectorAll('.icon-card'); // For selectable topics

// Event listener for clicking the topic icons
iconCards.forEach(card => {
    card.addEventListener('click', () => {
        // Toggle the 'selected' class on any card that is clicked
        card.classList.toggle('selected');
    });
});

// Event listener for submitting the main form
promptForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent page reload

    const userQuestion = promptInput.value.trim();
    const authToken = authTokenInput.value.trim(); // NEW: Get the token value

    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // NEW: Gather the topics from the selected icons
    const selectedCards = document.querySelectorAll('.icon-card.selected');
    const selectedTopics = Array.from(selectedCards).map(card => card.dataset.topic);

    responseArea.style.display = 'block';
    responseArea.textContent = 'Thinking...';
    
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // UPDATED: The body now includes the prompt, selected topics, and auth token
            body: JSON.stringify({
                prompt: userQuestion,
                topics: selectedTopics,
                authToken: authToken
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // If the backend sent a specific error message (like our "dating denied" one), display it
            if (data.answer) {
                 responseArea.textContent = data.answer;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } else {
            // Display the successful answer from Gemini
            responseArea.textContent = data.answer;
        }

    } catch (error) {
        console.error("Error making API call:", error);
        responseArea.textContent = 'Oops! An error occurred while communicating with the server. Please try again later.';
    }
});