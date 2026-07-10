const VFX_PRODUCTIONS = [
    { title: 'Sonic the Hedgehog', year: 2020, type: 'film' },
    { title: 'Abbott Elementary', year: 2021, type: 'tv' },
    { title: 'House Party', year: 2023, type: 'film' },
    { title: 'Horizon: An American Saga', year: 2024, type: 'film' },
    { title: 'Ick', year: 2023, type: 'tv' },
    { title: 'Young Rock', year: 2021, type: 'tv' },
    { title: 'Cowboy Bebop', year: 2021, type: 'tv' },
    { title: 'One Piece', year: 2023, type: 'tv' },
    { title: 'Hellraiser', year: 2022, type: 'tv' },
    { title: 'Loot', year: 2022, type: 'tv' },
    { title: 'Echoes', year: 2022, type: 'tv' },
    { title: 'This Fool', year: 2022, type: 'tv' },
    { title: 'The Flight Attendant', year: 2020, type: 'tv' },
    { title: 'The Terminal List', year: 2022, type: 'tv' },
    { title: 'Ted Lasso', year: 2020, type: 'tv' },
    { title: 'Let the Right One In', year: 2022, type: 'tv' },
    { title: 'Lioness', year: 2023, type: 'tv' },
    { title: 'Black Mirror', year: 2019, type: 'tv' },
    { title: 'A Murder at the End of the World', year: 2022, type: 'tv' },
    { title: 'The Santa Clauses', year: 2023, type: 'tv' },
    { title: 'The Big Cigar', year: 2024, type: 'tv' },
    { title: 'The Sympathizer', year: 2024, type: 'tv' },
    { title: 'Bad Monkey', year: 2024, type: 'tv' },
    { title: 'Supacell', year: 2024, type: 'tv' },
    { title: 'Mo', year: 2022, type: 'tv' },
    { title: 'Deli Boys', year: 2024, type: 'tv' },
    { title: 'The Righteous Gemstones', year: 2019, type: 'tv' },
    { title: 'The White Lotus', year: 2021, type: 'tv' },
    { title: 'The Studio', year: 2024, type: 'tv' },
    { title: 'Taylor Swift: The Eras Tour', year: 2023, type: 'concert' },
];

const Navigation = (() => {
    const menuToggle = document.querySelector('.navbar__menu-toggle');
    const navLinks = document.querySelector('.navbar__links');

    const init = () => {
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', toggleMenu);
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', closeMenu);
            });
            document.addEventListener('click', handleClickOutside);
        }
    };

    const toggleMenu = () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', menuToggle.classList.contains('active'));
    };

    const closeMenu = () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.navbar')) {
            closeMenu();
        }
    };

    return { init };
})();

const ScrollReveal = (() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const init = () => {
        document.querySelectorAll(
            '.about__content, .journey-point, .node-card, .skill-card'
        ).forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    };

    return { init };
})();

