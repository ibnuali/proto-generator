import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    // Find the most recent upload directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadDirs = await fs.readdir(uploadsDir);
    const latestUploadDir = path.join(uploadsDir, uploadDirs[uploadDirs.length - 1]);

    const filePath = path.join(latestUploadDir, filename);

    // Check if file exists
    await fs.access(filePath);

    // Read file
    const file = await fs.readFile(filePath);

    // Create response with file
    const response = new NextResponse(file);
    response.headers.set('Content-Type', 'application/octet-stream');
    response.headers.set('Content-Disposition', `attachment; filename=${filename}`);

    return response;
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}