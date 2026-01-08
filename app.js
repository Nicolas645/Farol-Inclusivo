// Site Educacional Acessível - JavaScript

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa todas as funcionalidades
    initAccessibilityControls();
    initNavigation();
    initModules();
    initModals();
    initQuiz();
    initAudioReader();
    
    // Configura a navegação por teclado
    setupKeyboardNavigation();
    
    // Verifica se há preferências salvas
    loadUserPreferences();
});

// =================== CONTROLES DE ACESSIBILIDADE ===================

function initAccessibilityControls() {
    // Alternar modo de alto contraste
    const contrastToggle = document.getElementById('contrast-toggle');
    contrastToggle.addEventListener('click', toggleHighContrast);
    
    // Aumentar tamanho da fonte
    const fontIncrease = document.getElementById('font-increase');
    fontIncrease.addEventListener('click', increaseFontSize);
    
    // Diminuir tamanho da fonte
    const fontDecrease = document.getElementById('font-decrease');
    fontDecrease.addEventListener('click', decreaseFontSize);
    
    // Leitura em voz alta
    const readAloudBtn = document.getElementById('read-aloud');
    const stopReadBtn = document.getElementById('stop-read');
    readAloudBtn.addEventListener('click', startTextToSpeech);
    stopReadBtn.addEventListener('click', stopTextToSpeech);
    
    // Ajuda de navegação por teclado
    const keyboardHelpBtn = document.getElementById('keyboard-help');
    keyboardHelpBtn.addEventListener('click', showKeyboardHelp);
}

let isHighContrast = false;
let currentFontSize = 100; // porcentagem

function toggleHighContrast() {
    const body = document.body;
    isHighContrast = !isHighContrast;
    
    if (isHighContrast) {
        body.classList.add('high-contrast');
        showNotification('Modo de alto contraste ativado');
    } else {
        body.classList.remove('high-contrast');
        showNotification('Modo de alto contraste desativado');
    }
    
    // Salvar preferência
    savePreference('highContrast', isHighContrast);
}

function increaseFontSize() {
    if (currentFontSize < 150) {
        currentFontSize += 10;
        document.body.style.fontSize = currentFontSize + '%';
        showNotification(`Tamanho da fonte aumentado para ${currentFontSize}%`);
        savePreference('fontSize', currentFontSize);
    } else {
        showNotification('Tamanho máximo da fonte atingido');
    }
}

function decreaseFontSize() {
    if (currentFontSize > 80) {
        currentFontSize -= 10;
        document.body.style.fontSize = currentFontSize + '%';
        showNotification(`Tamanho da fonte diminuído para ${currentFontSize}%`);
        savePreference('fontSize', currentFontSize);
    } else {
        showNotification('Tamanho mínimo da fonte atingido');
    }
}

// =================== LEITURA EM VOZ ALTA ===================

let speechSynthesis = window.speechSynthesis;
let isSpeaking = false;

function startTextToSpeech() {
    if (isSpeaking) {
        stopTextToSpeech();
        return;
    }
    
    // Verifica se a API de síntese de fala está disponível
    if (!speechSynthesis) {
        showNotification('Leitura em voz alta não disponível neste navegador');
        return;
    }
    
    // Obtém o conteúdo a ser lido
    let content = '';
    const activeModal = document.querySelector('.modal:not(.hidden)');
    
    if (activeModal) {
        // Lê o conteúdo do modal ativo
        const contentTab = document.getElementById('content-tab');
        if (contentTab && contentTab.classList.contains('active')) {
            content = contentTab.textContent;
        } else {
            content = activeModal.textContent;
        }
    } else {
        // Lê o conteúdo da seção atual
        const mainContent = document.querySelector('main').textContent;
        content = mainContent;
    }
    
    // Remove textos desnecessários
    content = content.replace(/\s+/g, ' ').trim();
    
    if (!content) {
        showNotification('Nenhum conteúdo disponível para leitura');
        return;
    }
    
    // Cria a mensagem de fala
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Velocidade mais lenta para melhor compreensão
    
    utterance.onstart = function() {
        isSpeaking = true;
        document.getElementById('read-aloud').innerHTML = '<i class="fas fa-pause"></i><span class="btn-label">Pausar</span>';
        showNotification('Leitura em voz alta iniciada');
    };
    
    utterance.onend = function() {
        isSpeaking = false;
        document.getElementById('read-aloud').innerHTML = '<i class="fas fa-volume-up"></i><span class="btn-label">Ouvir</span>';
        showNotification('Leitura em voz alta concluída');
    };
    
    utterance.onerror = function() {
        isSpeaking = false;
        document.getElementById('read-aloud').innerHTML = '<i class="fas fa-volume-up"></i><span class="btn-label">Ouvir</span>';
        showNotification('Erro na leitura em voz alta');
    };
    
    speechSynthesis.speak(utterance);
}

