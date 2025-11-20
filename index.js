// index.js

// const BACKEND_URL = 'https://all-of-me.onrender.com/ask';
// backup
const BACKEND_URL = 'https://all-of-me-eight.vercel.app/ask';

// Interactive Elements
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const authTokenInput = document.getElementById('auth-token-input');
const responseArea = document.getElementById('response-area');
const iconCards = document.querySelectorAll('.icon-card');
const submitButtons = document.querySelectorAll('#prompt-form button'); 
const fallbackHint = document.getElementById('fallback-hint'); 
const dumbModelHint = document.getElementById('dumb-model-hint'); 

// Spark Chips
const chipButtons = document.querySelectorAll('.chip-btn');
chipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const textToAdd = btn.getAttribute('data-text');
        const currentText = promptInput.value.trim();

        if (currentText.length > 0) {
            promptInput.value = currentText + " " + textToAdd;
        } else {
            promptInput.value = textToAdd;
        }
        adjustTextareaHeight();
        promptInput.focus();
    });
});

// Textarea Auto-Resize
function adjustTextareaHeight() {
    promptInput.style.height = 'auto';
    promptInput.style.height = (promptInput.scrollHeight + 2) + 'px';
}
promptInput.addEventListener('input', adjustTextareaHeight);
adjustTextareaHeight();

// Topic Select
iconCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
    });
});

// Submit
promptForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const userQuestion = promptInput.value.trim();
    const authToken = authTokenInput.value.trim();
    const clickedButton = event.submitter;
    const modelRequested = clickedButton.value;

    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // Reset
    submitButtons.forEach(button => button.disabled = true);
    fallbackHint.style.display = 'none';
    dumbModelHint.style.display = 'none';

    const selectedCards = document.querySelectorAll('.icon-card.selected');
    const selectedTopics = Array.from(selectedCards).map(card => card.dataset.topic);
    
    responseArea.style.display = 'block';
    
    // Thinking Animation
    responseArea.innerHTML = `
        <div class="prompt-echo">
            <div style="font-size:0.75rem; opacity:0.5; text-transform:uppercase;">You Asked</div>
            <div style="font-size: 1.1rem; font-style: italic; color: white; margin-top:5px;">${userQuestion}</div>
        </div>
        <hr style="border: 0; border-top: 1px solid #2d3748; margin: 1.5em 0;">
        <div class="response-content">
             <div class="thinking thinking-box">
                <span class="loader"></span>
                <span style="font-weight: 500; animation: pulse 1.5s infinite;">Analysing Journals...</span>
            </div>
        </div>
    `;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: userQuestion,
                topics: selectedTopics,
                authToken: authToken,
                modelRequested: modelRequested
            })
        });
        const data = await response.json();
        const responseContainer = responseArea.querySelector('.response-content');

        if (!response.ok) {
            responseContainer.innerHTML = `<span style="color: #f87171;">${data.answer || `Server Error: ${response.status}`}</span>`;
        } else {
            responseContainer.innerHTML = marked.parse(data.answer);
            
            if (data.modelRequested === 'primary' && data.modelType === 'fallback') {
                fallbackHint.style.display = 'block';
            }
            else if (data.modelRequested === 'fallback' && data.modelType === 'fallback') {
                dumbModelHint.style.display = 'block';
            }
        }

    } catch (error) {
        console.error("Error:", error);
        const responseContainer = responseArea.querySelector('.response-content');
        responseContainer.innerHTML = '<span style="color: #f87171;">Connection failed. Please try again later.</span>';
    } finally {
        submitButtons.forEach(button => button.disabled = false);
    }
});