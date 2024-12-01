import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.ensureDir(uploadsDir);
  const outputDir = path.join(uploadsDir, Date.now().toString());
  await fs.ensureDir(outputDir);

  const protocPath = path.join(
    process.cwd(),
    "vendor",
    "protoc",
    "bin",
    "protoc"
  );

  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(outputDir, file.name);
    await fs.writeFile(filePath, buffer);

    // Run protoc command with explicit proto_path
    const command = `${protocPath} \
      --proto_path=${outputDir} \
      --js_out=import_style=commonjs:${outputDir} \
      --grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:${outputDir} \
      ${file.name}`;

    // Execute protoc command in the output directory
    const { stdout, stderr } = await execAsync(command, { cwd: outputDir });

    // Get list of generated files
    const generatedFiles = await fs.readdir(outputDir);
    const nonOriginalFiles = generatedFiles.filter(
      (f) => path.extname(f) !== ".proto" && f !== file.name
    );

    // Remove the original .proto file
    await fs.remove(filePath);

    return NextResponse.json({
      files: nonOriginalFiles,
      stdout: stdout,
      stderr: stderr,
    });
  } catch (error) {
    console.error("Proto generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Proto generation failed: ${error.message}`
            : "Failed to generate proto files",
      },
      { status: 500 }
    );
  }
}
