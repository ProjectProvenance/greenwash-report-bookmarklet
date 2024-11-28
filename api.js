// API related functionality for the greenwashing analyzer

async function fetchGreenwashingAnalysis(pageSource, pageUrl) {
    const myHeaders = new Headers();
    myHeaders.append("Provenance-Api-Key", "09e6909c-13ac-47cd-afb3-a31b3a6e9804");

    // Build URL with query parameters
    const url = new URL("https://api.provenance-app.test/v1/claims/extract");
    url.searchParams.append("url", pageUrl);
    
    if (pageSource) {
        // More aggressive HTML compression:
        // 1. Remove all HTML comments, scripts, styles
        // 2. Remove common HTML elements that rarely contain relevant text
        // 3. Extract text content more efficiently
        const compressedSource = pageSource
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/<(script|style|head|nav|footer|iframe|img|svg|video|audio)[^>]*>[\s\S]*?<\/\1>/gi, '') // Remove non-content tags
            .replace(/<[^>]*>/g, ' ') // Replace remaining tags with space
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
            .split(/\n+/) // Split into lines
            .filter(line => line.trim().length > 10) // Only keep lines with substantial content
            .join('\n')
            .trim();

        // Check compressed size
        const encodedSource = btoa(compressedSource);
        
        // If encoded source is too large (>8KB), split into chunks
        const MAX_CHUNK_SIZE = 8000; // 8KB per request
        if (encodedSource.length > MAX_CHUNK_SIZE) {
            console.log(`Source too large (${encodedSource.length} bytes), splitting into chunks`);
            
            // Split the source into chunks and make multiple requests
            const chunks = [];
            for (let i = 0; i < encodedSource.length; i += MAX_CHUNK_SIZE) {
                chunks.push(encodedSource.slice(i, i + MAX_CHUNK_SIZE));
            }
            
            // Only send the first chunk for now
            // TODO: Implement proper chunking if needed
            url.searchParams.append("source", chunks[0]);
            console.log(`Sending first chunk of ${chunks[0].length} bytes`);
        } else {
            url.searchParams.append("source", encodedSource);
        }
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