function stopTextToSpeech() {
    if (speechSynthesis && isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        document.getElementById('read-aloud').innerHTML = '<i class="fas fa-volume-up"></i><span class="btn-label">Ouvir</span>';
        showNotification('Leitura em voz alta interrompida');
    }
}

function initAudioReader() {
    // Configuração dos controles de áudio dentro dos módulos
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                this.classList.remove('active');
                this.innerHTML = '<i class="fas fa-volume-up"></i><span>Ouvir conteúdo</span>';
                stopTextToSpeech();
            } else {
                // Para qualquer áudio ativo antes de iniciar novo
                document.querySelectorAll('.module-control-btn.active').forEach(btn => {
                    btn.classList.remove('active');
                    btn.innerHTML = btn.innerHTML.replace('Parar', 'Ouvir conteúdo');
                });
                
                this.classList.add('active');
                this.innerHTML = '<i class="fas fa-stop"></i><span>Parar áudio</span>';
                startTextToSpeech();
            }
        });
    }
}

// =================== NAVEGAÇÃO ===================

function initNavigation() {
    // Menu mobile toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active');
            
            // Alternar ícone do menu
            const icon = this.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                showNotification('Menu aberto');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                showNotification('Menu fechado');
            }
        });
    }
    
    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Ativar link atual na navegação
    window.addEventListener('hashchange', highlightCurrentNavLink);
    highlightCurrentNavLink();
}

function highlightCurrentNavLink() {
    const navLinks = document.querySelectorAll('.main-nav a');
    const currentHash = window.location.hash || '#home';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });
}

// =================== MÓDULOS ===================

function initModules() {
    // Abrir módulos
    const moduleButtons = document.querySelectorAll('.open-module');
    moduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleId = this.getAttribute('data-module');
            openModule(moduleId);
        });
        
        // Suporte a teclado
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const moduleId = this.getAttribute('data-module');
                openModule(moduleId);
            }
        });
    });
}

function openModule(moduleId) {
    // Mostrar modal do módulo
    const moduleModal = document.getElementById('module-modal');
    const moduleTitle = document.getElementById('module-title');
    
    // Definir título e conteúdo com base no módulo selecionado
    let title = '';
    let moduleData = {};
    
    switch(moduleId) {
        case '1':
            title = 'Módulo 1: Criação e uso de e-mail';
            moduleData = {
                progress: 30
            };
            break;
        case '2':
            title = 'Módulo 2: Navegação segura na internet';
            moduleData = {
                progress: 10
            };
            break;
        case '3':
            title = 'Módulo 3: Acesso a cursos gratuitos online';
            moduleData = {
                progress: 0
            };
            break;
        case '4':
            title = 'Módulo 4: Serviços digitais essenciais';
            moduleData = {
                progress: 0
            };
            break;
        default:
            title = 'Módulo de Aprendizado';
    }
    
    moduleTitle.textContent = title;
    
    // Atualizar indicador de progresso no modal
    updateModuleProgressInModal(moduleData.progress);
    
    // Mostrar modal
    moduleModal.style.display = 'flex';
    moduleModal.setAttribute('aria-hidden', 'false');
    
    // Focar no botão de fechar do modal
    setTimeout(() => {
        document.getElementById('close-modal').focus();
    }, 100);
    
    // Atualizar guia ativa para "Conteúdo"
    switchTab('content-tab');
    
    // Mostrar notificação
    showNotification(`Módulo ${moduleId} aberto`);
    
    // Registrar acesso ao módulo
    registerModuleAccess(moduleId);
}

