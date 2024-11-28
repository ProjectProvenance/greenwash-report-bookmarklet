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
    "eco-friendly",
    // from https://www.ocado.com/products/naked-sprout-unbleached-bamboo-toilet-roll-603420011
    "UK's most sustainable",
    "50% smaller climate footprint than other eco brands",
    "Manufactured using 100% renewable energy",
    "HIGHEST RATED B Corp",
    "free from harsh chemicals and plastic",
    "Other manufacturers use bleaching agents and harsh chemicals",
    "FSC Certified",
    "direct impact on the planet and the community",
    "supported 300,000+ people with clean water",
    "saved 2.3 million kg of CO2e",
    "saved 15,080 trees",
    "saved 223,191 kg of plastic",
    "saved 117,507 litres of harsh chemicals",
    // selection from https://docs.google.com/spreadsheets/d/1gk3zi3nsyOJNFbkRITMeVoCy4ivGVdUHkVBJd1sqOLU/edit?gid=735470330#gid=735470330
    "% natural fibres packaging",
    "% natural-origin ingredient",
    "% natural-origin packaging",
    "% pure",
    "% purity",
    "0 allergens",
    "0% allergens",
    "environmental impact",
    "waste sent to landfill",
    "waste to landfill",
    "0% waste",
    "0% harsh",
    "0% irritation",
    "0% micro-plastic",
    "0% nasties",
    "0% nonsense",
    "0% palm",
    "0% paraben",
    "100% certificated",
    "100% certified",
    "100% chemical-free",
    "100% circular",
    "100% circular mission",
    "100% clean",
    "100% clean ingredient",
    "100% climate",
    "100% climate-neutralised",
    "100% climate-neutralized",
    "100% co2 neutral",
    "100% colombian",
    "100% compostable",
    "100% cornish",
    "100% cruelty-free",
    "100% Devonshire",,
    "100% Egyptian",
    "100% en13432",
    "100% English",
    "100% ethical",
    "100% ethically",
    "100% eu",
    "100% european",
    "100% fair",
    "100% fair-trade",
    "100% fairly-owned",
    "100% fairly-sourced",
    "100% fairtrade",
    "100% natiural",
    "100% natural cbd",
    "100% natural ingredients",
    "100% natural raw materials",
    "100% natural renewable",
    "100% natural vitamin",
    "100% natural-origin",
    "100% natural-origin formula",
    "100% naturally-derived",
    "100% rainforest Alliance",
    "100% recycable",
    "100% recyclable",
    "100% recycle",
    "responsibly sourced",
    "sustainably grown",
    "addressing environmental concerns",
    "allergy-free",
    "allergy-friendly",
    "Animal Equality",
    "animal-friendly",
    "approved by the planet",
    "approved for all skin",
    "approved for food waste",
    "approved for organic products",
    "approved for skin tolerance",
    "as nature intended",
    "as huge animal lovers",
    "assured halal",
    "assured welfare standards",
    "authentically-sourced",
    "award-winning welfare standards",
    "being kind to animals",
    "beneficial impact",
    "benefit all people communities and the planet",
    "benefit tea growing communities and the environment",
    "best for the animal's welfare",
    "best in class supply chains from a welfare perspective",
    "best of nature",
    "better beef",
    "better for animals the earth and you",
    "Better for Everyone",
    "better for farmers",
    "better for little tummies",
    "better for nature",
    "better for our environment",
    "better for our farmers",
    "better for our health, our animals and the environment",
    "better for our planet",
    "better for our wellbeing",
    "better for our world",
    "better for people and planet",
    "better for the climate",
    "better for the earth",
    "better for the environment",
    "better for the farmers",
    "better for the oceans",
    "better for the people",
    "Better for the planet",
    "better for the soil",
    "better for your birds",
    "better for your health, the environment, our animals",
    "better fuel efficiency",
    "better future",
    "better future for cocoa farmers",
    "better future for people",
    "better future world",
    "better our people community",
    "better planet",
    "better plants",
    "better soil",
    "better world",
    "carefully tested",
    "Carefully-grown",
    "Carefully-harvested",
    "carefully-sourced",
    "cares about the environment",
    "cares for the environment",
    "cares for the planet",
    "caretaking the wild ecosystems",
    "Caring for Animals",
    "caring for our environment",
    "caring for the planet",
    "climate-positive",
    "climate-positivity",
    "climate-protection",
    "climate-safe",
    "climate-smart",
    "climate-transparency",
    "committed to doing right",
    "committed to environmental",
    "committed to our community",
    "committed to reducing waste",
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