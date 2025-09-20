// File: ui_prototype/js/script.js
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();

    const navButtons = document.querySelectorAll('.nav-button');
    const pageContent = document.getElementById('page-content');
    const bottomNav = document.querySelector('.bottom-nav');

    // This is our main navigation function, now accessible everywhere
    window.loadPage = async (pageName) => {
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error('Page not found');
            const html = await response.text();
            pageContent.innerHTML = html;
            
            // Always re-render icons after loading new content
            lucide.createIcons();

            // Handle UI changes based on page
            if (pageName === 'login') {
                bottomNav.classList.add('hidden');
                pageContent.style.padding = '0';
                pageContent.style.height = '100%';
            } else {
                bottomNav.classList.remove('hidden');
                pageContent.style.padding = '1rem';
                pageContent.style.height = 'calc(100% - 70px)';
            }
            
            // Initialize page-specific scripts
            if (pageName === 'report') initializeReportForm();
            if (pageName === 'profile') initializeProfilePage();
            
            // Trigger animations for the new content
            const animatedElements = pageContent.querySelectorAll('[data-animate]');
            animatedElements.forEach(el => {
                el.classList.remove('in-view'); // Reset for re-animation
                const delay = parseInt(el.style.getPropertyValue('--delay')) || 0;
                setTimeout(() => { el.classList.add('in-view'); }, delay);
            });

        } catch (error) {
            console.error('Failed to load page:', error);
            pageContent.innerHTML = `<p class="text-red-500 p-4">Error: Could not load page.</p>`;
        }
    };
    
    // --- Updated Report Page Logic ---
    const initializeReportForm = () => {
        const stepButtons = document.querySelectorAll('.nav-step-btn');
        const steps = document.querySelectorAll('.report-step');
        const progressSteps = document.querySelectorAll('.progress-step');
        const categoryButtons = document.querySelectorAll('.category-button');

        const updateProgress = (targetStepId) => {
            progressSteps.forEach(step => step.classList.remove('active'));
            const stepNumber = parseInt(targetStepId.split('-')[1]);
            for (let i = 1; i <= stepNumber; i++) {
                document.getElementById(`progress-step-${i}`).classList.add('active');
            }
        };

        stepButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetStepId = button.dataset.nextStep || button.dataset.prevStep;
                
                if (targetStepId) {
                    steps.forEach(step => step.classList.remove('active'));
                    document.getElementById(targetStepId).classList.add('active');
                    updateProgress(targetStepId);

                    // Trigger animations for the new step's content
                    const animatedElements = document.getElementById(targetStepId).querySelectorAll('[data-animate]');
                    animatedElements.forEach(el => {
                        el.classList.remove('in-view');
                        const delay = parseInt(el.style.getPropertyValue('--delay')) || 0;
                        setTimeout(() => { el.classList.add('in-view'); }, delay);
                    });
                }
            });
        });
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                categoryButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
            });
        });

        // Initialize progress for the first step
        updateProgress('step-1-capture');
    };

    // Profile Page Logic
    const initializeProfilePage = () => {
        const tabs = document.querySelectorAll('.profile-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.target;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabContents.forEach(content => {
                    content.id === targetId ? content.classList.add('active') : content.classList.remove('active');
                });
            });
        });

        const expandableCards = document.querySelectorAll('.issue-card.expandable');
        expandableCards.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });
        });
    };

    // Set up main navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.dataset.page;
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadPage(targetPage);
        });
    });

    // Initial page load
    loadPage('login');
});
