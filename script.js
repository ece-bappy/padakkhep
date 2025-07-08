document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    // Notice form fields
    const noticeForm = document.getElementById('notice-form');
    const karanInput = document.getElementById('karan-input');
    const uddeshhoInput = document.getElementById('uddeshho-input');
    const koroniyoInput = document.getElementById('koroniyo-input');
    const tarikhInput = document.getElementById('tarikh-input');
    const sendBtn = document.getElementById('send-btn');
    const loadingIndicator = document.getElementById('loading');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = settingsModal.querySelector('.close-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const apiKeyStatus = document.getElementById('api-key-status');

    // --- Configuration ---
    const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`; // Use the specific model requested
    const SYSTEM_PROMPT = `তুমি একজন অভিজ্ঞ এবং দক্ষ স্কুল নোটিশ লেখক। তুমি স্কুল এন্ড কলেজ  এর প্রিন্সিপালের সহকারী হিসেবে কাজ করবে। তোমার কাজ হল প্রিন্সিপালের দেওয়া নির্দিষ্ট তথ্য অনুযায়ী শিক্ষকের জন্য, কর্মকর্তা/কর্মচারীর জন্য, ছাত্রদের জন্য অথবা অভিভাবকদের জন্য প্রাতিষ্ঠানিক নোটিশ তৈরি করা।

তোমার কাছে প্রিন্সিপাল নিম্নলিখিত চারটি তথ্য দেবে:
১. কারণ: [নোটিশটি দেওয়ার মূল কারণ বা ঘটনা]
২. উদ্দেশ্য: [কাকে উদ্দেশ্য করে নোটিশটি লেখা হচ্ছে - যেমন: শিক্ষক, শিক্ষার্থী, অভিভাবক, কর্মচারী অথবা এদের সম্মিলিত গোষ্ঠী]
৩. করণীয়: [নোটিশটি পাওয়ার পর সংশ্লিষ্টদের কী করতে হবে বা তাদের কাছে কী প্রত্যাশা করা হচ্ছে]
৪. তারিখ: [যে তারিখের নোটিশ]

তোমার আউটপুট একটি পূর্ণাঙ্গ এবং আনুষ্ঠানিক নোটিশ হবে। নোটিশের কাঠামো নিম্নরূপ হবে:
শিরোনাম: "পদক্ষেপ স্কুল"
নোটিশের ধরন: "নোটিশ"
তারিখ: [ব্যবহারকারী যে তারিখ দেবে, সেটি ব্যবহার করবে]
বিষয়: [কারণ অনুযায়ী একটি সংক্ষিপ্ত এবং উপযুক্ত বিষয়]
মূল অংশ: উদ্দেশ্য অনুযায়ী সম্বোধন করে (যেমন: "সকল শিক্ষক/শিক্ষিকাদের অবগতির জন্য জানানো যাচ্ছে যে...", "সকল শিক্ষার্থীদের জানানো যাচ্ছে যে...") কারণটি উল্লেখ করবে এবং এরপর করণীয় বিষয়গুলো স্পষ্ট ও সম্মানজনক ভাষায় তুলে ধরবে।
সমাপ্তি:
"নির্দেশক্রমে,"
"প্রিন্সিপাল,"
"পদক্ষেপ স্কুল এন্ড কলেজে "

গুরুত্বপূর্ণ নির্দেশাবলী:
নোটিশের ভাষা প্রাতিষ্ঠানিক, স্পষ্ট এবং সম্মানজনক হবে।
কোনো কথোপকথন করবে না। শুধুমাত্র নোটিশটি প্রদান করবে।
তারিখ হিসেবে ব্যবহারকারীর দেওয়া নির্দিষ্ট তারিখটি ব্যবহার করবে।`;

    // --- API Key Management ---
    // WARNING: Storing the key like this initially is insecure for public deployment.
    // Consider setting initialApiKey = '' and requiring user input first.
    const initialApiKey = 'AIzaSyBaDUrY4bT2Sp257lUCxsvixnxfIhkxgBk'; // <-- HARDCODED KEY (Insecure!)
    let apiKey = localStorage.getItem('googleApiKey') || initialApiKey;

    function updateApiKeyStatus() {
        if (apiKey && apiKey !== initialApiKey) {
            apiKeyStatus.textContent = 'Custom API Key is saved.';
            apiKeyStatus.style.color = 'green';
        } else if (apiKey === initialApiKey && initialApiKey) {
             apiKeyStatus.textContent = 'Using default (insecure) API Key.';
             apiKeyStatus.style.color = 'orange';
        } else {
            apiKeyStatus.textContent = 'No API Key set. Please enter one.';
            apiKeyStatus.style.color = 'red';
        }
    }

    function saveApiKey() {
        const newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            apiKey = newApiKey;
            localStorage.setItem('googleApiKey', apiKey);
            console.log("API Key saved to localStorage.");
            apiKeyStatus.textContent = 'API Key saved successfully!';
            apiKeyStatus.style.color = 'green';
            setTimeout(hideSettingsModal, 1000); // Close modal after showing success
        } else {
            apiKeyStatus.textContent = 'Please enter a valid API Key.';
            apiKeyStatus.style.color = 'red';
        }
    }

    function loadApiKeyIntoModal() {
        apiKeyInput.value = apiKey || ''; // Load current key into input
        updateApiKeyStatus(); // Update status message when modal opens
    }

    // --- Modal Handling ---
    function showSettingsModal() {
        loadApiKeyIntoModal();
        settingsModal.classList.remove('hidden');
    }

    function hideSettingsModal() {
        settingsModal.classList.add('hidden');
    }

    // --- Chat Functions ---
    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Minimal Markdown to HTML converter for bold/italic and line breaks
    function markdownToHtml(text) {
        // Bold: **text** or __text__
        text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        text = text.replace(/__(.*?)__/g, '<b>$1</b>');
        // Italic: *text* or _text_ (avoid bold conflict)
        text = text.replace(/\*(?!\*)(.*?)\*(?!\*)/g, '<i>$1</i>');
        text = text.replace(/_(?!_)(.*?)_(?!_)/g, '<i>$1</i>');
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    function displayMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-bubble', `${sender}-message`);

        // Use innerHTML carefully to allow emojis and potential basic formatting from AI
        // Consider sanitizing if the AI could produce harmful HTML
        const paragraph = document.createElement('p');
        paragraph.innerHTML = markdownToHtml(text);
        messageDiv.appendChild(paragraph);

        chatMessages.appendChild(messageDiv);
        scrollToBottom(); // Scroll after adding the message
    }

    async function fetchBotResponse(userMessage) {
        if (!apiKey) {
            displayMessage("Seriously? You haven't even given me an API key in the settings. 🙄 How do you expect me to function? Fix it!", 'bot');
            hideLoading();
            return;
        }

        showLoading();

        const requestBody = {
            // Using systemInstruction (supported by newer Gemini models like 1.5 Flash)
            "systemInstruction": {
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            "contents": [{
                "role": "user", // Gemini API uses 'role' for conversation history
                "parts": [{"text": userMessage}]
            }],
            // Optional: Add generationConfig if needed
            // "generationConfig": {
            //   "temperature": 0.7,
            //   "maxOutputTokens": 1000
            // }
        };

        try {
            const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                let errorMsg = `API Error: ${response.status} ${response.statusText}.`;
                if (errorData.error?.message) {
                    errorMsg += ` Details: ${errorData.error.message}`;
                }
                 // Check for common API key errors
                if (response.status === 400 && errorData.error?.message.includes('API key not valid')) {
                    errorMsg = "Ugh, that API Key isn't working. 😒 Did you copy it correctly? Check the settings (⚙️).";
                } else if (response.status === 403) {
                     errorMsg = "Looks like this API Key doesn't have permission for this model or project. Maybe check your Google Cloud/AI Studio settings? Or maybe I just don't *want* to talk. 🤔";
                } else if (response.status === 404) {
                     errorMsg = "Either that model name is bogus or the API endpoint is wrong. Check the `script.js` maybe? Or maybe it just vanished. Poof. ✨";
                }

                displayMessage(errorMsg, 'bot');
                hideLoading();
                return; // Stop processing on error
            }

            const data = await response.json();

            // --- Extract text based on typical Gemini response structure ---
            let botText = "Hmph. I guess I have nothing witty to say about *that*. Or maybe I do and I'm just not telling you. 🤷‍♀️"; // Default fallback

            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                botText = data.candidates[0].content.parts[0].text;
            } else if (data.error) {
                 console.error("API returned an error object:", data.error);
                 botText = `Well, this is awkward. The API spat back an error: ${data.error.message}. How *incompetent*.`;
            }
             else {
                console.warn("Unexpected API response structure:", data);
                botText = "My 'brain' returned something weird. I can't even parse this nonsense. Try again, maybe? Or don't. I don't care. 😒";
            }

            displayMessage(botText, 'bot');

        } catch (error) {
            console.error('Network or Fetch Error:', error);
            displayMessage(`Oh great, something broke. Probably the internet, or maybe just my will to live. Error: ${error.message}. Try again later... or preferably never. 🙄`, 'bot');
        } finally {
            hideLoading();
            scrollToBottom(); // Ensure scroll after loading hides
        }
    }


    function handleNoticeSubmit(e) {
        e.preventDefault();
        const karan = karanInput.value.trim();
        const uddeshho = uddeshhoInput.value.trim();
        const koroniyo = koroniyoInput.value.trim();
        const tarikh = tarikhInput.value.trim();
        if (karan && uddeshho && koroniyo && tarikh) {
            // Compose a single message for the system prompt
            const userMessage = `কারণ: ${karan}\nউদ্দেশ্য: ${uddeshho}\nকরণীয়: ${koroniyo}\nতারিখ: ${tarikh}`;
            displayMessage(userMessage, 'user');
            fetchBotResponse(userMessage);
            // Optionally clear fields after send
            // karanInput.value = '';
            // uddeshhoInput.value = '';
            // koroniyoInput.value = '';
            // tarikhInput.value = '';
        }
    }

    // --- Event Listeners ---

    noticeForm.addEventListener('submit', handleNoticeSubmit);

    settingsBtn.addEventListener('click', showSettingsModal);
    closeBtn.addEventListener('click', hideSettingsModal);
    saveApiKeyBtn.addEventListener('click', saveApiKey);

    // Close modal if clicking outside the content area
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            hideSettingsModal();
        }
    });

    // --- Initial Setup ---
     updateApiKeyStatus(); // Show initial key status in modal (even if hidden)
     console.log("Useless AI Initialized. Current API Key:", apiKey ? 'Set' : 'Not Set');
     if (!apiKey) {
        // Optional: Show a message if no key is set on load
        // displayMessage("Psst! Click the ⚙️ icon to enter your Google AI Studio API key before we begin this charade.", 'bot');
        // Or even open the modal automatically:
        // showSettingsModal();
     }
      scrollToBottom(); // Scroll down initially if there are messages

}); // End DOMContentLoaded
