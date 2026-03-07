import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env file.");
    process.exit(1);
}

async function checkKey() {
    console.log("Checking GEMINI_API_KEY validity...");
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (response.ok) {
            console.log("✅ API Key is VALID and working.");
            console.log("\n⚠️ NOTE ON PAID VS UNPAID:");
            console.log("The Gemini API does not have a direct method to check if a key is on a 'Free' or 'Paid' (Pay-as-you-go) tier programmatically.");
            console.log("However, free tier keys have lower rate limits (e.g., 15 requests per minute for 1.5 Flash).");
            console.log("To confirm your billing status definitively, you must check your account on Google AI Studio (https://aistudio.google.com/) or Google Cloud Console.");
        } else {
            const errorData = await response.json();
            console.error("❌ API Key check failed. Status:", response.status);
            console.error("Error Details:", errorData);
        }
    } catch (error) {
        console.error("❌ Error connecting to Gemini API:", error.message);
    }
}

checkKey();
