// --- SPA ROUTER & NAVIGATION ---
const pages = ['home', 'mimari', 'ic-mimari', 'peyzaj', 'diger-hizmetler', 'hakkimizda', 'iletisim'];
let isAnimating = false;
let hoverTimer;

function switchPage(targetId) {
    if (isAnimating) return;
    const currentActive = document.querySelector('.spa-page.active');
    const targetPage = document.getElementById(targetId);
    
    if (!targetPage || currentActive === targetPage) return;
    
    isAnimating = true;

    const currentIndex = pages.indexOf(currentActive.id);
    const targetIndex = pages.indexOf(targetId);
    const direction = targetIndex > currentIndex ? 'forward' : 'backward';

    // Update Nav Active State
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
    });

    // Background Video Transition
    const currentVideo = document.querySelector('.spa-bg-video.active');
    const targetVideo = document.getElementById(`video-${targetId}`);
    
    if (currentVideo && currentVideo !== targetVideo) {
        currentVideo.classList.remove('active');
        currentVideo.pause();
    }
    
    if (targetVideo) {
        targetVideo.classList.add('active');
        targetVideo.play().catch(e => console.log("Video play logic:", e));
    }

    // Content Transition (Page Turn)
    const exitClass = direction === 'forward' ? 'page-flip-exit-forward' : 'page-flip-exit-backward';
    const enterClass = direction === 'forward' ? 'page-flip-enter-forward' : 'page-flip-enter-backward';

    // Prepare target page (hidden but visible for transition)
    targetPage.style.display = 'block';
    
    currentActive.classList.add(exitClass);
    targetPage.classList.add(enterClass);

    setTimeout(() => {
        currentActive.classList.remove('active', exitClass);
        targetPage.classList.add('active');
        targetPage.classList.remove(enterClass);
        targetPage.style.display = ''; // Reset display
        isAnimating = false;
        
        initInteractiveTitles();
        initRevealAnimations();
        initCategorySelectors();
    }, 1300); // Slightly longer than 1.2s CSS
}

// Global Nav Interaction
document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('.nav-link');
    if (link && !isAnimating) {
        // Disable hover-to-navigate for project cards (only top nav remains active)
        if (link.classList.contains('project-card')) return;

        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            if (targetId !== document.querySelector('.spa-page.active').id) {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    switchPage(targetId);
                    history.pushState({ pageId: targetId }, '', `#${targetId}`);
                }, 500); // 500ms hover delay
            }
        }
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.nav-link')) {
        clearTimeout(hoverTimer);
    }
});

document.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (link) {
        e.preventDefault();
        clearTimeout(hoverTimer);
        const href = link.getAttribute('href');
        const targetId = href.substring(1);
        
        if (link.classList.contains('branding-link')) {
             // Reset entire SPA to top and home
             switchPage('home');
             history.pushState({ pageId: 'home' }, '', '#home');
             const homeSection = document.getElementById('home');
             if (homeSection) homeSection.scrollTo({ top: 0, behavior: 'smooth' });
             window.scrollTo({ top: 0, behavior: 'smooth' });
             return;
        }

        switchPage(targetId);
        history.pushState({ pageId: targetId }, '', `#${targetId}`);
    }
});

window.addEventListener('popstate', (e) => {
    const pageId = (e.state && e.state.pageId) || window.location.hash.substring(1) || 'home';
    switchPage(pageId);
});

