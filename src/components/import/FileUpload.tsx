import { useCallback, useState } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFile?: File | null;
}

export function FileUpload({ onFileSelect, acceptedFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : acceptedFile
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {acceptedFile ? (
            <>
              <Check className="w-12 h-12 text-green-500 mb-4" />
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Arquivo selecionado
              </p>
              <p className="text-xs text-gray-500">{acceptedFile.name}</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">CSV apenas</p>
            </>
          )}
        </div>
      </label>

      {acceptedFile && (
        <button
          onClick={() => onFileSelect(null)}
          className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <X className="w-4 h-4" />
          Remover arquivo
        </button>
      )}
    </div>
  );
}
