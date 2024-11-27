// This code is meant to run in an IIFE inside of a bookmarklet.
// Ensure it is properly minified and URL-encoded before using in production.

// If bookmarklet already used, prevent from using twice
if (window.greenwashBookmarklet) return;
window.greenwashBookmarklet = true

const terms = [
    "create positive planetary change",
    "Eco-Chef",
    "live more sustainably",
    "minimize your impact on the environment",
    "evidence-based blueprint",
    "greener way of eating",
    "globally agreed scientific targets",
    "tackling climate change",
    "tackle climate change",
    "reducing food waste",
    "reduce food waste",
    "sustainable food",
    "Eat to Save the Planet",
    "climate-conscious way",
    "planet-friendly",
]

const regex = new RegExp(terms.map(term => `(${escapeRegExp(term)})`).join('|'), 'gi')

const documentHTML = document.documentElement.outerHTML
const matches = documentHTML.matchAll(regex)
const flatMatches = Array.from(matches).map((item) => item[0])
const uniqueMatches = Array.from(new Set(flatMatches))

const len = uniqueMatches.length
if (len > 0) {
    const result = uniqueMatches.join('\n')
    alert(`${len} matches found: ${result}`)
} else {
    alert('No matches found!')
}

// Escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Function to walk and modify text nodes
function wrapMatchingTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

    const nodesToReplace = []
    let node

    // First, collect nodes to replace to avoid modifying the tree during traversal
    while (node = walker.nextNode()) {
        if (regex.test(node.textContent)) {
            nodesToReplace.push(node)
        }
    }

    // Now replace the collected nodes
    nodesToReplace.forEach(node => {
        const text = node.textContent
        const fragment = document.createDocumentFragment()
        const parts = text.split(regex)

        parts.forEach(part => {
            if (regex.test(part)) {
                // Matched phrase
                const wrapper = document.createElement('mark')
                wrapper.classList.add('match')
                wrapper.textContent = part
                fragment.appendChild(wrapper)
            } else if (part) {
                // Non-matched text - keep as text node
                fragment.appendChild(document.createTextNode(part))
            }
        })

        // Replace the original node with the fragment
        node.parentNode.replaceChild(fragment, node)
    })
}

// Call the function to wrap matching text nodes
wrapMatchingTextNodes()