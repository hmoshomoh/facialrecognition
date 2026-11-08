export interface StudentFormData {
  name: string;
  email: string;
  program: string;
  matricNumber: string;
  regNumber: string;
  roomDetails: string;
  gender: string;
  hallOfResidence: string;
  level: string;
}

export interface CapturedImage {
    data: string;
    timestamp?: number;
}