document.addEventListener('DOMContentLoaded', () => {
    // Splash Screen Handler
    const splash = document.getElementById('splash-screen');
    
    // Initial Page Determination - Always force 'home' on refresh as per user request
    if (window.location.hash && window.location.hash !== '#home') {
        history.replaceState(null, null, ' '); // Clear hash without jump
    }
    const targetId = 'home';
    
    // Set initial active states
    document.querySelectorAll('.spa-page').forEach(p => p.classList.toggle('active', p.id === targetId));
    document.querySelectorAll('.spa-bg-video').forEach(v => v.classList.toggle('active', v.id === `video-${targetId}`));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${targetId}`));

    if (splash) {
        // Wait for page load or max 2s
        const hideSplash = () => {
            splash.style.transform = 'scale(1.1)';
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.remove();
                initInteractiveTitles();
                initRevealAnimations();
                initCategorySelectors();
            }, 800);
        };

        window.addEventListener('load', () => setTimeout(hideSplash, 1000));
        // Fallback
        setTimeout(hideSplash, 2500);
    } else {
        initInteractiveTitles();
        initRevealAnimations();
        initCategorySelectors();
    }

    // Initialize UI features
    initMobileMenu();
    initScrollEffects();
});

// Remove these individual calls as they are now in DOMContentLoaded
// initInteractiveTitles();
// initRevealAnimations();

// --- UI EFFECTS (RE-INITIALIZABLE) ---

// Header Scroll Effect
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    const handleScroll = (scrollTop) => {
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', () => handleScroll(window.scrollY));

    // SPA internal scrolling support for Header
    document.querySelectorAll('.spa-page').forEach(page => {
        page.addEventListener('scroll', () => handleScroll(page.scrollTop));
    });
}


// Reveal on Scroll Initialization
function initRevealAnimations() {
    let revealElements = document.querySelectorAll('.spa-page.active .reveal');
    if (document.querySelectorAll('.spa-page').length === 0) {
        revealElements = document.querySelectorAll('.reveal');
    }

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => observer.observe(el));
}

// Initial Call
initRevealAnimations();

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && !mobileMenu.dataset.initialized) {
        mobileMenu.dataset.initialized = "true";
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('is-active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenu.classList.remove('is-active');
                document.body.style.overflow = '';
            });
        });
    }
}

// Interactive Titles Initialization
function initInteractiveTitles() {
    const titles = document.querySelectorAll('.interactive-title');
    titles.forEach(title => {
        if(title.dataset.initialized) return;
        title.dataset.initialized = "true";
        
        let mainText = "";
        let spanHTML = "";
        for(let child of title.childNodes) {
            if(child.nodeType === Node.TEXT_NODE) {
                mainText += child.textContent;
            } else if(child.tagName === 'SPAN') {
                spanHTML = child.outerHTML;
            }
        }
        
        mainText = mainText.trim();
        let newContent = '<div class="letters-container">';
        for(let i = 0; i < mainText.length; i++) {
            const char = mainText[i];
            if (char === ' ') {
                newContent += `<span class="letter-wrapper" style="width: 20px;">&nbsp;</span>`;
            } else {
                newContent += `<span class="letter-wrapper"><span class="letter" style="animation-delay: ${i * 0.05}s">${char}</span></span>`;
            }
        }
        newContent += '</div>' + spanHTML;
        title.innerHTML = newContent;
    });
}

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        
        // Show sending state
        const submitBtn = contactForm.querySelector('button');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'GÖNDERİLİYOR...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.style.display = 'block';
                contactForm.reset();
            } else {
                alert('Bir hata oluştu. Lütfen doğrudan e-posta gönderin.');
            }
        } catch (error) {
            // Success fallback for local testing without actual endpoint
            formStatus.style.display = 'block';
            contactForm.reset();
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

/* --- CATEGORY SELECTOR LOGIC --- */
function initCategorySelectors() {
    const navs = document.querySelectorAll('.category-nav');
    
    navs.forEach(nav => {
        const parentSection = nav.closest('.spa-page');
        const navItems = nav.querySelectorAll('.category-nav-item');
        const panels = parentSection.querySelectorAll('.category-panel');
        
        navItems.forEach(item => {
            if (item.dataset.initialized) return;
            item.dataset.initialized = "true";

            item.addEventListener('click', () => {
                const targetService = item.dataset.service;
                
                // Update nav items for THIS section only
                navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
                
                // Update panels for THIS section only
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === `panel-${targetService}`) {
                        panel.classList.add('active');
                    }
                });

                // Scroll to the content area for better visibility
                const contentWrapper = parentSection.querySelector('.category-content-wrapper');
                if (contentWrapper) {
                    const scrollTarget = contentWrapper.offsetTop - 150;
                    parentSection.scrollTo({ top: scrollTarget, behavior: 'smooth' });
                }
            });
        });
    });
}