function updateModuleProgressInModal(progress) {
    // Esta função atualizaria o progresso mostrado no modal
    // Implementação básica para demonstração
    console.log(`Progresso do módulo: ${progress}%`);
}

function registerModuleAccess(moduleId) {
    // Registrar que o usuário acessou este módulo
    // Em uma aplicação real, isso seria salvo no backend
    const progressKey = `module_${moduleId}_progress`;
    const currentProgress = localStorage.getItem(progressKey) || 0;
    
    // Se ainda não começou, marcar como 5% (só por acessar)
    if (parseInt(currentProgress) === 0) {
        localStorage.setItem(progressKey, '5');
        updateProgressDisplay();
    }
}

// =================== MODAIS ===================

function initModals() {
    // Modal de módulo
    const moduleModal = document.getElementById('module-modal');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Fechar modal ao clicar no botão X
    closeModalBtn.addEventListener('click', function() {
        closeModuleModal();
    });
    
    // Fechar modal ao clicar fora do conteúdo
    moduleModal.addEventListener('click', function(e) {
        if (e.target === moduleModal) {
            closeModuleModal();
        }
    });
    
    // Fechar modal com tecla Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && moduleModal.style.display === 'flex') {
            closeModuleModal();
        }
    });
    
    // Modal de ajuda de teclado
    const keyboardHelpModal = document.getElementById('keyboard-help-modal');
    const closeKeyboardHelpBtn = document.getElementById('close-keyboard-help');
    
    closeKeyboardHelpBtn.addEventListener('click', function() {
        keyboardHelpModal.style.display = 'none';
        keyboardHelpModal.setAttribute('aria-hidden', 'true');
    });
    
    keyboardHelpModal.addEventListener('click', function(e) {
        if (e.target === keyboardHelpModal) {
            keyboardHelpModal.style.display = 'none';
            keyboardHelpModal.setAttribute('aria-hidden', 'true');
        }
    });
    
    // Controles de guias no modal
    initModuleTabs();
    
    // Botão de vídeo
    const showVideoBtn = document.getElementById('show-video');
    if (showVideoBtn) {
        showVideoBtn.addEventListener('click', function() {
            switchTab('video-tab');
        });
    }
    
    // Botão de questionário
    const showQuizBtn = document.getElementById('show-quiz');
    if (showQuizBtn) {
        showQuizBtn.addEventListener('click', function() {
            switchTab('quiz-tab');
        });
    }
}

function closeModuleModal() {
    const moduleModal = document.getElementById('module-modal');
    moduleModal.style.display = 'none';
    moduleModal.setAttribute('aria-hidden', 'true');
    
    // Parar qualquer áudio em reprodução
    stopTextToSpeech();
    
    // Focar no último elemento interativo antes de abrir o modal
    const lastFocused = document.activeElement;
    if (lastFocused && lastFocused.classList.contains('open-module')) {
        lastFocused.focus();
    }
    
    showNotification('Módulo fechado');
}

function initModuleTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.textContent.toLowerCase();
            let targetTab = '';
            
            switch(tabId) {
                case 'conteúdo':
                    targetTab = 'content-tab';
                    break;
                case 'vídeo':
                    targetTab = 'video-tab';
                    break;
                case 'questionário':
                    targetTab = 'quiz-tab';
                    break;
                default:
                    targetTab = 'content-tab';
            }
            
            switchTab(targetTab);
        });
        
        // Suporte a teclado
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tabId = this.textContent.toLowerCase();
                let targetTab = '';
                
                switch(tabId) {
                    case 'conteúdo':
                        targetTab = 'content-tab';
                        break;
                    case 'vídeo':
                        targetTab = 'video-tab';
                        break;
                    case 'questionário':
                        targetTab = 'quiz-tab';
                        break;
                    default:
                        targetTab = 'content-tab';
                }
                
                switchTab(targetTab);
            }
        });
    });
}

