import { StickerItem, BackgroundPreset, FrameItem } from '../types';

/**
 * BỘ SƯU TẬP STICKER TRUNG THU & HƯỚNG ĐẠO BẦY TIÊN SA
 * Bao gồm:
 * 1. Các huy hiệu, linh vật Bầy Tiên Sa chính thức (file PNG không nền trong /public/stickers/)
 * 2. Bộ icon Trung Thu truyền thống tinh xảo & sắc nét (SVG chất lượng cao)
 */
export const STICKERS: StickerItem[] = [
  // ================= BẦY TIÊN SA & HƯỚNG ĐẠO (PNG CHÍNH THỨC) =================
  {
    id: 'soi-hu-trang',
    name: 'Sói cùng Vầng Trăng',
    imageUrl: '/stickers/42.png',
    category: 'character',
  },
  {
    id: 'dau-soi-vang',
    name: 'Sói con Tiên Sa',
    imageUrl: '/stickers/43.png',
    category: 'character',
  },
  {
    id: 'hai-ly-vui-ve',
    name: 'Hải Ly Vui Vẻ',
    imageUrl: '/stickers/44.png',
    category: 'character',
  },
  {
    id: 'bach-hop-do-vang',
    name: 'Hoa Bách Hợp',
    imageUrl: '/stickers/45.png',
    category: 'character',
  },
  {
    id: 'huy-hieu-tien-sa',
    name: 'Logo Kha',
    imageUrl: '/stickers/46.png',
    category: 'character',
  },
  {
    id: 'huy-hieu-rys',
    name: 'Logo Tráng',
    imageUrl: '/stickers/47.png',
    category: 'character',
  },
  {
    id: 'bach-hop-sap-san',
    name: 'Hoa Bách Hợp',
    imageUrl: '/stickers/48.png',
    category: 'character',
  },
  {
    id: 'bieu-tuong-soi-trang',
    name: 'Sói Trắng',
    imageUrl: '/stickers/49.png',
    category: 'character',
  },

  // ================= VĂN HÓA TRUNG THU TRUYỀN THỐNG (SVG TINH XẢO) =================
  {
    id: 'den-ong-sao-dac-biet',
    name: 'Đèn Ông Sao Rực Rỡ',
    category: 'lantern',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="100%" stop-color="#e11d48"/>
        </radialGradient>
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <!-- Vòng tre tròn bên ngoài -->
      <circle cx="50" cy="46" r="35" stroke="url(#goldRim)" stroke-width="3" fill="none" opacity="0.95"/>
      <circle cx="50" cy="46" r="32" stroke="#dc2626" stroke-width="1" stroke-dasharray="3 2" fill="none"/>
      <!-- Cánh sao 5 cánh lộng lẫy -->
      <polygon points="50,14 58,36 81,36 63,50 70,72 50,58 30,72 37,50 19,36 42,36" fill="url(#starGlow)" stroke="#fde047" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Tâm sao hoa văn tròn -->
      <circle cx="50" cy="46" r="10" fill="#facc15" stroke="#b45309" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="6" fill="#dc2626"/>
      <circle cx="50" cy="46" r="2.5" fill="#fef08a"/>
      <!-- Nan tre & Cán cầm lồng đèn -->
      <line x1="50" y1="81" x2="50" y2="98" stroke="#d97706" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Tua rua ngũ sắc phía dưới -->
      <path d="M 45 82 L 42 94 M 50 82 L 50 97 M 55 82 L 58 94" stroke="#e11d48" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'den-long-hoi-an',
    name: 'Lồng Đèn Hội An',
    category: 'lantern',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="silkLantern" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ff4d4f"/>
          <stop offset="70%" stop-color="#cf1322"/>
          <stop offset="100%" stop-color="#820014"/>
        </radialGradient>
      </defs>
      <!-- Dây treo phía trên -->
      <line x1="50" y1="4" x2="50" y2="16" stroke="#fadb14" stroke-width="2.5"/>
      <!-- Cổ đèn mạ vàng trên -->
      <rect x="36" y="16" width="28" height="7" rx="3" fill="#faad14" stroke="#d48806" stroke-width="1.5"/>
      <!-- Thân đèn quả trám lụa đỏ căng mọng -->
      <path d="M 36 23 C 12 40, 12 60, 36 77 L 64 77 C 88 60, 88 40, 64 23 Z" fill="url(#silkLantern)" stroke="#ffd666" stroke-width="2"/>
      <!-- Đường gân lụa đèn lồng -->
      <path d="M 50 23 L 50 77 M 42 23 C 32 40, 32 60, 42 77 M 58 23 C 68 40, 68 60, 58 77" fill="none" stroke="#ffd666" stroke-width="1.5" opacity="0.8"/>
      <!-- Đế đèn mạ vàng dưới -->
      <rect x="36" y="77" width="28" height="7" rx="3" fill="#faad14" stroke="#d48806" stroke-width="1.5"/>
      <!-- Tua rua tơ vàng rủ xuống -->
      <line x1="50" y1="84" x2="50" y2="98" stroke="#faad14" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="98" r="2.5" fill="#f5222d"/>
    </svg>`,
  },
  {
    id: 'den-ca-chep-hoa-rong',
    name: 'Đèn Cá Chép Trông Trăng',
    category: 'lantern',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="carpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fa8c16"/>
          <stop offset="50%" stop-color="#fa541c"/>
          <stop offset="100%" stop-color="#f5222d"/>
        </linearGradient>
      </defs>
      <!-- Vây trên & vây dưới -->
      <path d="M 45 28 Q 55 18 65 30 Z" fill="#fa8c16" stroke="#d4380d" stroke-width="1.5"/>
      <path d="M 45 72 Q 55 82 65 70 Z" fill="#fa8c16" stroke="#d4380d" stroke-width="1.5"/>
      <!-- Thân cá chép uốn lượn -->
      <path d="M 25 50 C 35 28, 75 28, 82 50 C 75 72, 35 72, 25 50 Z" fill="url(#carpGrad)" stroke="#ffd591" stroke-width="2"/>
      <!-- Đuôi cá xoè rộng kiêu sa -->
      <path d="M 25 50 Q 8 32 15 50 Q 8 68 25 50 Z" fill="#fa541c" stroke="#d4380d" stroke-width="1.5"/>
      <!-- Vảy cá lấp lánh ánh kim -->
      <path d="M 46 42 Q 52 50 46 58 M 56 40 Q 62 50 56 60 M 66 42 Q 72 50 66 58" fill="none" stroke="#ffe58f" stroke-width="2" stroke-linecap="round"/>
      <!-- Mắt cá đen láy tròn xoe -->
      <circle cx="75" cy="46" r="4.5" fill="#ffffff"/>
      <circle cx="76" cy="46" r="2.8" fill="#000000"/>
      <circle cx="77" cy="45" r="1" fill="#ffffff"/>
      <!-- Râu cá chép ngộ nghĩnh -->
      <path d="M 82 48 Q 92 44 88 54" fill="none" stroke="#faad14" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'dau-lan-su-rong',
    name: 'Đầu Lân Rực Rỡ',
    category: 'character',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lionHead" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ff4d4f"/>
          <stop offset="100%" stop-color="#a8071a"/>
        </radialGradient>
      </defs>
      <!-- Sừng Lân & Bờm vàng -->
      <polygon points="50,10 42,26 58,26" fill="#faad14" stroke="#d48806" stroke-width="2"/>
      <circle cx="50" cy="10" r="3.5" fill="#f5222d"/>
      <path d="M 22 36 Q 14 20 30 24 M 78 36 Q 86 20 70 24" fill="none" stroke="#fa8c16" stroke-width="3" stroke-linecap="round"/>
      <!-- Khung đầu lân -->
      <ellipse cx="50" cy="48" rx="34" ry="26" fill="url(#lionHead)" stroke="#ffd666" stroke-width="2.5"/>
      <!-- 2 Mắt lân to tròn chớp sáng -->
      <circle cx="34" cy="44" r="12" fill="#fffbe6" stroke="#faad14" stroke-width="2.5"/>
      <circle cx="34" cy="44" r="6" fill="#141414"/>
      <circle cx="32" cy="42" r="2" fill="#ffffff"/>
      <circle cx="66" cy="44" r="12" fill="#fffbe6" stroke="#faad14" stroke-width="2.5"/>
      <circle cx="66" cy="44" r="6" fill="#141414"/>
      <circle cx="64" cy="42" r="2" fill="#ffffff"/>
      <!-- Mũi Lân & Quả Cầu đỏ -->
      <circle cx="50" cy="48" r="6" fill="#faad14" stroke="#ad6800" stroke-width="1.5"/>
      <!-- Miệng Lân cười toe toét & Râu Lân ngũ sắc -->
      <path d="M 26 62 Q 50 84 74 62" fill="#faad14" stroke="#873800" stroke-width="2"/>
      <path d="M 32 64 Q 50 78 68 64" fill="#ffffff"/>
      <path d="M 24 70 Q 18 86 34 82 M 76 70 Q 82 86 66 82" stroke="#ff4d4f" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`,
  },
  {
    id: 'banh-trung-thu-nuong',
    name: 'Bánh Nướng Thập Cẩm',
    category: 'moon',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cakeCrust" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#fa8c16"/>
          <stop offset="60%" stop-color="#d46b08"/>
          <stop offset="100%" stop-color="#873800"/>
        </radialGradient>
      </defs>
      <!-- Khối bánh nướng vàng ruộm hình cánh hoa -->
      <rect x="15" y="15" width="70" height="70" rx="20" fill="url(#cakeCrust)" stroke="#ffd591" stroke-width="2"/>
      <!-- Đường viền hoa văn viền bánh -->
      <circle cx="50" cy="50" r="28" fill="none" stroke="#ffe58f" stroke-width="2" stroke-dasharray="6 3"/>
      <circle cx="50" cy="50" r="21" fill="#ad4e00" stroke="#ffd591" stroke-width="1.5"/>
      <!-- Chữ Phúc / Thu thư pháp may mắn -->
      <text x="50" y="56" font-size="16" font-family="'Quicksand', 'Comfortaa', sans-serif" font-weight="900" fill="#fff1b8" text-anchor="middle">PHÚC</text>
      <!-- Cánh hoa trang trí 4 góc bánh -->
      <circle cx="26" cy="26" r="3.5" fill="#ffe58f"/>
      <circle cx="74" cy="26" r="3.5" fill="#ffe58f"/>
      <circle cx="26" cy="74" r="3.5" fill="#ffe58f"/>
      <circle cx="74" cy="74" r="3.5" fill="#ffe58f"/>
    </svg>`,
  },
  {
    id: 'banh-deo-hoa-cuc',
    name: 'Bánh Dẻo Tuyết Trắng',
    category: 'moon',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="snowCake" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="80%" stop-color="#f0f5ff"/>
          <stop offset="100%" stop-color="#d6e4ff"/>
        </radialGradient>
      </defs>
      <!-- Khối bánh dẻo hoa cúc thanh tao -->
      <circle cx="50" cy="50" r="36" fill="url(#snowCake)" stroke="#adc6ff" stroke-width="2"/>
      <!-- Cánh hoa sen / cúc dập nổi -->
      <ellipse cx="50" cy="30" rx="6" ry="11" fill="#f0f5ff" stroke="#91caff" stroke-width="1"/>
      <ellipse cx="50" cy="70" rx="6" ry="11" fill="#f0f5ff" stroke="#91caff" stroke-width="1"/>
      <ellipse cx="30" cy="50" rx="11" ry="6" fill="#f0f5ff" stroke="#91caff" stroke-width="1"/>
      <ellipse cx="70" cy="50" rx="11" ry="6" fill="#f0f5ff" stroke="#91caff" stroke-width="1"/>
      <!-- Nhụy hoa tròn giữa bánh -->
      <circle cx="50" cy="50" r="10" fill="#fffbe6" stroke="#ffe58f" stroke-width="2"/>
      <circle cx="50" cy="50" r="5" fill="#ffd666"/>
    </svg>`,
  },
  {
    id: 'tho-ngoc-cung-trang',
    name: 'Thỏ Ngọc Giã Thuốc',
    category: 'character',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Tai thỏ dài đáng yêu -->
      <ellipse cx="40" cy="18" rx="5.5" ry="14" fill="#ffffff" stroke="#f0f0f0" stroke-width="2" transform="rotate(-10 40 18)"/>
      <ellipse cx="40" cy="18" rx="3" ry="10" fill="#ffadd2" transform="rotate(-10 40 18)"/>
      <ellipse cx="60" cy="18" rx="5.5" ry="14" fill="#ffffff" stroke="#f0f0f0" stroke-width="2" transform="rotate(10 60 18)"/>
      <ellipse cx="60" cy="18" rx="3" ry="10" fill="#ffadd2" transform="rotate(10 60 18)"/>
      <!-- Đầu thỏ trắng tuyết -->
      <ellipse cx="50" cy="38" rx="20" ry="17" fill="#ffffff" stroke="#f0f0f0" stroke-width="1.5"/>
      <!-- Thân thỏ tròn xoe -->
      <ellipse cx="50" cy="66" rx="23" ry="24" fill="#ffffff" stroke="#f0f0f0" stroke-width="1.5"/>
      <!-- Đôi mắt long lanh hạt huyền -->
      <circle cx="43" cy="36" r="3" fill="#141414"/>
      <circle cx="42" cy="35" r="1" fill="#ffffff"/>
      <circle cx="57" cy="36" r="3" fill="#141414"/>
      <circle cx="56" cy="35" r="1" fill="#ffffff"/>
      <!-- Má hồng ửng đào -->
      <circle cx="36" cy="42" r="3.5" fill="#ff85c0" opacity="0.6"/>
      <circle cx="64" cy="42" r="3.5" fill="#ff85c0" opacity="0.6"/>
      <polygon points="50,42 47,39 53,39" fill="#f5222d"/>
      <!-- Chày ngọc giã thuốc thần -->
      <rect x="47" y="52" width="6" height="32" rx="3" fill="#ffd666" stroke="#d48806" stroke-width="1.5" transform="rotate(20 50 68)"/>
    </svg>`,
  },
  {
    id: 'chi-hang-cung-dinh',
    name: 'Chị Hằng Nga Tiên Cảnh',
    category: 'character',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Dải lụa tiên nữ bồng bềnh -->
      <path d="M 12 45 C 5 15, 45 10, 50 20 C 55 10, 95 15, 88 45 C 80 75, 20 75, 12 45 Z" fill="none" stroke="#ff85c0" stroke-width="3.5" opacity="0.85"/>
      <!-- Tóc mây bới trâm ngọc -->
      <circle cx="50" cy="24" r="12" fill="#141414"/>
      <ellipse cx="50" cy="15" rx="6" ry="8" fill="#141414"/>
      <circle cx="50" cy="8" r="3" fill="#ffd666"/>
      <!-- Khuôn mặt thanh tú -->
      <ellipse cx="50" cy="36" rx="13" ry="12" fill="#fff0f6"/>
      <circle cx="45" cy="34" r="1.5" fill="#141414"/>
      <circle cx="55" cy="34" r="1.5" fill="#141414"/>
      <circle cx="43" cy="38" r="2.5" fill="#ff7875" opacity="0.5"/>
      <circle cx="57" cy="38" r="2.5" fill="#ff7875" opacity="0.5"/>
      <!-- Váy dạ hội tiên nga hồng sen -->
      <path d="M 40 44 L 28 88 Q 50 96 72 88 L 60 44 Z" fill="#eb2f96" stroke="#ffadd2" stroke-width="1.5"/>
      <path d="M 44 44 L 38 88 Q 50 93 62 88 L 56 44 Z" fill="#ff85c0"/>
      <!-- Quạt lụa tiên cầm tay -->
      <circle cx="70" cy="55" r="7" fill="#fff1f0" stroke="#ffd666" stroke-width="1.5"/>
      <line x1="70" y1="62" x2="70" y2="70" stroke="#ffd666" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'chu-cuoi-cay-da',
    name: 'Chú Cuội Cây Đa',
    category: 'character',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Thân cây đa cổ thụ -->
      <path d="M 10 95 Q 18 45 35 35 Q 25 15 15 10" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
      <circle cx="20" cy="20" r="12" fill="#15803d" opacity="0.85"/>
      <!-- Chú cuội áo bà ba nâu -->
      <path d="M 42 54 L 34 90 L 76 90 L 68 54 Z" fill="#92400e" stroke="#78350f" stroke-width="1.5"/>
      <!-- Khuôn mặt cười sảng khoái -->
      <circle cx="55" cy="40" r="13" fill="#fed7aa"/>
      <ellipse cx="55" cy="29" rx="14" ry="7" fill="#5c2605"/>
      <path d="M 49 38 Q 52 35 55 38" stroke="#1c1917" stroke-width="2" fill="none"/>
      <path d="M 57 38 Q 60 35 63 38" stroke="#1c1917" stroke-width="2" fill="none"/>
      <path d="M 52 45 Q 56 50 60 45" stroke="#dc2626" stroke-width="2" fill="none"/>
      <!-- Quạt mo cau phe phẩy -->
      <ellipse cx="78" cy="62" rx="10" ry="14" fill="#fbbf24" stroke="#d97706" stroke-width="2" transform="rotate(25 78 62)"/>
      <line x1="72" y1="74" x2="66" y2="84" stroke="#78350f" stroke-width="3"/>
    </svg>`,
  },
  {
    id: 'mat-trang-ram-da-quang',
    name: 'Trăng Rằm Dạ Quang',
    category: 'moon',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="superMoon" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="40%" stop-color="#fef08a"/>
          <stop offset="80%" stop-color="#facc15"/>
          <stop offset="100%" stop-color="#eab308"/>
        </radialGradient>
      </defs>
      <!-- Hào quang trăng -->
      <circle cx="50" cy="50" r="44" fill="#fef08a" opacity="0.25"/>
      <circle cx="50" cy="50" r="40" fill="#fde047" opacity="0.4"/>
      <!-- Đĩa trăng tròn -->
      <circle cx="50" cy="50" r="35" fill="url(#superMoon)" stroke="#fef9c3" stroke-width="2"/>
      <!-- Hố trăng mộng mơ -->
      <circle cx="42" cy="40" r="6" fill="#fef08a" opacity="0.7"/>
      <circle cx="60" cy="45" r="8" fill="#fef08a" opacity="0.7"/>
      <circle cx="48" cy="62" r="9" fill="#fef08a" opacity="0.7"/>
      <!-- Sao lấp lánh cạnh trăng -->
      <polygon points="20,20 22,25 27,26 22,29 20,34 18,29 13,26 18,25" fill="#ffffff"/>
    </svg>`,
  },
  {
    id: 'may-ngu-sac-thu-phap',
    name: 'Mây Ngũ Sắc Á Đông',
    category: 'deco',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffd666"/>
          <stop offset="50%" stop-color="#ff85c0"/>
          <stop offset="100%" stop-color="#b37feb"/>
        </linearGradient>
      </defs>
      <!-- Dải mây gấm mềm mại cuộn tròn -->
      <path d="M 20 62 C 12 50, 30 36, 42 42 C 48 30, 68 28, 74 40 C 86 36, 94 52, 84 64 C 76 74, 28 74, 20 62 Z" fill="url(#cloudGrad)" stroke="#ffffff" stroke-width="2" opacity="0.9"/>
      <path d="M 32 58 Q 42 48 56 56 Q 66 48 76 60" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.8"/>
    </svg>`,
  },
  {
    id: 'ngoi-sao-hy-vong',
    name: 'Ngôi Sao Hy Vọng',
    category: 'deco',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,8 60,35 88,35 66,52 74,80 50,64 26,80 34,52 12,35 40,35" fill="#facc15" stroke="#d97706" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="46" r="6" fill="#fef08a"/>
    </svg>`,
  },
  {
    id: 'trai-tim-yeu-thuong',
    name: 'Trái Tim Đoàn Viên',
    category: 'deco',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heartGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ff7875"/>
          <stop offset="70%" stop-color="#f5222d"/>
          <stop offset="100%" stop-color="#a8071a"/>
        </radialGradient>
      </defs>
      <path d="M 50 28 C 38 10, 14 18, 18 46 C 22 66, 50 84, 50 84 C 50 84, 78 66, 82 46 C 86 18, 62 10, 50 28 Z" fill="url(#heartGrad)" stroke="#ffd666" stroke-width="2.5"/>
      <circle cx="34" cy="34" r="3.5" fill="#ffffff" opacity="0.7"/>
    </svg>`,
  },
];

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'night-sky',
    name: 'Trời Đêm Huyền Ảo',
    color: '#0a0e27',
    gradient: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 100%)',
    previewClass: 'bg-gradient-to-br from-[#0a0e27] to-[#1e1b4b]',
  },
  {
    id: 'moonlight-gold',
    name: 'Ánh Trăng Dịu',
    color: '#fef3c7',
    gradient: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)',
    previewClass: 'bg-gradient-to-br from-[#fef9c3] to-[#fde047]',
  },
  {
    id: 'purple-dream',
    name: 'Tím Mộng Mơ',
    color: '#2e1065',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)',
    previewClass: 'bg-gradient-to-br from-[#2e1065] to-[#4c1d95]',
  },
  {
    id: 'bg-soi-ben-nuoc',
    name: 'Bến Nước Tiên Sa',
    color: '#1e3a8a',
    imageUrl: '/backgrounds/bg_soi_ben_nuoc.jpg',
  },
  {
    id: 'bg-bach-hop',
    name: 'Bến Trăng Bách Hợp',
    color: '#0369a1',
    imageUrl: '/backgrounds/bg_bach_hop_hoi_an.jpg',
  },
  {
    id: 'bg-thanh-co',
    name: 'Thành Cổ Tiên Sa',
    color: '#0f172a',
    imageUrl: '/backgrounds/bg_thanh_co_tien_sa.jpg',
  },
];

