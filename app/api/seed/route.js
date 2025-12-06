import { seedTransactions } from "@/actions/seed";

export async function GET(request) {
    try {
        console.log("Seeding transactions...");
        const result = await seedTransactions();
        console.log("Seed result:", result);
        
        // Check if request wants HTML (browser) or JSON (API call)
        const acceptHeader = request.headers.get('accept') || '';
        const wantsHTML = acceptHeader.includes('text/html');
        
        if (wantsHTML) {
            // Return HTML response for browser viewing
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Seed Transactions</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; }
                        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; }
                        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    </style>
                </head>
                <body>
                    <h1>Transaction Seeding Result</h1>
                    ${result.success 
                        ? `<div class="success">
                            <h2>✅ Success!</h2>
                            <p><strong>Message:</strong> ${result.message}</p>
                            <p><strong>Account:</strong> ${result.accountName}</p>
                            <p><strong>Transactions Created:</strong> ${result.transactionCount}</p>
                           </div>`
                        : `<div class="error">
                            <h2>❌ Error</h2>
                            <p><strong>Error:</strong> ${result.error}</p>
                           </div>`
                    }
                    <h3>Full Response:</h3>
                    <pre>${JSON.stringify(result, null, 2)}</pre>
                </body>
                </html>
            `;
            return new Response(html, {
                status: result.success ? 200 : 400,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        // Return JSON for API calls
        return Response.json(result, { 
            status: result.success ? 200 : 400,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.error("API route error:", error);
        const errorResponse = { 
            success: false, 
            error: error.message || "Failed to seed transactions",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        
        const acceptHeader = request.headers.get('accept') || '';
        const wantsHTML = acceptHeader.includes('text/html');
        
        if (wantsHTML) {
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Seed Transactions - Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; }
                        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
                    </style>
                </head>
                <body>
                    <h1>Transaction Seeding - Error</h1>
                    <div class="error">
                        <h2>❌ Error</h2>
                        <p><strong>Error:</strong> ${errorResponse.error}</p>
                    </div>
                    <h3>Full Response:</h3>
                    <pre>${JSON.stringify(errorResponse, null, 2)}</pre>
                </body>
                </html>
            `;
            return new Response(html, {
                status: 500,
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        return Response.json(errorResponse, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}

