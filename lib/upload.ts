/**
 * Utilidades para subida de archivos
 */

import api from './api';
import { PresignedUploadResponse } from './types';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
}

/**
 * Sube un archivo a través del flujo de presigned URL
 * 1. Solicita presigned URL al backend
 * 2. Sube el archivo directamente al storage
 * 3. Retorna el ID del media creado
 */
export async function uploadMedia(
  sessionId: string,
  file: {
    uri: string;
    name: string;
    type: string;
  },
  options?: UploadOptions
): Promise<string> {
  // Paso 1: Obtener presigned URL
  const presignedData = await api.getPresignedUploadUrl(
    sessionId,
    file.name,
    file.type
  );

  // Paso 2: Convertir el archivo a Blob para web
  // En React Native, fetch puede manejar el URI directamente
  const response = await fetch(file.uri);
  const blob = await response.blob();

  // Paso 3: Subir el archivo
  await api.uploadFile(presignedData.upload_url, blob);

  return presignedData.media_id;
}

/**
 * Formatea el tamaño de archivo a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida tipo de archivo permitido
 */
export function isValidMediaType(type: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
  ];

  return validTypes.includes(type.toLowerCase());
}

/**
 * Obtiene extensión del archivo
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
