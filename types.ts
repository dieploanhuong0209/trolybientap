
export type FormatType = 'social' | 'share_link' | 'viral_clip' | 'mutex_video' | 'editorial';

export type MediaGroup = 'political' | 'financial' | 'youth';

export interface EditorConfig {
  formats: FormatType[]; // Changed to array for multi-selection
  quantity: number; // For social posts
  socialRequirement?: string; // New field for specific user instructions
  duration: string; // For videos (e.g., "60s", "30s")
  mediaGroup: MediaGroup; // For editorial
  editPercent: number; // For editorial (10-100)
}

export type SectionType = 'audit' | FormatType;

export interface GeneratedSection {
  id: string;
  type: SectionType;
  title: string;
  history: string[]; // Store all versions here
  currentIndex: number; // Pointer to the currently visible version
  isRegenerating: boolean;
}

export const MEDIA_GROUPS: Record<MediaGroup, { label: string; desc: string; examples: string }> = {
  political: {
    label: 'Chính Luận',
    desc: 'Khách quan, trang trọng, cấu trúc tin tức ngược.',
    examples: 'VnExpress, Tuổi Trẻ, Thanh Niên, Dân Trí, VTV'
  },
  financial: {
    label: 'Tài Chính / Kinh Doanh',
    desc: 'Chuyên sâu, phân tích, số liệu, thuật ngữ.',
    examples: 'CafeF, CafeBiz, Đầu Tư'
  },
  youth: {
    label: 'Giới Trẻ / Giải Trí',
    desc: 'Bắt trend, storytelling, gần gũi.',
    examples: 'Kenh14, Znews, Soha'
  }
};
