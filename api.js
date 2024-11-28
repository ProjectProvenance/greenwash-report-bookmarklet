// API related functionality for the greenwashing analyzer

async function fetchGreenwashingAnalysis(pageSource, pageUrl) {
    const myHeaders = new Headers();
    myHeaders.append("Provenance-Api-Key", "09e6909c-13ac-47cd-afb3-a31b3a6e9804");

    // Build URL with query parameters
    const url = new URL("https://api.provenance-app.test/v1/claims/extract");
    url.searchParams.append("url", pageUrl);
    
    if (pageSource) {
        // Super aggressive HTML compression for testing:
        const compressedSource = pageSource
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/<(script|style|head|nav|footer|iframe|img|svg|video|audio|meta|link|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '') // Remove non-content tags
            .replace(/<[^>]*>/g, ' ') // Replace remaining tags with space
            .replace(/&nbsp;/g, ' ') // Replace HTML spaces
            .replace(/&[a-z]+;/g, ' ') // Replace other HTML entities
            .replace(/[^\x20-\x7E\s]/g, '') // Remove non-ASCII characters
            .replace(/\s+/g, ' ') // Collapse whitespace
            // Only keep sentences that might contain environmental claims
            .split(/[.!?]+/)
            .filter(sentence => {
                const envKeywords = /sustain|eco|environment|green|climate|carbon|natural|organic|biodegradable|renewable/i;
                return sentence.trim().length > 20 && // Reasonable sentence length
                       sentence.trim().length < 200 && // Not too long
                       envKeywords.test(sentence); // Contains environmental keywords
            })
            .slice(0, 10) // Only keep first 10 matching sentences
            .join('. ') // Rejoin with periods
            .trim();

        console.log('Compressed length:', compressedSource.length);
        console.log('Compressed text:', compressedSource);

        // Ensure the string is clean before encoding
        const cleanedSource = compressedSource
            .normalize('NFKD') // Normalize Unicode
            .replace(/[\u0080-\uFFFF]/g, ''); // Remove non-ASCII chars

        const encodedSource = btoa(cleanedSource);
        url.searchParams.append("source", encodedSource);
    }

    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: myHeaders
        });

        return await response.json();
    } catch (error) {
        console.error("Error analyzing page:", error);
        throw new Error("Failed to analyze page for greenwashing claims");
    }
}

// Export for use in main.js
window.greenwashingAPI = {
    fetchGreenwashingAnalysis
}; 