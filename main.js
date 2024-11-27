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
"and the planet",
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

// Rough outline:
// - [x] if bookmarklet already used, stop
// - [ ] for each term
// - [ ] find term
// - [ ] if found, add to classList
const documentHTML = document.documentElement.outerHTML
const regex = new RegExp(terms.join('|'), 'gi')
const matches = documentHTML.matchAll(regex)
// console.log('matches', matches)

// const flatMatches = Array.from(matches).map((item) => item[0])
// console.log('flatMatches', flatMatches)

// const uniqueMatches = Array.from(new Set(flatMatches))
// console.log('uniqueMatches', uniqueMatches)

const len = uniqueMatches.length
if (len > 0) {
  const result = uniqueMatches.join('\n')
  alert(`${len} matches found: ${result}`)
} else {
  alert('No matches found!')
}

markedText = documentHTML

matches.forEach(match => {
  let regex = new RegExp(match.name, 'gi')
  markedText = markedText.replace(regex, `<mark>$&</mark>`)
})

document.documentElement.outerHTML = markedText
