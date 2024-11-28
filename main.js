// This code is meant to run in an IIFE inside of a bookmarklet.
// Ensure it is properly minified and URL-encoded before using in production.

// If bookmarklet already used, prevent from using twice
if (window.greenwashBookmarklet) return;
window.greenwashBookmarklet = true;

// Function to analyze the page content
async function analyzePage() {
    const pageSource = document.documentElement.outerHTML;
    const pageUrl = window.location.href;

    try {
        const result = await window.greenwashingAPI.fetchGreenwashingAnalysis(pageSource, pageUrl);
        processResults(result);
    } catch (error) {
        console.error("Error analyzing page:", error);
        alert("Failed to analyze page for greenwashing claims");
    }
}

// Function to process API results and highlight claims
function processResults(apiResponse) {
    console.log('Raw API Response:', apiResponse);

    // Check if apiResponse is a string (JSON string)
    if (typeof apiResponse === 'string') {
        console.log('Response is a string, attempting to parse');
        try {
            apiResponse = JSON.parse(apiResponse);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            alert('Error parsing API response');
            return;
        }
    }

    console.log('Processed API Response:', apiResponse);

    // Extract claims and ensure Exact Phrase exists
    const claims = (apiResponse.claims || [])
        .filter(claim => claim && claim['Exact Phrase']);
    
    console.log('Filtered claims:', claims);
    console.log('Number of claims:', claims.length);

    if (claims.length === 0) {
        console.log('No valid claims found. Claims structure:', apiResponse.claims);
        alert('No valid greenwashing claims found!');
        return;
    }

    try {
        // Map the API response structure to what our code expects
        const mappedClaims = claims.map(claim => ({
            text: claim['Exact Phrase'],
            category: claim['Topic'],
            confidence: null,
            explanation: `${claim['Greenwash Risk']} - ${claim['Reason']}`
        }));

        console.log('Mapped claims:', mappedClaims);

        const regex = new RegExp(mappedClaims.map(claim => 
            `(${escapeRegExp(claim.text)})`).join('|'), 'gi'
        );
        
        console.log('Created regex:', regex);

        // Highlight matching terms
        wrapMatchingTextNodes(regex);
        
        // Show summary of findings with categories
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
            <p>Found ${mappedClaims.length} potential greenwashing claims:</p>
            ${mappedClaims.map(claim => `
                <div style="margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                    <div style="font-weight: bold; color: #d32f2f;">"${claim.text}"</div>
                    <div style="font-size: 0.9em; color: #666;">
                        Category: ${claim.category || 'Unknown'}<br>
                        Risk Level: ${claim.explanation}<br>
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
    } catch (error) {
        console.error('Error processing claims:', error);
        console.error('Error details:', {
            apiResponse,
            claims
        });
        alert('Error processing greenwashing claims');
    }
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

// Start the analysis when the bookmarklet runs
analyzePage();