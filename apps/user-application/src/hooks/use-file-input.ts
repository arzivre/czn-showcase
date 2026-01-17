import { useState, useCallback, ChangeEvent } from 'react';
import { toast } from 'sonner';

interface UseFileInputOptions {
  maxSize?: number;
  accept?: string[];
  multiple?: boolean;
}

interface UseFileInputReturn {
  files: File[];
  previews: string[];
  error: string | null;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  clearFiles: () => void;
  removeFile: (index: number) => void;
}

const useFileInput = (options: UseFileInputOptions = {}): UseFileInputReturn => {
  const {
    maxSize = 2, // MB
    accept = ['*/*'],
    multiple = false
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    // Size validation
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      setError(`File "${file.name}" exceeds ${maxSize}MB limit`);
      toast.error(`File "${file.name}" exceeds ${maxSize}MB limit`)
      return false;
    }

    // Type validation
    if (accept[0] !== '*/*') {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const fileType = file.type;

      const isAccepted = accept.some(type => {
        if (type.startsWith('.')) {
          return type.toLowerCase() === fileExtension;
        }
        if (type.includes('/')) {
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return fileType.startsWith(category + '/');
          }
          return fileType === type;
        }
        return false;
      });

      if (!isAccepted) {
        setError(`File type of "${file.name}" is not supported`);
        toast.error(`File type of "${file.name}" is not supported`)
        return false;
      }
    }

    return true;
  }, [accept, maxSize]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = event.target.files;

    if (!selectedFiles || selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          newPreviews.push(preview);
        } else {
          newPreviews.push('');
        }
      }
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setFiles(validFiles);
      setPreviews(newPreviews);
    }
  }, [multiple, validateFile]);

  const clearFiles = useCallback(() => {
    // Clean up object URLs
    previews.forEach(preview => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    });
    setFiles([]);
    setPreviews([]);
    setError(null);
  }, [previews]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]);
      }
      return newPreviews.filter((_, i) => i !== index);
    });
  }, []);

  return {
    files,
    previews,
    error,
    handleFileChange,
    clearFiles,
    removeFile
  };
};

export default useFileInput;