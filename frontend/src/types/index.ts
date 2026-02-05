// Tipos para API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  path?: string;
}

// Tipos para paginação
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Tipos para Artista
export interface Artist {
  id: number;
  name: string;
  country?: string;
  formationYear?: number;
  genre?: string;
  biography?: string;
  imageUrl?: string;
  albumCount?: number;
  albums?: AlbumSummary[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ArtistRequest {
  name: string;
  country?: string;
  formationYear?: number;
  genre?: string;
  biography?: string;
  imageUrl?: string;
  albumIds?: number[];
}

export interface ArtistSummary {
  id: number;
  name: string;
  genre?: string;
  albumCount?: number;
}

// Tipos para Álbum
export interface Album {
  id: number;
  title: string;
  releaseYear?: number;
  genre?: string;
  recordLabel?: string;
  totalTracks?: number;
  description?: string;
  artists?: ArtistSummary[];
  covers?: AlbumCover[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AlbumRequest {
  title: string;
  releaseYear?: number;
  genre?: string;
  recordLabel?: string;
  totalTracks?: number;
  description?: string;
  artistIds?: number[];
}

export interface AlbumSummary {
  id: number;
  title: string;
  releaseYear?: number;
  genre?: string;
  primaryCoverUrl?: string;
}

export interface AlbumCover {
  id: number;
  fileName: string;
  objectKey: string;
  contentType?: string;
  fileSize?: number;
  isPrimary?: boolean;
  presignedUrl?: string;
  url?: string; // Alias for presignedUrl
  createdAt?: string;
}

// Tipos para Autenticação
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role: string;
}

// Tipos para WebSocket
export interface AlbumNotification {
  type: 'NEW_ALBUM' | 'ALBUM_UPDATED' | 'ALBUM_DELETED';
  message: string;
  album?: Album;
  albumId?: number;
  timestamp: string;
}

// Tipos para Regional
export interface Regional {
  id: number;
  externalId: number;
  nome: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SyncResult {
  inserted: number;
  inactivated: number;
  updated: number;
  message: string;
}
