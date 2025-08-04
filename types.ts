export interface Resident {
  id: string;
  name: string;
  nik: string;
  kk: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  status: 'Aktif' | 'Pindah' | 'Meninggal';
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai';
}

export interface SocialAidProgram {
  id: string;
  name: string;
  target: string;
  budget: number;
  distributionDate: string;
  recipients: number;
}

export interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    isStreaming?: boolean;
}

export interface User {
    uid: string;
    name: string;
    email: string;
    role: string;
}