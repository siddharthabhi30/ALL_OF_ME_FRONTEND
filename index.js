// index.js

// const BACKEND_URL = 'https://all-of-me.onrender.com/ask';
// backup
const BACKEND_URL = 'https://all-of-me-eight.vercel.app/ask';

// --- MODEL CONFIGURATION (Easy to add more here) ---
const MODEL_CONFIG = {
    'primary': {
        estimatedMs: 15000, // 15 Seconds
        loadingText: 'Deep Thinking in progress...',
        label: 'Intelligent Model'
    },
    'fallback': {
        estimatedMs: 5000, // 5 Seconds
        loadingText: 'Generating quick answer...',
        label: 'Speed Model'
    },
    // Example of adding a new one:
    // 'gpt5': { estimatedMs: 25000, loadingText: 'Super intelligence...', label: 'Future' }
};


// References
const promptForm = document.getElementById('prompt-form');
const promptInput = document.getElementById('prompt-input');
const authTokenInput = document.getElementById('auth-token-input');
const responseArea = document.getElementById('response-area');
const iconCards = document.querySelectorAll('.icon-card');
const submitButtons = document.querySelectorAll('#prompt-form button'); 
const fallbackHint = document.getElementById('fallback-hint'); 
const dumbModelHint = document.getElementById('dumb-model-hint'); 

// Chip Buttons
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

// Textarea Resize
function adjustTextareaHeight() {
    promptInput.style.height = 'auto';
    promptInput.style.height = (promptInput.scrollHeight + 2) + 'px';
}
promptInput.addEventListener('input', adjustTextareaHeight);
adjustTextareaHeight();

// Topic Toggle
iconCards.forEach(card => {
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
    });
});


// --- MAIN SUBMIT LOGIC ---
promptForm.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const userQuestion = promptInput.value.trim();
    const authToken = authTokenInput.value.trim();
    const clickedButton = event.submitter;
    const modelRequested = clickedButton.value;

    // Get settings for selected model (or default to fallback if not found)
    const config = MODEL_CONFIG[modelRequested] || MODEL_CONFIG['fallback'];

    if (!userQuestion) {
        alert("Please enter a question.");
        return;
    }

    // UI Lock
    submitButtons.forEach(button => button.disabled = true);
    fallbackHint.style.display = 'none';
    dumbModelHint.style.display = 'none';

    const selectedCards = document.querySelectorAll('.icon-card.selected');
    const selectedTopics = Array.from(selectedCards).map(card => card.dataset.topic);
    
    responseArea.style.display = 'block';
    
    // --- RENDER LOADING UI WITH PROGRESS BAR ---
    responseArea.innerHTML = `
        <div class="prompt-echo">
            <div style="font-size:0.75rem; opacity:0.5; text-transform:uppercase;">You Asked</div>
            <div style="font-size: 1.1rem; font-style: italic; color: white; margin-top:5px;">${userQuestion}</div>
        </div>
        <hr style="border: 0; border-top: 1px solid #2d3748; margin: 1.5em 0;">
        
        <div class="response-content">
             <!-- Thinking Label -->
             <div class="thinking-header">
                <div class="thinking-label">
                    <span class="loader"></span>
                    <span class="pulse-text">${config.loadingText}</span>
                </div>
                <span style="font-size:0.8rem; opacity:0.6;">~${config.estimatedMs / 1000}s est.</span>
             </div>

             <!-- PROGRESS BAR TRACK -->
             <div class="progress-track">
                <div class="progress-fill" id="progress-fill"></div>
             </div>
        </div>
    `;

    // START ANIMATION LOGIC
    // We grab the bar immediately after rendering
    const progressBar = document.getElementById('progress-fill');
    
    // We allow a small browser tick before starting the transition
    requestAnimationFrame(() => {
        // Set the transition time to the estimated duration (linear curve)
        progressBar.style.transition = `width ${config.estimatedMs}ms linear`;
        // We target 95% so it doesn't look "done" if the backend is slow
        progressBar.style.width = '95%';
    });


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

        // FINISH PROGRESS BAR ANIMATION (Snap to 100%)
        if(progressBar) {
            progressBar.style.transition = 'width 0.3s ease-out';
            progressBar.style.width = '100%';
        }

        // Short delay to let the 100% visual settle before showing text
        setTimeout(() => {
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
        }, 400); // 400ms delay for visual polish

    } catch (error) {
        console.error("Error:", error);
        const responseContainer = responseArea.querySelector('.response-content');
        responseContainer.innerHTML = '<span style="color: #f87171;">Connection failed. Please try again later.</span>';
    } finally {
        submitButtons.forEach(button => button.disabled = false);
    }
});