function switchTab(tabId) {
    // Esconder todas as abas
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.setAttribute('aria-hidden', 'true');
    });
    
    // Mostrar aba selecionada
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-hidden', 'false');
    }
    
    // Atualizar botões da aba
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
        
        // Verificar qual botão corresponde à aba ativa
        let buttonText = button.textContent.toLowerCase();
        let expectedTab = '';
        
        switch(buttonText) {
            case 'conteúdo':
                expectedTab = 'content-tab';
                break;
            case 'vídeo':
                expectedTab = 'video-tab';
                break;
            case 'questionário':
                expectedTab = 'quiz-tab';
                break;
        }
        
        if (expectedTab === tabId) {
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
        }
    });
    
    // Parar áudio se estiver reproduzindo
    stopTextToSpeech();
    
    // Focar no primeiro elemento interativo da aba
    setTimeout(() => {
        const firstInteractive = activeTab.querySelector('button, input, [tabindex="0"]');
        if (firstInteractive) {
            firstInteractive.focus();
        }
    }, 50);
}

// =================== QUESTIONÁRIO ===================

function initQuiz() {
    const submitQuizBtn = document.getElementById('submit-quiz');
    const retryQuizBtn = document.getElementById('retry-quiz');
    
    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', evaluateQuiz);
    }
    
    if (retryQuizBtn) {
        retryQuizBtn.addEventListener('click', resetQuiz);
    }
}

function evaluateQuiz() {
    // Respostas corretas
    const correctAnswers = {
        q1: 'c', // Facebook
        q2: 'b', // Usar uma combinação de letras, números e símbolos
        q3: 'b'  // No campo "Para"
    };
    
    // Obter respostas do usuário
    let score = 0;
    const totalQuestions = Object.keys(correctAnswers).length;
    
    for (let question in correctAnswers) {
        const selectedOption = document.querySelector(`input[name="${question}"]:checked`);
        
        if (selectedOption && selectedOption.value === correctAnswers[question]) {
            score++;
        }
    }
    
    // Mostrar resultado
    const quizResult = document.getElementById('quiz-result');
    const scoreElement = document.getElementById('score');
    const resultMessage = document.getElementById('result-message');
    
    scoreElement.textContent = score;
    
    if (score >= 3) {
        resultMessage.textContent = 'Parabéns! Você passou no questionário. Continue assim!';
        resultMessage.style.color = 'var(--secondary-color)';
        
        // Atualizar progresso do módulo
        updateModuleProgressAfterQuiz(score, totalQuestions);
    } else {
        resultMessage.textContent = 'Tente novamente. Reveja o conteúdo e responda novamente.';
        resultMessage.style.color = '#e74c3c';
    }
    
    // Mostrar resultado e esconder formulário
    document.getElementById('quiz-form').classList.add('hidden');
    quizResult.classList.remove('hidden');
    
    // Focar no botão "Tentar novamente"
    setTimeout(() => {
        document.getElementById('retry-quiz').focus();
    }, 100);
    
    // Mostrar notificação
    showNotification(`Questionário concluído. Pontuação: ${score}/${totalQuestions}`);
}

