// S3 presigned URL helper
// In Produktion: AWS SDK v3 nutzen
// Für Portfolio-Demo: kann auch durch lokalen File-Storage ersetzt werden

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  // TODO: AWS SDK v3 PutObjectCommand + getSignedUrl
  // Placeholder für Demo
  throw new Error("S3 not configured yet");
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  // TODO: AWS SDK v3 GetObjectCommand + getSignedUrl
  // Placeholder für Demo
  throw new Error("S3 not configured yet");
}

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["application/pdf"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Nur PDF-Dateien erlaubt" };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "Datei darf maximal 10MB groß sein" };
  }

  return { valid: true };
}
