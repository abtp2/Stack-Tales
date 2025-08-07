import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const telegramRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    }),
  });

  const data = await telegramRes.json();
  return NextResponse.json(data);
}

