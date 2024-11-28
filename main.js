(() => {
    // If bookmarklet already used, prevent from using twice
    if (window.greenwashBookmarklet) return;
    window.greenwashBookmarklet = true;

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
        
        // Highlight matching terms
        wrapMatchingTextNodes(regex);

        // Create results popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;

        popup.innerHTML = `
            <h2 style="margin-top: 0; color: #d32f2f;">Greenwashing Claims Detected</h2>
            <p>Found ${claims.length} potential greenwashing claims:</p>
            ${claims.map(claim => `
                <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <div style="font-weight: bold; color: #d32f2f;">"${claim.claim}"</div>
                    <div style="font-size: 0.9em; color: #666;">
                        Risk Level: ${claim.risk_level || 'Unknown'}<br>
                        Topic: ${claim.topic || 'Unknown'}<br>
                        ${claim.reason ? `<div style="margin-top: 5px;">Reason: ${claim.reason}</div>` : ''}
                        ${claim.scheme ? `<div style="margin-top: 5px;">Scheme: ${claim.scheme.name}</div>` : ''}
                    </div>
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
            ">×</button>
        `;

        document.body.appendChild(popup);
    }

    // Escape special regex characters
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Function to wrap matching text nodes
    function wrapMatchingTextNodes(regex) {
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
                    fragment.appendChild(wrapper);
                } else if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }
            });

            node.parentNode.replaceChild(fragment, node);
        });
    }

    // Start the analysis
    fetchClaims()
        .then(claims => displayResults(claims))
        .catch(error => {
            console.error('Failed to analyze page:', error);
            alert('Failed to analyze page for greenwashing claims');
        });
})();