const VFXGallery = (() => {
    const gallery = document.getElementById('vfxGallery');

    // Posters are bundled locally under posters/<slug>.jpg — no runtime
    // fetching, so the row renders instantly and never shows broken images.
    const slugify = (title) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const escapeAttr = (value) =>
        String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

    const init = () => {
        if (!gallery) return;

        const track = document.createElement('div');
        track.className = 'vfx-gallery__track';

        const posters = VFX_PRODUCTIONS.map(createPosterElement).join('');
        // Duplicate the set so the marquee can loop seamlessly.
        track.innerHTML = posters + posters;

        gallery.appendChild(track);
        setupPosterFallbacks(track);
        setupPosterInteractions();
    };

    const createPosterElement = (production) => {
        const src = `posters/${slugify(production.title)}.jpg`;
        const title = escapeAttr(production.title);

        return `
            <div class="poster-item" role="link" tabindex="0"
                 title="${title} (${production.year})"
                 data-production="${title}"
                 data-year="${production.year}">
                <img class="poster-image" src="${src}" alt="${title}" loading="lazy">
            </div>
        `;
    };

    // If a poster file is ever missing, swap the <img> for a titled placeholder.
    const showPlaceholder = (img) => {
        const item = img.closest('.poster-item');
        if (!item || item.querySelector('.poster-placeholder')) return;

        const placeholder = document.createElement('div');
        placeholder.className = 'poster-placeholder';
        const span = document.createElement('span');
        span.textContent = item.dataset.production || '';
        placeholder.appendChild(span);
        img.replaceWith(placeholder);
    };

    const setupPosterFallbacks = (track) => {
        track.querySelectorAll('.poster-image').forEach(img => {
            img.addEventListener('error', () => showPlaceholder(img));
            if (img.complete && img.naturalWidth === 0) showPlaceholder(img);
        });
    };

    const setupPosterInteractions = () => {
        gallery.querySelectorAll('.poster-item').forEach(item => {
            item.addEventListener('click', () => {
                const title = item.dataset.production;
                window.open(
                    `https://www.imdb.com/find?q=${encodeURIComponent(title)}`,
                    '_blank',
                    'noopener,noreferrer'
                );
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            });
        });
    };

    return { init };
})();


const ContactForm = (() => {
    const form = document.querySelector('.contact__form');
    const RESET_DELAY = 10000;
    let formHTML = '';
    let resetTimer = null;

    const init = () => {
        if (!form) return;
        formHTML = form.innerHTML;
        form.addEventListener('submit', handleSubmit);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const data = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showSuccess();
            } else {
                throw new Error('Server responded with ' + response.status);
            }
        } catch {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            showError();
        }
    };

    const showSuccess = () => {
        form.innerHTML = `
            <div class="contact__success">
                Message sent! I'll get back to you soon.
                <button class="contact__reset" type="button">Send another message</button>
            </div>
        `;
        form.querySelector('.contact__reset').addEventListener('click', cancelAutoReset);
        resetTimer = setTimeout(resetForm, RESET_DELAY);
    };

    const resetForm = () => {
        form.innerHTML = formHTML;
        form.classList.add('contact__form--resetting');
        form.addEventListener('animationend', () => {
            form.classList.remove('contact__form--resetting');
        }, { once: true });
    };

    const cancelAutoReset = () => {
        if (resetTimer) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }
        resetForm();
    };

    const showError = () => {
        const existing = form.querySelector('.contact__error');
        if (existing) return;
        const msg = document.createElement('p');
        msg.className = 'contact__error';
        msg.textContent = 'Something went wrong. Please try again or email me directly.';
        form.prepend(msg);
    };

    return { init };
})();

const HeroTitle = (() => {
    const init = () => {
        const title = document.querySelector('.hero__title');
        if (!title) return;

        let charIndex = 0;
        const children = Array.from(title.childNodes);

        title.textContent = '';

        const addChar = (char, parent) => {
            if (char === ' ') {
                const space = document.createElement('span');
                space.className = 'char-space';
                space.innerHTML = '&nbsp;';
                parent.appendChild(space);
            } else {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.animationDelay = `${0.03 + charIndex * 0.025}s`;
                parent.appendChild(span);
            }
            charIndex++;
        };

        children.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                const frag = document.createDocumentFragment();
                for (const ch of text) {
                    addChar(ch, frag);
                }
                title.appendChild(frag);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    title.appendChild(document.createElement('br'));
                } else if (node.classList && node.classList.contains('accent-text')) {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'accent-text';
                    const text = node.textContent;
                    for (const ch of text) {
                        addChar(ch, wrapper);
                    }
                    title.appendChild(wrapper);
                } else {
                    const clone = node.cloneNode(true);
                    title.appendChild(clone);
                }
            }
        });
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    HeroTitle.init();
    ScrollReveal.init();
    VFXGallery.init();
    ContactForm.init();
});
