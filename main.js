(() => {
    // If bookmarklet already used, prevent from using twice
    if (window.greenwashBookmarklet) return;
    window.greenwashBookmarklet = true;

    // Add CSS styles
    const styles = `
        .match {
            padding: 2px 0;
            border-radius: 2px;
            cursor: help;
        }

        .match:hover {
            filter: brightness(0.95);
        }

        .match.risk-clear {
            background-color: #E8F5E9;  /* Light green */
        }

        .match.risk-red {
            background-color: #ffd7d7;  /* Light red */
        }

        .match.risk-ambiguous {
            background-color: #FFE4B5;  /* Light orange */
        }

        .match.risk-green {
            background-color: #E8F5E9;  /* Light green */
        }

        .greenwash-tooltip {
            position: fixed;
            z-index: 100000;
            background: white;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 12px;
            max-width: 300px;
            min-width: 200px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            pointer-events: none;
            border: 1px solid #ddd;
            display: none;
        }

        .tooltip-content {
            position: relative;
        }

        .tooltip-header {
            font-weight: bold;
            font-size: 20px;
            margin-bottom: 8px;
        }

        .tooltip-body {
            color: #666;
            line-height: 1.4;
        }

        .risk-level {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .risk-level.red {
            color: #d32f2f;
        }

        .risk-level.amber {
            color: #ff9800;
        }

        .risk-level.green {
            color: #4caf50;
        }

        .topic, .reason, .scheme {
            margin-top: 4px;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Create tooltip container once
    const tooltip = document.createElement('div');
    tooltip.className = 'greenwash-tooltip';
    document.body.appendChild(tooltip);

    function updateTooltipPosition(event) {
        const padding = 15;
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Start with position to the right and below cursor
        let left = event.clientX + padding;
        let top = event.clientY + padding;

        // Adjust if tooltip would go off right edge
        if (left + tooltipRect.width > viewportWidth) {
            left = event.clientX - tooltipRect.width - padding;
        }

        // Adjust if tooltip would go off bottom edge
        if (top + tooltipRect.height > viewportHeight) {
            top = event.clientY - tooltipRect.height - padding;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    async function fetchClaims() {
        const currentUrl = window.location.href;
        const apiUrl = new URL('https://provenance-a-paul-hack--gy2wd1.herokuapp.com/v1/claims');
        apiUrl.searchParams.append('url', currentUrl);

        try {
            const response = await fetch(apiUrl.toString(), {
                method: 'GET',
                headers: {
                    'Provenance-Api-Key': '09e6909c-13ac-47cd-afb3-a31b3a6e9804'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.claims || [];
        } catch (error) {
            console.error('Error fetching claims:', error);
            throw error;
        }
    }

    function displayResults(claims) {
        if (claims.length === 0) {
            alert('No matching claims found in database!');
            return;
        }

        // Create regex pattern from the claims
        const terms = claims.map(claim => claim.claim)
            .filter(text => text && typeof text === 'string');

        if (terms.length === 0) return;

        const regex = new RegExp(terms.map(term => `(${escapeRegExp(term)})`).join('|'), 'gi');

        // Highlight matching terms and add hover functionality
        wrapMatchingTextNodes(regex, claims);

        // Show initial summary
        alert(`Found ${claims.length} potential greenwashing claims. Hover over highlighted text to see details.`);
    }

    // Escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Function to wrap matching text nodes
    function wrapMatchingTextNodes(regex, claims) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodesToReplace = [];
        let node;

        while (node = walker.nextNode()) {
            if (regex.test(node.textContent)) {
                nodesToReplace.push(node);
            }
        }

        nodesToReplace.forEach(node => {
            const text = node.textContent;
            const fragment = document.createDocumentFragment();
            const parts = text.split(regex);

            parts.forEach(part => {
                if (regex.test(part)) {
                    const wrapper = document.createElement('mark');
                    wrapper.classList.add('match');
                    wrapper.textContent = part;
                    
                    // Find matching claim - case insensitive matching
                    const claim = claims.find(c => 
                        c.claim.toLowerCase() === part.toLowerCase()
                    );
                    if (claim) {
                        // Add risk level class
                        const riskLevel = claim.risk_level?.toLowerCase() || 'unknown';
                        const riskClass = riskLevel === 'clear' ? 'clear' : 
                                         riskLevel === 'ambiguous' ? 'ambiguous' : 
                                         riskLevel;
                        wrapper.classList.add(`risk-${riskClass}`);
                        
                        wrapper.dataset.claim = JSON.stringify(claim);
                        wrapper.addEventListener('mousemove', showTooltip);
                        wrapper.addEventListener('mouseleave', hideTooltip);
                    }
                    
                    fragment.appendChild(wrapper);
                } else if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            node.parentNode.replaceChild(fragment, node);
        });
    }

    function showTooltip(event) {
        const claim = JSON.parse(event.target.dataset.claim);
        
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">${claim.claim}</div>
                <div class="tooltip-body">
                    <div class="risk-level ${claim.risk_level?.toLowerCase()}">
                        Risk Level: ${claim.risk_level || 'Unknown'}
                    </div>
                    <div class="topic">Topic: ${claim.topic || 'Unknown'}</div>
                    ${claim.reason ? `<div class="reason">Reason: ${claim.reason}</div>` : ''}
                    ${claim.scheme ? `<div class="scheme">Scheme: ${claim.scheme.name}</div>` : ''}
                </div>
            </div>
        `;

        tooltip.style.display = 'block';
        updateTooltipPosition(event);
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // Start the analysis
    fetchClaims()
        .then(claims => displayResults(claims))
        .catch(error => {
            console.error('Failed to analyze page:', error);
            alert('Failed to analyze page for greenwashing claims');
        });
})();