function resetQuiz() {
    // Limpar seleções
    const quizForm = document.getElementById('quiz-form');
    const inputs = quizForm.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
        input.checked = false;
    });
    
    // Mostrar formulário e esconder resultado
    quizForm.classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    
    // Focar na primeira pergunta
    setTimeout(() => {
        const firstInput = quizForm.querySelector('input[type="radio"]');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
    
    showNotification('Questionário reiniciado');
}

function updateModuleProgressAfterQuiz(score, totalQuestions) {
    // Atualizar progresso do módulo atual com base no desempenho no questionário
    // Em uma aplicação real, isso seria salvo no backend
    
    // Determinar qual módulo está aberto (simulação)
    const moduleTitle = document.getElementById('module-title').textContent;
    let moduleId = '1'; // Padrão para módulo 1
    
    if (moduleTitle.includes('Módulo 2')) moduleId = '2';
    else if (moduleTitle.includes('Módulo 3')) moduleId = '3';
    else if (moduleTitle.includes('Módulo 4')) moduleId = '4';
    
    const progressKey = `module_${moduleId}_progress`;
    const currentProgress = parseInt(localStorage.getItem(progressKey) || '0');
    
    // Aumentar progresso com base no desempenho (máximo 100%)
    const quizPercentage = (score / totalQuestions) * 100;
    const progressIncrease = Math.min(quizPercentage, 30); // Máximo de 30% por questionário
    const newProgress = Math.min(currentProgress + progressIncrease, 100);
    
    localStorage.setItem(progressKey, newProgress.toString());
    updateProgressDisplay();
    
    // Atualizar progresso no card do módulo
    updateModuleCardProgress(moduleId, newProgress);
}

function updateModuleCardProgress(moduleId, progress) {
    const moduleCard = document.getElementById(`module${moduleId}`);
    if (moduleCard) {
        const progressFill = moduleCard.querySelector('.progress-fill');
        const progressText = moduleCard.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}% concluído`;
        }
    }
}

// =================== GERENCIAMENTO DE PROGRESSO ===================

function updateProgressDisplay() {
    // Calcular progresso geral
    let totalProgress = 0;
    let modulesCount = 0;
    
    for (let i = 1; i <= 4; i++) {
        const progressKey = `module_${i}_progress`;
        const moduleProgress = parseInt(localStorage.getItem(progressKey) || '0');
        totalProgress += moduleProgress;
        modulesCount++;
    }
    
    const overallProgress = modulesCount > 0 ? Math.round(totalProgress / modulesCount) : 0;
    
    // Atualizar indicador circular
    const progressIndicator = document.querySelector('.progress-indicator');
    const progressPercent = document.querySelector('.progress-percent');
    const circumference = 2 * Math.PI * 54; // raio do círculo
    const offset = circumference - (overallProgress / 100) * circumference;
    
    if (progressIndicator) {
        progressIndicator.style.strokeDashoffset = offset;
    }
    
    if (progressPercent) {
        progressPercent.textContent = `${overallProgress}%`;
    }
    
    // Atualizar texto de progresso geral
    const completedModules = Object.keys(localStorage)
        .filter(key => key.startsWith('module_') && key.endsWith('_progress'))
        .filter(key => parseInt(localStorage.getItem(key)) >= 80).length;
    
    const progressInfo = document.querySelector('.progress-info');
    if (progressInfo) {
        const pElements = progressInfo.querySelectorAll('p');
        if (pElements.length >= 2) {
            pElements[0].innerHTML = `Você completou <strong>${completedModules} de 4</strong> módulos`;
        }
    }
    
    // Atualizar lista de detalhes de progresso
    updateProgressDetails();
}

function updateProgressDetails() {
    const progressList = document.querySelector('.progress-list');
    if (!progressList) return;
    
    // Limpar lista atual
    progressList.innerHTML = '';
    
    // Nomes dos módulos
    const moduleNames = {
        1: 'Criação e uso de e-mail',
        2: 'Navegação segura na internet',
        3: 'Acesso a cursos gratuitos online',
        4: 'Serviços digitais essenciais'
    };
    
    // Adicionar cada módulo à lista
    for (let i = 1; i <= 4; i++) {
        const progressKey = `module_${i}_progress`;
        const moduleProgress = parseInt(localStorage.getItem(progressKey) || '0');
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="module-name">${moduleNames[i]}</span>
            <span class="module-progress">${moduleProgress}%</span>
        `;
        
        progressList.appendChild(listItem);
    }
}

// =================== AJUDA DE TECLADO ===================

function showKeyboardHelp() {
    const keyboardHelpModal = document.getElementById('keyboard-help-modal');
    keyboardHelpModal.style.display = 'flex';
    keyboardHelpModal.setAttribute('aria-hidden', 'false');
    
    // Focar no botão de fechar
    setTimeout(() => {
        document.getElementById('close-keyboard-help').focus();
    }, 100);
    
    showNotification('Ajuda de navegação por teclado aberta');
}

