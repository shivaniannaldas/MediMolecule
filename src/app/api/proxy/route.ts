import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const invokeUrl = "https://health.api.nvidia.com/v1/biology/nvidia/molmim/generate";

    try {
        const body = await req.json();

        console.log("Sending request to NVIDIA API:", {
            url: invokeUrl,
            bodyLength: JSON.stringify(body).length,
            hasApiKey: !!process.env.NVIDIA_API_KEY
        });
        console.log("API Key being used:", process.env.NVIDIA_API_KEY);


        const response = await fetch(invokeUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`NVIDIA API responded with status ${response.status}`);
        }

        const responseText = await response.text();
        console.log("Raw response from NVIDIA API:", responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            return NextResponse.json({ error: "Invalid JSON response from NVIDIA API" }, { status: 502 });
        }

        console.log("Parsed response from NVIDIA API:", {
            status: response.status,
            dataLength: JSON.stringify(data).length
        });

        return NextResponse.json(data, { status: 200 });
        
    } catch (error: any) {
        console.error("Detailed error in proxy:", {
            message: error.message,
            stack: error.stack,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data
            } : null
        });

        return NextResponse.json(
            {
                error: "Something went wrong",
                details: error.message
            },
            {
                status: error.response?.status || 500
            }
        );
    }
}