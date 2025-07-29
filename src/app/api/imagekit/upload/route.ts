import { getUploadAuthParams } from "@imagekit/next/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in to upload files" },
        { status: 401 }
      );
    }

    // Validate environment variables
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      console.error("Missing ImageKit environment variables");
      return NextResponse.json(
        { error: "ImageKit configuration error" },
        { status: 500 }
      );
    }

    // Generate upload authentication parameters
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: privateKey,
      publicKey: publicKey,
      expire: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiry
      // You can optionally add a custom token for additional security
      // token: `upload-${session.user.id}-${Date.now()}`,
    });

    // Return authentication parameters
    return NextResponse.json({ 
      token, 
      expire, 
      signature, 
      publicKey,
      // Optionally include user info for logging/tracking
      userId: sessionId
    });

  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload credentials" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}