/**
 * Artistry By Amna - Main JavaScript
 * Handles navigation, scroll effects, and animations
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================
    // Mobile Menu Toggle
    // ===================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinkItems = document.querySelectorAll('.nav-links a');
        navLinkItems.forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnMenuBtn = mobileMenuBtn.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnMenuBtn && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // ===================================
    // Navbar Scroll Effect
    // ===================================
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ===================================
    // Smooth Scroll for Anchor Links
    // ===================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===================================
    // Scroll Animation for Sections
    // ===================================
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    fadeInSections.forEach(function(section) {
        sectionObserver.observe(section);
    });

    // ===================================
    // Portfolio Configuration
    // ===================================
    const portfolioConfig = {
        bridal: {
            title: "Bridal Beauty",
            folder: "images/bridal",
            count: 3,  // Number of images in the bridal folder
            fileNames: [] // Will be populated with image filenames
        },
        special: {
            title: "Special Occasions",
            folder: "images/special",
            count: 11,  // Number of images in the special folder
            fileNames: [] // Will be populated with image filenames
        }
    };

    // Generate filenames for each category
    // Assumes images are named: 1.jpg, 2.jpg, 3.jpg, etc.
    for (let category in portfolioConfig) {
        const config = portfolioConfig[category];
        for (let i = 1; i <= config.count; i++) {
            config.fileNames.push(`${i}.jpg`);
        }
    }

    // ===================================
    // Carousel Class for Multiple Carousels
    // ===================================
    class Carousel {
        constructor(container, category, config) {
            this.container = container;
            this.category = category;
            this.config = config;
            this.track = container.querySelector('.carousel-track');
            this.indicatorsContainer = container.querySelector('.carousel-indicators');
            this.prevBtn = container.querySelector('.carousel-btn-prev');
            this.nextBtn = container.querySelector('.carousel-btn-next');
            this.currentSlide = 0;
            this.autoPlayInterval = null;
            this.autoPlayDelay = 5000;
            this.touchStartX = 0;
            this.touchEndX = 0;
            
            this.init();
        }

        init() {
            // Shuffle images for random display
            this.shuffledImages = this.shuffleArray([...this.config.fileNames]);
            
            // Build carousel slides
            this.buildSlides();
            
            // Build indicators
            this.buildIndicators();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize first slide
            this.updateCarousel(0, false);
            
            // Start autoplay
            this.startAutoPlay();
        }

        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        buildSlides() {
            this.shuffledImages.forEach((fileName, index) => {
                const slide = document.createElement('div');
                slide.className = 'carousel-slide';
                if (index === 0) slide.classList.add('active');
                
                const img = document.createElement('img');
                img.src = `${this.config.folder}/${fileName}`;
                img.alt = `${this.config.title} - Artistry By Amna`;
                img.loading = 'lazy';
                
                slide.appendChild(img);
                this.track.appendChild(slide);
            });
            
            this.slides = this.container.querySelectorAll('.carousel-slide');
        }

        buildIndicators() {
            this.shuffledImages.forEach((_, index) => {
                const indicator = document.createElement('button');
                indicator.className = 'indicator';
                if (index === 0) indicator.classList.add('active');
                indicator.setAttribute('data-slide', index);
                indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
                this.indicatorsContainer.appendChild(indicator);
            });
            
            this.indicators = this.container.querySelectorAll('.indicator');
        }

        setupEventListeners() {
            // Previous/Next buttons
            if (this.prevBtn) {
                this.prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                    this.resetAutoPlay();
                });
            }

            if (this.nextBtn) {
                this.nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                    this.resetAutoPlay();
                });
            }

            // Indicators
            this.indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    this.goToSlide(index);
                });
            });

            // Touch/Swipe support
            this.track.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.track.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });

            // Pause on hover
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        updateCarousel(index, withTransition = true) {
            // Remove active class from all slides and indicators
            this.slides.forEach(slide => slide.classList.remove('active'));
            this.indicators.forEach(indicator => indicator.classList.remove('active'));

            // Add active class to current slide and indicator
            this.slides[index].classList.add('active');
            this.indicators[index].classList.add('active');

            // Move the carousel track
            const offset = -index * 100;
            if (withTransition) {
                this.track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                this.track.style.transition = 'none';
            }
            this.track.style.transform = `translateX(${offset}%)`;

            this.currentSlide = index;
        }

        nextSlide() {
            const nextIndex = (this.currentSlide + 1) % this.slides.length;
            this.updateCarousel(nextIndex);
        }

        prevSlide() {
            const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
            this.updateCarousel(prevIndex);
        }

        goToSlide(index) {
            this.updateCarousel(index);
            this.resetAutoPlay();
        }

        handleSwipe() {
            const swipeThreshold = 50;
            const diff = this.touchStartX - this.touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
                this.resetAutoPlay();
            }
        }

        startAutoPlay() {
            this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
        }

        stopAutoPlay() {
            clearInterval(this.autoPlayInterval);
        }

        resetAutoPlay() {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    }

    // ===================================
    // Initialize All Carousels
    // ===================================
    const carouselContainers = document.querySelectorAll('.carousel-container');
    const carousels = [];

    carouselContainers.forEach(container => {
        const category = container.getAttribute('data-category');
        if (category && portfolioConfig[category]) {
            const carousel = new Carousel(container, category, portfolioConfig[category]);
            carousels.push(carousel);
        }
    });

    // Pause all carousels when page is not visible
    document.addEventListener('visibilitychange', () => {
        carousels.forEach(carousel => {
            if (document.hidden) {
                carousel.stopAutoPlay();
            } else {
                carousel.startAutoPlay();
            }
        });
    });

    // ===================================
    // Keyboard Navigation for All Carousels
    // ===================================
    // Note: This will control the last focused carousel or the first one
    let activeCarousel = carousels[0];

    carouselContainers.forEach((container, index) => {
        container.addEventListener('mouseenter', () => {
            activeCarousel = carousels[index];
        });
    });

    document.addEventListener('keydown', (e) => {
        if (activeCarousel) {
            if (e.key === 'ArrowLeft') {
                activeCarousel.prevSlide();
                activeCarousel.resetAutoPlay();
            } else if (e.key === 'ArrowRight') {
                activeCarousel.nextSlide();
                activeCarousel.resetAutoPlay();
            }
        }
    });

    // ===================================
    // Portfolio Image Lazy Loading
    // ===================================
    const portfolioImages = document.querySelectorAll('.carousel-slide img');
    
    const imageObserverOptions = {
        threshold: 0,
        rootMargin: '50px'
    };

    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const img = entry.target;
                // If you implement lazy loading, uncomment below
                // img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    }, imageObserverOptions);

    portfolioImages.forEach(function(img) {
        imageObserver.observe(img);
    });

    // ===================================
    // Active Navigation Link on Scroll
    // ===================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksArray = document.querySelectorAll('.nav-links a');

    function highlightActiveNavLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(function(section) {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinksArray.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveNavLink);

    // ===================================
    // Performance: Debounce Scroll Events
    // ===================================
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = function() {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply debounce to scroll-heavy functions if needed
    const debouncedHighlight = debounce(highlightActiveNavLink, 10);
    window.addEventListener('scroll', debouncedHighlight);

    // ===================================
    // Initialize
    // ===================================
    console.log('Artistry By Amna - Website loaded successfully');
});