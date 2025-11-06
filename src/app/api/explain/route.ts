import { NextResponse } from "next/server";
import axios from "axios";
import { error } from "console";

export async function POST(req: Request) {
  const { code } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({
      error: "Node code provided",
      status: 400,
    });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful programming assistant. Explain the provided code clearly, concisely, and simply.",
          },
          {
            role: "user",
            content: `Explain this code: \n\n${code}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Code Explainer",
        },
      }
    );

    return NextResponse.json({
      explanation: response.data.choices[0].message.content,
    });
  } catch {
    console.error("OpenRouter API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate explanation.",
      },
      {
        status: 500,
      }
    );
  }
}
