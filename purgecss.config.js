module.exports = {
    content: [
        "_site/**/*.html",
        "_site/**/*.js"
    ],
    css: [
        "_site/assets/css/*.css"
    ],
    output: "_site/assets/css/",
    // Demo states are set through dataset/classList at runtime and may not
    // appear as literal selectors in the generated HTML or minified scripts.
    safelist: {
        greedy: [/proso-/, /thought-/, /chat-/, /ramble-/]
    },
    // Also preserve attribute selectors inside :is(), which PurgeCSS checks
    // independently from their surrounding component selector.
    dynamicAttributes: ["data-stage", "data-step", "data-result"],
    skippedContentGlobs: [
        "_site/assets/**/*.html"
    ]
};
