export interface ProcessedImage {
  original: string; // Base64
  result: string | null; // Base64
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ProcessingError {
  message: string;
  details?: string;
}
