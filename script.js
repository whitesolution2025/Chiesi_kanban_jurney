document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTY DOM ---
    const initialControls = document.getElementById('initial-controls');
    const manualBtn = document.getElementById('manual-btn');
    const resetContainer = document.getElementById('reset-container');
    const resetBtn = document.getElementById('reset-btn');
    const manualControls = document.getElementById('manual-controls');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const stepCounter = document.getElementById('step-counter');
    const kanbanBoard = document.getElementById('kanban-board');
    const neuralCanvas = document.getElementById('neural-network-canvas');
    const aiParticlesCanvas = document.getElementById('ai-particles-canvas');
    
    // Elementy czatu
    const chatButton = document.getElementById('ai-chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const closeChatBtn = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');

    // Elementy wideo
    const videoBtn = document.getElementById('video-btn');
    const videoModal = document.getElementById('video-modal');
    const closeVideoBtn = document.getElementById('close-video');
    const youtubeVideo = document.getElementById('youtube-video');

    const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/y9jRRaP0H48?si=aM85sl0oTUafQ98j";

    // --- DANE ---
    const journeyData = [
        { phase: { phaseNumber: 1 }, steps: [
            { title: 'ZAPROSZENIE', method: '(e-mail / post / SMS / MMS / ADS)', desc: 'Lekarz odkrywa wydarzenie' },
            { title: 'LANDING PAGE', method: '(wideo-zapowiedź / agenda)', desc: 'Sprawdza szczegóły, czuje innowację' },
            { title: 'INTERAKCJA', method: '(quiz "trenuj AI" / czat z botem / CSR)', desc: 'Angażuje się, współtworzy wydarzenie' },
            { title: 'REJESTRACJA', method: '(weryfikacja NPWZ + baza archiwalna)', desc: 'Zapisuje się w 30 sekund' },
            { title: 'OCZEKIWANIE', method: '(automatyczne przypomnienia)', desc: 'Otrzymuje "magic link", jest gotowy' }
        ]},
        { phase: { phaseNumber: 2 }, steps: [
            { title: 'DOŁĄCZENIE', method: '(personalizowany link)', desc: 'Lekarz wchodzi jednym kliknięciem / NPWZ' },
            { title: 'POWITANIE AI', method: '(start akcji charytatywnej)', desc: 'Czuje się zauważony, jego obecność ma znaczenie' },
            { title: 'INTERAKCJA LIVE', method: '(czat z AI / ankiety / oceny)', desc: 'Aktywnie uczestniczy, nie tylko ogląda' },
            { title: 'WARSZTATY', method: '(networking w grupie)', desc: 'Nawiązuje relacje, dyskutuje w małym gronie' }
        ]},
        { phase: { phaseNumber: 3 }, steps: [
            { title: 'PODSUMOWANIE AI', method: '(spersonalizowane streszczenie video)', desc: 'Lekarz otrzymuje wiedzę dopasowaną do swoich potrzeb' },
            { title: 'BIBLIOTEKA VOD', method: '(wyszukiwanie w treści nagrań)', desc: 'Wraca do wiedzy, kiedy chce i jak chce' },
            { title: 'KONTAKT', method: '(zapowiedź nowości produktowych)', desc: 'Pozostaje w relacji z marką' }
        ]}
    ];

    // --- ZMIENNE STANU ---
    let currentStepIndex = -1;
    let allSteps = [];
    let kanbanVisible = false;

    const prepareAllSteps = () => {
        allSteps = [];
        journeyData.forEach(data => {
            data.steps.forEach(step => {
                allSteps.push({ ...step, phaseNumber: data.phase.phaseNumber });
            });
        });
    };

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- FUNKCJE WIDEO I CZATU ---
    const openVideo = () => {
        youtubeVideo.src = YOUTUBE_EMBED_URL;
        videoModal.classList.add('visible');
    };
    const closeVideo = () => {
        videoModal.classList.remove('visible');
        youtubeVideo.src = "";
    };
    const openChat = () => { chatModal.classList.add('visible'); chatInput.focus(); };
    const closeChat = () => { chatModal.classList.remove('visible'); };
    const addMessage = (message, isUser = false) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'user-message' : 'ai-message';
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };
    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;
        addMessage(message, true);
        chatInput.value = '';
        setTimeout(() => addMessage("Dziękuję za pytanie! Przekazuję je do naszego zespołu."), 1000);
    };

    // --- FUNKCJE KANBAN ---
    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
    };

    const showKanbanBoard = () => {
        if (!kanbanVisible) {
            kanbanBoard.classList.add('visible');
            kanbanVisible = true;
        }
    };

    const addCardToKanban = async (stepData) => {
        const kanbanContent = document.getElementById(`kanban-phase-${stepData.phaseNumber}`);
        if (!kanbanContent) return;

        const kanbanCard = document.createElement('div');
        kanbanCard.className = 'kanban-card';
        kanbanCard.setAttribute('data-title', stepData.title);
        kanbanCard.innerHTML = `
            <div class="card-title">${stepData.title}</div>
            <div class="card-method">${stepData.method}</div>
            <div class="card-description">${stepData.desc}</div>
        `;
        kanbanContent.appendChild(kanbanCard);
        await wait(50);
        kanbanCard.classList.add('visible');
    };

    const removeCardFromKanban = (stepData) => {
        const kanbanContent = document.getElementById(`kanban-phase-${stepData.phaseNumber}`);
        if (!kanbanContent) return;
        const cardToRemove = kanbanContent.querySelector(`.kanban-card[data-title="${stepData.title}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
    };

    // --- FUNKCJE NAWIGACJI ---
    const updateStepCounter = () => {
        const current = currentStepIndex + 1;
        stepCounter.textContent = `${current} / ${allSteps.length}`;
        prevBtn.disabled = currentStepIndex < 0;
        nextBtn.disabled = currentStepIndex >= allSteps.length - 1;
    };

    const nextStep = () => {
        if (currentStepIndex < allSteps.length - 1) {
            currentStepIndex++;
            const stepData = allSteps[currentStepIndex];
            addCardToKanban(stepData);
            updateStepCounter();

            // Sprawdza, czy to ostatni krok i uruchamia confetti
            if (currentStepIndex === allSteps.length - 1) {
                setTimeout(triggerConfetti, 400);
            }
        }
    };

    const prevStep = () => {
        if (currentStepIndex >= 0) {
            const stepData = allSteps[currentStepIndex];
            removeCardFromKanban(stepData);
            currentStepIndex--;
            updateStepCounter();
        }
    };

    const startManualMode = () => {
        initialControls.style.display = 'none';
        manualControls.classList.add('visible');
        resetContainer.classList.add('visible');
        showKanbanBoard();
        updateStepCounter();
    };

    const resetJourney = () => {
        window.location.reload();
    };
    
    // --- ANIMACJE TŁA (MINIMALISTYCZNA) ---
    const setupBackground = () => {
        if (!neuralCanvas) return;
        const ctx = neuralCanvas.getContext('2d');
        neuralCanvas.classList.add('visible');
        if (aiParticlesCanvas) aiParticlesCanvas.classList.add('visible');

        let nodes = [];

        const initializeNodes = () => {
            neuralCanvas.width = window.innerWidth;
            neuralCanvas.height = window.innerHeight;
            nodes = Array.from({ length: 60 }, () => ({
                x: Math.random() * neuralCanvas.width,
                y: Math.random() * neuralCanvas.height,
                radius: Math.random() * 2 + 3,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
            }));
        };
        
        function animateNeural() {
            ctx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);
            
            nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                if (node.x < 0 || node.x > neuralCanvas.width) {
                    node.vx *= -1;
                    node.x = Math.max(0, Math.min(neuralCanvas.width, node.x));
                }
                if (node.y < 0 || node.y > neuralCanvas.height) {
                    node.vy *= -1;
                    node.y = Math.max(0, Math.min(neuralCanvas.height, node.y));
                }
            });
            
            ctx.strokeStyle = 'rgba(172, 4, 100, 0.6)';
            ctx.lineWidth = 1.5;
            
            for (let i = 0; i < nodes.length; i++) {
                let connections = 0;
                for (let j = i + 1; j < nodes.length; j++) {
                    if (connections >= 3) break;
                    
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 100) {
                        const opacity = (100 - dist) / 100 * 0.7;
                        ctx.strokeStyle = `rgba(172, 4, 100, ${opacity})`;
                        
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                        
                        connections++;
                    }
                }
            }
            
            ctx.fillStyle = 'rgba(186, 0, 102, 0.9)';
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            
            requestAnimationFrame(animateNeural);
        }

        initializeNodes();
        animateNeural();
        window.addEventListener('resize', initializeNodes);
    };

    // --- EVENT LISTENERS ---
    manualBtn.addEventListener('click', startManualMode);
    resetBtn.addEventListener('click', resetJourney);
    nextBtn.addEventListener('click', nextStep);
    prevBtn.addEventListener('click', prevStep);

    chatButton.addEventListener('click', openChat);
    closeChatBtn.addEventListener('click', closeChat);
    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());

    videoBtn.addEventListener('click', openVideo);
    closeVideoBtn.addEventListener('click', closeVideo);

    chatModal.addEventListener('click', (e) => e.target === chatModal && closeChat());
    videoModal.addEventListener('click', (e) => e.target === videoModal && closeVideo());

    document.addEventListener('keydown', (e) => {
        if (manualControls.classList.contains('visible')) {
            if (e.key === 'ArrowRight') nextStep();
            else if (e.key === 'ArrowLeft') prevStep();
        }
        if (e.key === 'Escape') {
            if (chatModal.classList.contains('visible')) closeChat();
            if (videoModal.classList.contains('visible')) closeVideo();
        }
    });

    // --- INICJALIZACJA ---
    prepareAllSteps();
    window.addEventListener('load', setupBackground);
});