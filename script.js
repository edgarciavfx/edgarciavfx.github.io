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
            '.about__content, .journey-point, .node-card'
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

    return { prefetchExternalResources };
})();

const NodeGraph = (() => {
    const container = document.getElementById('skillTree');
    const searchEl = document.getElementById('skillSearch');
    const summaryEl = document.getElementById('skillTreeSummary');

    let canvas, ctx;
    let graphData;
    let nodePositions = {};
    let categoryList = {};
    let categoryLayout = {};
    let graphWidth = 800;
    let graphHeight = 500;

    let hoveredNode = null;
    let selectedNode = null;
    let isPanning = false;
    let panStartX = 0, panStartY = 0;
    let panX = 0, panY = 10, zoom = 1;

    let colors = {};
    let searchQuery = '';
    let animFrame = null;
    let panInitialized = false;

    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            this.moveTo(x + r, y);
            this.lineTo(x + w - r, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r);
            this.lineTo(x + w, y + h - r);
            this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            this.lineTo(x + r, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r);
            this.lineTo(x, y + r);
            this.quadraticCurveTo(x, y, x + r, y);
            this.closePath();
        };
    }

    const NODE_W = 160;
    const NODE_H = 34;
    const NODE_GAP = 8;
    const COL_GAP_BASE = 200;
    const BACKDROP_INSET = 10;
    const BACKDROP_PAD_TOP = 32;

    const LEVEL_LABELS = {
        3: 'Core',
        2: 'Primary',
        1: 'Supporting',
    };

    const CAT_ORDER = [
        'VFX & Compositing',
        'AI & Generative Workflows',
        'Pipeline & Automation',
        'Software Engineering',
        'Production Hardening',
    ];

    const GROUP_MAP = {
        vfx: 'VFX & Compositing',
        ai: 'AI & Generative Workflows',
        pipe: 'Pipeline & Automation',
        eng: 'Software Engineering',
        prod: 'Production Hardening',
    };

    const init = () => {
        if (!container) return;
        if (typeof SKILLS_DATA === 'undefined') {
            container.innerHTML = '<p class="skill-tree__error">Unable to load skills visualization</p>';
            return;
        }

        graphData = JSON.parse(JSON.stringify(SKILLS_DATA));
        readColors();
        computeLayout();
        createCanvas();
        render();
        setupEvents();
        setupSearch();
        updateSummary();
    };

    const readColors = () => {
        const style = getComputedStyle(document.documentElement);
        colors = {
            accent: style.getPropertyValue('--color-accent-primary').trim(),
            bg: style.getPropertyValue('--color-bg-primary').trim(),
            surface: style.getPropertyValue('--color-bg-secondary').trim(),
            tertiary: style.getPropertyValue('--color-bg-tertiary').trim(),
            text: style.getPropertyValue('--color-text-primary').trim(),
            muted: style.getPropertyValue('--color-text-muted').trim(),
            border: style.getPropertyValue('--color-border').trim(),
        };
    };

    const computeLayout = () => {
        categoryList = {};
        graphData.nodes.forEach(node => {
            const cat = GROUP_MAP[node.group];
            if (!cat) return;
            if (!categoryList[cat]) categoryList[cat] = [];
            categoryList[cat].push(node);
        });

        Object.values(categoryList).forEach(nodes => {
            nodes.sort((a, b) => (b.val || 1) - (a.val || 1) || a.id.localeCompare(b.id));
        });

        const availWidth = Math.max(400, container.clientWidth - 60);
        const colGap = Math.min(COL_GAP_BASE, Math.max(140, (availWidth - NODE_W) / Math.max(1, CAT_ORDER.length - 1)));

        nodePositions = {};
        categoryLayout = {};
        let maxH = 0;

        CAT_ORDER.forEach((cat, colIdx) => {
            const nodes = categoryList[cat] || [];
            const colX = 30 + colIdx * colGap;

            nodes.forEach((node, i) => {
                nodePositions[node.id] = {
                    x: colX,
                    y: BACKDROP_PAD_TOP + 4 + i * (NODE_H + NODE_GAP),
                };
            });

            const catH = BACKDROP_PAD_TOP + 8 + nodes.length * (NODE_H + NODE_GAP) + 12;
            if (catH > maxH) maxH = catH;

            categoryLayout[cat] = {
                x: colX - BACKDROP_INSET,
                y: 0,
                w: NODE_W + BACKDROP_INSET * 2,
                h: catH,
            };
        });

        graphWidth = (() => {
            const last = CAT_ORDER[CAT_ORDER.length - 1];
            const lay = categoryLayout[last];
            return lay ? lay.x + lay.w + 30 : availWidth;
        })();
        graphHeight = Math.max(400, maxH + 20);
    };

    const createCanvas = () => {
        canvas = document.createElement('canvas');
        canvas.className = 'node-graph__canvas';
        container.appendChild(canvas);
        ctx = canvas.getContext('2d');
        resizeCanvas();
    };

    const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        const dispW = Math.max(container.clientWidth, graphWidth);
        const dispH = Math.max(400, graphHeight);

        canvas.width = dispW * dpr;
        canvas.height = dispH * dpr;
        canvas.style.width = dispW + 'px';
        canvas.style.height = dispH + 'px';

        if (!panInitialized) {
            panX = Math.max(0, (container.clientWidth - graphWidth) / 2);
            panY = 10;
            panInitialized = true;
        }
    };

    const render = () => {
        if (!ctx) return;
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = requestAnimationFrame(draw);
    };

    const draw = () => {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(zoom, zoom);

        drawBackdrops();
        drawWires();
        drawNodes();
        drawPorts();

        ctx.restore();
        ctx.restore();
    };

    const drawBackdrops = () => {
        Object.entries(categoryLayout).forEach(([name, lay]) => {
            const alpha = searchQuery ? 0.15 : 0.5;
            const r = 6;

            ctx.fillStyle = `rgba(155, 54, 32, ${0.06 * alpha * 2})`;
            ctx.beginPath();
            ctx.roundRect(lay.x, lay.y, lay.w, lay.h, r);
            ctx.fill();

            ctx.strokeStyle = `rgba(155, 54, 32, ${0.12 * alpha * 2})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = colors.muted;
            ctx.globalAlpha = Math.min(1, alpha * 2);
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(name.toUpperCase(), lay.x + 12, 10);
            ctx.globalAlpha = 1;
        });
    };

    const drawWires = () => {
        const connectedLinks = hoveredNode
            ? new Set(graphData.links.filter(l => l.source === hoveredNode || l.target === hoveredNode))
            : new Set();
        const selectedLinks = selectedNode
            ? new Set(graphData.links.filter(l => l.source === selectedNode || l.target === selectedNode))
            : new Set();

        graphData.links.forEach(link => {
            const srcNode = graphData.nodes.find(n => n.id === link.source);
            const tgtNode = graphData.nodes.find(n => n.id === link.target);
            if (srcNode?._hidden && tgtNode?._hidden) return;

            const srcPos = nodePositions[link.source];
            const tgtPos = nodePositions[link.target];
            if (!srcPos || !tgtPos) return;

            const isHovered = connectedLinks.has(link);
            const isSelected = selectedLinks.has(link);

            const baseOpacity = isSelected ? 0.6 : isHovered ? 0.35 : 0.08;
            const lineW = isSelected ? 2.5 : isHovered ? 2 : 1;

            const sx = srcPos.x + NODE_W;
            const sy = srcPos.y + NODE_H / 2;
            const tx = tgtPos.x;
            const ty = tgtPos.y + NODE_H / 2;

            const cpDist = Math.min(100, Math.abs(tx - sx) * 0.4);

            ctx.strokeStyle = isSelected || isHovered ? colors.accent : colors.muted;
            ctx.globalAlpha = baseOpacity;
            ctx.lineWidth = lineW;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.bezierCurveTo(
                sx + cpDist, sy,
                tx - cpDist, ty,
                tx, ty
            );
            ctx.stroke();

            if (isSelected && !isHovered) {
                ctx.save();
                ctx.shadowColor = colors.accent;
                ctx.shadowBlur = 12;
                ctx.strokeStyle = colors.accent;
                ctx.globalAlpha = 0.3;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.bezierCurveTo(
                    sx + cpDist, sy,
                    tx - cpDist, ty,
                    tx, ty
                );
                ctx.stroke();
                ctx.restore();
            }

            ctx.globalAlpha = 1;
        });
    };

    const drawNodes = () => {
        const connectedSet = hoveredNode
            ? new Set(
                graphData.links
                    .filter(l => l.source === hoveredNode)
                    .map(l => l.target)
                    .concat(
                        graphData.links
                            .filter(l => l.target === hoveredNode)
                            .map(l => l.source)
                    )
              )
            : null;

        graphData.nodes.forEach(node => {
            const pos = nodePositions[node.id];
            if (!pos) return;

            const nodeHidden = node._hidden;
            const isHovered = node.id === hoveredNode;
            const isSelected = node.id === selectedNode;
            const isConnected = connectedSet && connectedSet.has(node.id);

            let alpha = 1;
            if (searchQuery && nodeHidden) alpha = 0.08;
            else if (isHovered || isSelected) alpha = 1;
            else if (hoveredNode && !isConnected) alpha = 0.25;

            const r = 4;
            const { x, y } = pos;
            const stripeW = 3;

            ctx.globalAlpha = alpha;
            ctx.save();

            ctx.beginPath();
            ctx.roundRect(x, y, NODE_W, NODE_H, r);
            ctx.clip();

            ctx.fillStyle = colors.accent;
            ctx.fillRect(x, y, NODE_W, NODE_H);

            ctx.fillStyle = colors.tertiary;
            ctx.fillRect(x + stripeW, y, NODE_W - stripeW, NODE_H);

            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, NODE_W, NODE_H, r);
            ctx.clip();

            ctx.strokeStyle = isHovered || isSelected
                ? colors.accent
                : colors.border;
            ctx.lineWidth = isHovered || isSelected ? 1.5 : 1;
            ctx.stroke();

            ctx.fillStyle = colors.text;
            ctx.font = '11px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id, x + NODE_W / 2, y + NODE_H / 2);

            ctx.restore();
            ctx.globalAlpha = 1;
        });
    };

    const drawPorts = () => {
        graphData.nodes.forEach(node => {
            if (node._hidden) return;
            const pos = nodePositions[node.id];
            if (!pos) return;

            const { x, y } = pos;
            const dotR = 3;
            const cy = y + NODE_H / 2;

            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.arc(x, cy, dotR, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x + NODE_W, cy, dotR, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const getCanvasPos = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left - panX) / zoom,
            y: (clientY - rect.top - panY) / zoom,
        };
    };

    const hitTestNode = (wx, wy) => {
        for (const node of graphData.nodes) {
            if (node._hidden) continue;
            const pos = nodePositions[node.id];
            if (!pos) continue;
            if (wx >= pos.x && wx <= pos.x + NODE_W &&
                wy >= pos.y && wy <= pos.y + NODE_H) {
                return node.id;
            }
        }
        return null;
    };

    const getRelatedSkills = (nodeId) => {
        const related = [];
        const seen = new Set();
        graphData.links.forEach(link => {
            if (link.source === nodeId && !seen.has(link.target)) {
                seen.add(link.target);
                related.push(link.target);
            }
            if (link.target === nodeId && !seen.has(link.source)) {
                seen.add(link.source);
                related.push(link.source);
            }
        });
        return related.slice(0, 8);
    };

    const getCategoryForNode = (nodeId) => {
        const node = graphData.nodes.find(n => n.id === nodeId);
        return node ? GROUP_MAP[node.group] || '' : '';
    };

    const showTooltip = (e, nodeId) => {
        hideTooltip();
        const node = graphData.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const related = getRelatedSkills(nodeId);
        const cat = getCategoryForNode(nodeId);

        const tooltip = document.createElement('div');
        tooltip.className = 'node-graph-tooltip';
        tooltip.dataset.graphTooltip = '';

        let html = `<div class="node-graph-tooltip__name">${node.id}</div>`;
        html += `<div class="node-graph-tooltip__level">${LEVEL_LABELS[node.val] || 'Supporting'}</div>`;
        html += `<div class="node-graph-tooltip__cat">${cat}</div>`;

        if (related.length > 0) {
            html += '<div class="node-graph-tooltip__related-label">Related</div>';
            html += '<div class="node-graph-tooltip__related">';
            related.forEach(r => {
                html += `<span class="node-graph-tooltip__related-skill">${r}</span>`;
            });
            html += '</div>';
        }

        tooltip.innerHTML = html;
        tooltip.style.left = Math.min(e.clientX + 15, window.innerWidth - 260) + 'px';
        tooltip.style.top = Math.min(e.clientY + 15, window.innerHeight - 200) + 'px';
        document.body.appendChild(tooltip);
    };

    const hideTooltip = () => {
        const t = document.querySelector('[data-graph-tooltip]');
        if (t) t.remove();
    };

    const setupEvents = () => {
        let pointerDown = false;
        let pointerMoved = false;
        let pointerStartX = 0, pointerStartY = 0;
        let panStartXVal = 0, panStartYVal = 0;

        const onPointerDown = (e) => {
            const pos = getCanvasPos(e.clientX, e.clientY);
            const hit = hitTestNode(pos.x, pos.y);

            pointerDown = true;
            pointerMoved = false;
            isPanning = false;
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            panStartXVal = panX;
            panStartYVal = panY;

            if (hit) {
                selectedNode = hit;
                render();
            } else {
                selectedNode = null;
                isPanning = true;
                canvas.style.cursor = 'grabbing';
                render();
            }
        };

        const onPointerMove = (e) => {
            const pos = getCanvasPos(e.clientX, e.clientY);

            if (pointerDown) {
                const dx = e.clientX - pointerStartX;
                const dy = e.clientY - pointerStartY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerMoved = true;

                if (isPanning) {
                    panX = panStartXVal + dx;
                    panY = panStartYVal + dy;
                    render();
                } else if (pointerMoved) {
                    isPanning = true;
                    canvas.style.cursor = 'grabbing';
                    selectedNode = null;
                    panX = panStartXVal + dx;
                    panY = panStartYVal + dy;
                    render();
                }
            } else {
                const hit = hitTestNode(pos.x, pos.y);
                if (hit !== hoveredNode) {
                    hoveredNode = hit;
                    canvas.style.cursor = hit ? 'pointer' : 'grab';
                    render();
                    if (hit) {
                        showTooltip(e, hit);
                    } else {
                        hideTooltip();
                    }
                } else if (hit) {
                    const t = document.querySelector('[data-graph-tooltip]');
                    if (t) {
                        t.style.left = Math.min(e.clientX + 15, window.innerWidth - 260) + 'px';
                        t.style.top = Math.min(e.clientY + 15, window.innerHeight - 200) + 'px';
                    }
                }
            }
        };

        const onPointerUp = () => {
            pointerDown = false;
            isPanning = false;
            canvas.style.cursor = hoveredNode ? 'pointer' : 'grab';
        };

        const onPointerLeave = () => {
            pointerDown = false;
            isPanning = false;
            hoveredNode = null;
            hideTooltip();
            canvas.style.cursor = 'grab';
            render();
        };

        const onWheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.92 : 1.08;
            zoom = Math.max(0.4, Math.min(2, zoom * delta));
            render();
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointerleave', onPointerLeave);
        canvas.addEventListener('wheel', onWheel, { passive: false });

        window.addEventListener('resize', () => {
            resizeCanvas();
            render();
        });
    };

    const setupSearch = () => {
        if (!searchEl) return;

        searchEl.addEventListener('input', () => {
            searchQuery = searchEl.value.trim().toLowerCase();

            let matchCount = 0;
            graphData.nodes.forEach(node => {
                const match = !searchQuery || node.id.toLowerCase().includes(searchQuery);
                node._hidden = !!searchQuery && !match;
                if (match && searchQuery) matchCount++;
            });

            updateSummary(matchCount);
            render();
        });
    };

    const updateSummary = (matchCount) => {
        if (!summaryEl) return;
        if (searchQuery) {
            summaryEl.textContent = matchCount > 0
                ? `${matchCount} matching skills`
                : 'No matching skills';
        } else {
            const total = graphData.nodes.length;
            summaryEl.textContent = `${total} skills across ${CAT_ORDER.length} categories`;
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
    Utils.prefetchExternalResources();
    NodeGraph.init();
    VFXGallery.init().catch(error => {
        console.error('Error initializing VFX Gallery:', error);
    });
    ContactForm.init();
});
