async function convertImageToWebP(
  file: File,
  quality: number = 80
): Promise<Blob> {
  if (file.type === 'image/webp') {
    // Already WebP – no conversion needed
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onerror = () => reject(new Error('Failed to load image'));
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          resolve(blob);
        },
        'image/webp',
        quality / 100
      );
    };

    img.src = URL.createObjectURL(file);
  });
}