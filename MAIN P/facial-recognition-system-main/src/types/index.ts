// types/index.ts
export interface CapturedImage {
  data: string; // base64 image data
  timestamp: number;
}

export interface StudentData {
  name: string;
  matricNumber: string;
  regNumber: string;
  program: string;
  level: string;
  email: string;
  hallOfResidence: string;
  roomDetails: string;
  gender: string;
}
