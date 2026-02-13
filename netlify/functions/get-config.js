exports.handler = async (event, context) => {
    // Optional: Only allow your own domain to call this
    const referer = event.headers.referer || "";
    
    // Replace 'your-site-name.netlify.app' with your actual domain
    const isAuthorized = referer.includes("localhost") || referer.includes("rdbcrafts.netlify.app");

    if (!isAuthorized) {
        return {
            statusCode: 403,
            body: JSON.stringify({ error: "Access Denied" }),
        };
    }

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // Allow browser fetch
        },
        body: JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_ANON_KEY,
            emailjsKey: process.env.EMAILJS_PUBLIC_KEY
        }),
    };
};