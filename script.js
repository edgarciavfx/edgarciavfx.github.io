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

const TMDB_PROXY_URL = 'https://tmdb-proxy-sooty-psi.vercel.app';

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
            '.about__content, .journey-point, .project-card, .skill-tree-container'
        ).forEach(element => {
            element.style.opacity = '0';
            observer.observe(element);
        });
    };

    return { init };
})();

const VFXGallery = (() => {
    const gallery = document.getElementById('vfxGallery');
    const posterCache = new Map();

    const init = async () => {
        if (!gallery) return;

        const track = document.createElement('div');
        track.className = 'vfx-gallery__track';

        const posterHTMLs = await Promise.all(
            VFX_PRODUCTIONS.map(production => createPosterElement(production))
        );

        for (const html of posterHTMLs) {
            track.insertAdjacentHTML('beforeend', html);
        }

        track.insertAdjacentHTML('beforeend', track.innerHTML);
        gallery.appendChild(track);
        setupPosterInteractions();
    };

    const createPosterElement = async (production) => {
        const posterUrl = await getPosterImage(production.title, production.type, production.year);

        const posterHTML = posterUrl 
            ? `<img class="poster-image" src="${posterUrl}" alt="${production.title}" loading="lazy">`
            : `<div class="poster-placeholder">
                <span>${production.title}</span>
            </div>`;

        return `
            <div class="poster-item" role="link" tabindex="0" 
                 title="${production.title} (${production.year})"
                 data-production="${production.title}"
                 data-year="${production.year}">
                ${posterHTML}
            </div>
        `;
    };

    const getPosterImage = async (title, type, year) => {
        const cacheKey = `${title}-${type}-${year}`;

        if (posterCache.has(cacheKey)) {
            return posterCache.get(cacheKey);
        }

        let posterUrl = null;

        try {
            posterUrl = await fetchFromTMDb(title, type, year);
            if (posterUrl) {
                posterCache.set(cacheKey, posterUrl);
                return posterUrl;
            }
        } catch (error) {
            console.debug(`TMDb lookup failed for "${title}":`, error.message);
        }

        posterCache.set(cacheKey, null);
        return null;
    };

    const fetchFromTMDb = async (title, type, year) => {
        const params = new URLSearchParams({ title, type, year }).toString();
        const response = await fetch(`${TMDB_PROXY_URL}/api/tmdb-proxy?${params}`);

        if (!response.ok) return null;

        const data = await response.json();
        return data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : null;
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

const Utils = (() => {
    const setCurrentYear = () => {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    const prefetchExternalResources = () => {
        const externalUrls = [
            'https://image.tmdb.org',
        ];

        if (TMDB_PROXY_URL && !TMDB_PROXY_URL.startsWith('REPLACE')) {
            externalUrls.push(TMDB_PROXY_URL);
        }

        externalUrls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    };

    return {
        setCurrentYear,
        prefetchExternalResources,
    };
})();

const SkillTree = (() => {
    const treeEl = document.getElementById('skillTree');
    const searchEl = document.getElementById('skillSearch');
    const summaryEl = document.getElementById('skillTreeSummary');

    const CATEGORY_IDS = [
        'Backend', 'Front-end', 'Full-Stack',
        'Tools and Platforms', 'Soft Skills', 'Transferable Skills'
    ];

    const GROUP_MAP = {
        'frontend': 'Front-end',
        'backend': 'Backend',
        'fullstack': 'Full-Stack',
        'tool': 'Tools and Platforms',
        'soft': 'Soft Skills',
        'transferable': 'Transferable Skills'
    };

    const NOTE_MAP = {
        'Testing': 'Backend',
        'TypeScript': 'Front-end'
    };

    const CATEGORY_ORDER = [
        'Front-end', 'Backend', 'Full-Stack',
        'Tools and Platforms', 'Soft Skills', 'Transferable Skills'
    ];

    let graphData = null;

    const init = () => {
        if (!treeEl) return;

        if (typeof SKILLS_DATA === 'undefined') {
            treeEl.innerHTML = '<p class="skill-tree__error">Unable to load skills visualization</p>';
            return;
        }

        graphData = SKILLS_DATA;
        const tree = buildTree(graphData);
        renderTree(tree);
        setupSearch();
        setupKeyboardNav();
        loadExpandedState();
    };

    const buildTree = (data) => {
        const groups = {};

        data.nodes.forEach(node => {
            if (node.group === 'moc') return;

            let category;
            if (node.group === 'note') {
                category = NOTE_MAP[node.id];
            } else {
                category = GROUP_MAP[node.group];
            }

            if (!category) return;
            if (!groups[category]) groups[category] = [];
            groups[category].push({ id: node.id, val: node.val, group: node.group });
        });

        for (const cat of Object.keys(groups)) {
            groups[cat].sort((a, b) => (b.val || 1) - (a.val || 1) || a.id.localeCompare(b.id));
        }

        return {
            id: 'Full-Stack Developer',
            type: 'root',
            children: CATEGORY_ORDER.map(name => ({
                id: name,
                type: 'category',
                children: groups[name] || []
            }))
        };
    };

    const renderTree = (tree) => {
        treeEl.innerHTML = '';
        const fragment = document.createDocumentFragment();
        let totalSkills = 0;

        tree.children.forEach(category => {
            const branch = document.createElement('div');
            branch.className = 'skill-tree__branch';
            branch.dataset.category = category.id;
            branch.setAttribute('role', 'treeitem');
            branch.setAttribute('aria-expanded', 'false');

            const header = document.createElement('div');
            header.className = 'skill-tree__category';
            header.setAttribute('tabindex', '0');
            header.setAttribute('role', 'button');

            const arrow = document.createElement('span');
            arrow.className = 'skill-tree__arrow';
            arrow.textContent = '\u25B6';
            arrow.setAttribute('aria-hidden', 'true');

            const name = document.createElement('span');
            name.className = 'skill-tree__category-name';
            name.textContent = category.id;

            const count = document.createElement('span');
            count.className = 'skill-tree__count';
            count.textContent = String(category.children.length);

            header.appendChild(arrow);
            header.appendChild(name);
            header.appendChild(count);

            const skillsList = document.createElement('div');
            skillsList.className = 'skill-tree__skills';
            skillsList.setAttribute('role', 'group');

            category.children.forEach(skill => {
                const skillEl = document.createElement('div');
                skillEl.className = 'skill-tree__skill';
                skillEl.dataset.skill = skill.id;
                skillEl.setAttribute('role', 'treeitem');
                skillEl.setAttribute('tabindex', '-1');

                const dot = document.createElement('span');
                dot.className = 'skill-tree__skill-dot skill-tree__skill-dot--' + (skill.val || 1);

                const skillName = document.createElement('span');
                skillName.className = 'skill-tree__skill-name';
                skillName.textContent = skill.id;

                const badgeLabels = { 3: 'Core', 2: 'Primary', 1: 'Supporting' };
                const badge = document.createElement('span');
                badge.className = 'skill-tree__skill-badge skill-tree__skill-badge--' + (skill.val || 1);
                badge.textContent = badgeLabels[skill.val] || 'Supporting';

                skillEl.appendChild(dot);
                skillEl.appendChild(skillName);
                skillEl.appendChild(badge);

                skillEl.addEventListener('mouseenter', function (e) {
                    showTooltip(e, skill.id, skill.val);
                });
                skillEl.addEventListener('mouseleave', hideTooltip);

                skillsList.appendChild(skillEl);
            });

            header.addEventListener('click', function () {
                toggleBranch(branch);
            });
            header.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleBranch(branch);
                }
            });

            branch.appendChild(header);
            branch.appendChild(skillsList);
            fragment.appendChild(branch);

            totalSkills += category.children.length;
        });

        treeEl.appendChild(fragment);

        if (summaryEl) {
            summaryEl.textContent = totalSkills + ' skills across ' + tree.children.length + ' categories';
        }
    };

    const toggleBranch = (branch) => {
        const isExpanded = branch.getAttribute('aria-expanded') === 'true';
        branch.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        branch.classList.toggle('expanded', !isExpanded);
        saveExpandedState();
    };

    const expandBranch = (branch) => {
        branch.setAttribute('aria-expanded', 'true');
        branch.classList.add('expanded');
    };

    const getRelatedSkills = (skillId) => {
        if (!graphData) return [];
        const related = [];
        const seen = new Set();

        graphData.links.forEach(link => {
            let relatedId = null;
            if (link.source === skillId && !CATEGORY_IDS.includes(link.target)) {
                relatedId = link.target;
            }
            if (link.target === skillId && !CATEGORY_IDS.includes(link.source)) {
                relatedId = link.source;
            }
            if (relatedId && !seen.has(relatedId) && relatedId !== skillId) {
                seen.add(relatedId);
                related.push(relatedId);
            }
        });

        return related.slice(0, 8);
    };

    const showTooltip = (e, skillId, val) => {
        hideTooltip();

        const related = getRelatedSkills(skillId);
        const labels = { 3: 'Core Competency', 2: 'Primary Skill', 1: 'Supporting Skill' };

        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip skill-tree-tooltip';

        let html = '<div class="skill-tooltip__name">' + skillId + '</div>';
        html += '<div class="skill-tooltip__level skill-tooltip__level--' + val + '">' + (labels[val] || 'Supporting Skill') + '</div>';

        if (related.length > 0) {
            html += '<div class="skill-tooltip__related-label">Related skills</div>';
            html += '<div class="skill-tooltip__related">';
            related.forEach(function (r) {
                html += '<span class="skill-tooltip__related-skill">' + r + '</span>';
            });
            html += '</div>';
        }

        tooltip.innerHTML = html;
        tooltip.style.left = (e.pageX + 15) + 'px';
        tooltip.style.top = (e.pageY + 15) + 'px';
        document.body.appendChild(tooltip);
    };

    const hideTooltip = () => {
        const tooltip = document.querySelector('.skill-tree-tooltip');
        if (tooltip) tooltip.remove();
    };

    document.addEventListener('mousemove', function (e) {
        const tooltip = document.querySelector('.skill-tree-tooltip');
        if (tooltip) {
            tooltip.style.left = (e.pageX + 15) + 'px';
            tooltip.style.top = (e.pageY + 15) + 'px';
        }
    });

    const setupSearch = () => {
        if (!searchEl) return;

        searchEl.addEventListener('input', function () {
            const query = searchEl.value.trim().toLowerCase();
            const branches = treeEl.querySelectorAll('.skill-tree__branch');
            let totalVisible = 0;

            branches.forEach(function (branch) {
                const skills = branch.querySelectorAll('.skill-tree__skill');
                let hasMatch = false;

                skills.forEach(function (skill) {
                    const name = skill.dataset.skill;
                    const match = !query || name.toLowerCase().includes(query);
                    skill.style.display = match ? '' : 'none';
                    skill.classList.toggle('skill-tree__skill--highlight', !!(query && match));
                    if (match) hasMatch = true;
                });

                if (query && hasMatch) {
                    expandBranch(branch);
                    branch.style.display = '';
                    branch.classList.add('skill-tree__branch--has-match');
                } else if (!query) {
                    branch.style.display = '';
                    branch.classList.remove('skill-tree__branch--has-match');
                    skills.forEach(function (s) {
                        s.style.display = '';
                        s.classList.remove('skill-tree__skill--highlight');
                    });
                } else {
                    branch.style.display = 'none';
                    branch.classList.remove('skill-tree__branch--has-match');
                }

                if (hasMatch) totalVisible += 1;
            });

            if (summaryEl) {
                if (query) {
                    const total = treeEl.querySelectorAll('.skill-tree__skill').length;
                    const hidden = treeEl.querySelectorAll('.skill-tree__skill[style*="display: none"]').length;
                    const visible = total - hidden;
                    summaryEl.textContent = visible > 0 ? visible + ' matching skills' : 'No matching skills';
                } else {
                    summaryEl.textContent = treeEl.querySelectorAll('.skill-tree__skill').length + ' skills across ' + branches.length + ' categories';
                }
            }
        });
    };

    const setupKeyboardNav = () => {
        treeEl.addEventListener('keydown', function (e) {
            const headers = Array.from(treeEl.querySelectorAll('.skill-tree__category'));
            const currentIndex = headers.indexOf(document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < headers.length - 1) headers[currentIndex + 1].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) headers[currentIndex - 1].focus();
                    break;
                case 'Home':
                    e.preventDefault();
                    if (headers.length > 0) headers[0].focus();
                    break;
                case 'End':
                    e.preventDefault();
                    if (headers.length > 0) headers[headers.length - 1].focus();
                    break;
            }
        });
    };

    const saveExpandedState = () => {
        const state = {};
        treeEl.querySelectorAll('.skill-tree__branch').forEach(function (branch) {
            state[branch.dataset.category] = branch.getAttribute('aria-expanded') === 'true';
        });
        try {
            localStorage.setItem('skillTreeExpanded', JSON.stringify(state));
        } catch (e) {
        }
    };

    const loadExpandedState = () => {
        try {
            const saved = localStorage.getItem('skillTreeExpanded');
            if (saved) {
                const state = JSON.parse(saved);
                treeEl.querySelectorAll('.skill-tree__branch').forEach(function (branch) {
                    const cat = branch.dataset.category;
                    if (state[cat] === false) {
                        branch.setAttribute('aria-expanded', 'false');
                        branch.classList.remove('expanded');
                    }
                });
            }
        } catch (e) {
        }
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

document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    ScrollReveal.init();
    Utils.setCurrentYear();
    Utils.prefetchExternalResources();
    SkillTree.init();
    VFXGallery.init().catch(error => {
        console.error('Error initializing VFX Gallery:', error);
    });
    ContactForm.init();
});