function setupKeyboardNavigation() {
    // Adicionar suporte a teclado para todos os elementos interativos
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach(element => {
        // Garantir que elementos interativos tenham foco visível
        element.addEventListener('focus', function() {
            this.style.outline = '3px solid #FFD700';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
        
        // Suporte a tecla Enter para botões e links
        if (element.tagName === 'BUTTON' || element.tagName === 'A') {
            element.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        }
    });
    
    // Navegação por teclado entre módulos
    document.addEventListener('keydown', function(e) {
        // Navegação entre módulos com setas (se um módulo estiver aberto)
        if (e.key.startsWith('Arrow') && document.getElementById('module-modal').style.display === 'flex') {
            navigateModuleWithArrows(e.key);
        }
    });
}

function navigateModuleWithArrows(key) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const activeTabIndex = Array.from(tabButtons).findIndex(btn => btn.classList.contains('active'));
    
    if (key === 'ArrowRight' || key === 'ArrowLeft') {
        e.preventDefault();
        
        let newIndex;
        if (key === 'ArrowRight') {
            newIndex = (activeTabIndex + 1) % tabButtons.length;
        } else {
            newIndex = (activeTabIndex - 1 + tabButtons.length) % tabButtons.length;
        }
        
        // Ativar nova aba
        const newTab = tabButtons[newIndex];
        const tabId = newTab.textContent.toLowerCase();
        let targetTab = '';
        
        switch(tabId) {
            case 'conteúdo':
                targetTab = 'content-tab';
                break;
            case 'vídeo':
                targetTab = 'video-tab';
                break;
            case 'questionário':
                targetTab = 'quiz-tab';
                break;
        }
        
        switchTab(targetTab);
        newTab.focus();
    }
}

// =================== GERENCIAMENTO DE PREFERÊNCIAS ===================

function savePreference(key, value) {
    try {
        localStorage.setItem(`educatech_${key}`, value);
        return true;
    } catch (e) {
        console.error('Erro ao salvar preferência:', e);
        return false;
    }
}

function loadPreference(key) {
    try {
        return localStorage.getItem(`educatech_${key}`);
    } catch (e) {
        console.error('Erro ao carregar preferência:', e);
        return null;
    }
}

function loadUserPreferences() {
    // Carregar modo de alto contraste
    const highContrast = loadPreference('highContrast');
    if (highContrast === 'true') {
        document.body.classList.add('high-contrast');
        isHighContrast = true;
    }
    
    // Carregar tamanho da fonte
    const fontSize = loadPreference('fontSize');
    if (fontSize) {
        currentFontSize = parseInt(fontSize);
        document.body.style.fontSize = currentFontSize + '%';
    }
    
    // Carregar progresso dos módulos
    updateProgressDisplay();
}

// =================== UTILITÁRIOS ===================

function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        z-index: 10000;
        max-width: 300px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
        font-weight: 500;
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// =================== LIBRAS (SIMULAÇÃO) ===================

// Simulação de widget de Libras
const librasToggle = document.querySelector('.libras-toggle');
if (librasToggle) {
    librasToggle.addEventListener('click', function() {
        showNotification('Funcionalidade de tradução para Libras seria ativada aqui. Em um site real, isso integraria com um serviço como o VLibras.');
    });
}

// =================== INICIALIZAÇÃO FINAL ===================

// Garantir que o foco seja gerenciado adequadamente
document.addEventListener('focusin', function(e) {
    // Rolar para o elemento focado se ele estiver fora da viewport
    const target = e.target;
    if (target && typeof target.scrollIntoView === 'function') {
        // Usar scrollIntoView com comportamento suave
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
});

// Detectar conexão lenta
if ('connection' in navigator && navigator.connection) {
    const connection = navigator.connection;
    
    if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Conexão lenta detectada, otimizar carregamento
        console.log('Conexão lenta detectada. Otimizando para melhor desempenho.');
        
        // Desativar animações não essenciais
        document.documentElement.style.setProperty('--transition', 'none');
        
        // Mostrar notificação
        showNotification('Modo de baixo consumo ativado para conexões lentas');
    }
}