export const COLOR_PALETTE = [
  '#facc15', // Moon Gold
  '#f43f5e', // Lantern Rose
  '#ef4444', // Festive Red
  '#3b82f6', // Scout Blue
  '#10b981', // Forest Green
  '#a855f7', // Mystic Purple
  '#fb923c', // Warm Orange
  '#ffffff', // Pure White
  '#0f172a', // Midnight Black
  '#fde047', // Soft Sunlight
  '#fda4af', // Blossom Pink
  '#67e8f9', // Sky Cyan
];

export const FRAMES: FrameItem[] = [
  {
    id: 'frame-hoi-an',
    name: 'Bến Nước Hội An & Lân Sư Rồng',
    imageUrl: '/frames/frame_hoi_an_dem_ram.png',
    previewUrl: '/frames/frame_hoi_an_dem_ram.png',
  },
  {
    id: 'frame-cau-nguyet',
    name: 'Cầu Nguyệt & Lân Vui Hội',
    imageUrl: '/frames/frame_cau_nguyet_lan_hoi.png',
    previewUrl: '/frames/frame_cau_nguyet_lan_hoi.png',
  },
  {
    id: 'frame-dai-lua',
    name: 'Dải Lụa Trăng & Đèn Ông Sao',
    imageUrl: '/frames/frame_dai_lua_trang_ram.png',
    previewUrl: '/frames/frame_dai_lua_trang_ram.png',
  },
  {
    id: 'frame-tho-ngoc-trang',
    name: 'Vòng Tròn Thỏ Ngọc & Trăng Cười',
    imageUrl: '/frames/frame_tho_ngoc_trang_cuoi.png',
    previewUrl: '/frames/frame_tho_ngoc_trang_cuoi.png',
  },
  {
    id: 'frame-vien-vang',
    name: 'Sói con cùng bánh Trung Thu',
    imageUrl: '/frames/frame_vien_vang_meo_con.png',
    previewUrl: '/frames/frame_vien_vang_meo_con.png',
  },
];


