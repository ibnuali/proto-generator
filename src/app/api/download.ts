import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs-extra';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { filename } = req.query;

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    // Find the most recent upload directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const uploadDirs = await fs.readdir(uploadsDir);
    const latestUploadDir = path.join(uploadsDir, uploadDirs[uploadDirs.length - 1]);

    const filePath = path.join(latestUploadDir, filename as string);

    // Check if file exists
    await fs.access(filePath);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(404).json({ error: 'File not found' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};