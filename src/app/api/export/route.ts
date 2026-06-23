import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, content, format } = body;

  if (format === "text") {
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-report.txt"`,
      },
    });
  }

  if (format === "html") {
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${type} Report</title>
<style>
body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
h2 { color: #2d3748; margin-top: 24px; }
p { line-height: 1.6; color: #4a5568; }
ul { color: #4a5568; }
</style></head>
<body>${content}</body>
</html>`;
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-report.html"`,
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
