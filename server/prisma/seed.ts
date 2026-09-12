import { PrismaClient } from '@prisma/client';
import { ImageService } from '../src/services/imageService';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SAMPLE_SVGS = [
  // 1. Thỏ ngọc ôm mặt trăng
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#1e1b4b"/>
    <circle cx="300" cy="300" r="230" fill="#fef08a" opacity="0.9"/>
    <circle cx="300" cy="300" r="210" fill="#fef9c3"/>
    <!-- Thỏ trắng -->
    <ellipse cx="300" cy="380" rx="90" ry="110" fill="#ffffff"/>
    <ellipse cx="300" cy="270" rx="75" ry="70" fill="#ffffff"/>
    <!-- Tai thỏ -->
    <ellipse cx="260" cy="160" rx="25" ry="70" fill="#ffffff" transform="rotate(-10 260 160)"/>
    <ellipse cx="260" cy="160" rx="14" ry="50" fill="#fbcfe8" transform="rotate(-10 260 160)"/>
    <ellipse cx="340" cy="160" rx="25" ry="70" fill="#ffffff" transform="rotate(10 340 160)"/>
    <ellipse cx="340" cy="160" rx="14" ry="50" fill="#fbcfe8" transform="rotate(10 340 160)"/>
    <!-- Mắt & mũi -->
    <circle cx="275" cy="265" r="8" fill="#1e293b"/>
    <circle cx="325" cy="265" r="8" fill="#1e293b"/>
    <polygon points="300,285 292,275 308,275" fill="#f43f5e"/>
    <path d="M 285 295 Q 300 305 315 295" stroke="#1e293b" stroke-width="4" fill="none"/>
    <!-- Má hồng -->
    <circle cx="255" cy="285" r="14" fill="#fda4af" opacity="0.7"/>
    <circle cx="345" cy="285" r="14" fill="#fda4af" opacity="0.7"/>
    <!-- Sao nhỏ -->
    <circle cx="120" cy="120" r="10" fill="#fbbf24"/>
    <circle cx="480" cy="140" r="12" fill="#fbbf24"/>
  </svg>`,

  // 2. Đèn lồng ngôi sao đỏ vàng
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#0f172a"/>
    <circle cx="300" cy="300" r="240" fill="#b91c1c" opacity="0.3"/>
    <!-- Vòng tròn đèn lồng -->
    <circle cx="300" cy="300" r="190" stroke="#f59e0b" stroke-width="12" fill="none"/>
    <!-- Ngôi sao 5 cánh -->
    <polygon points="300,140 340,245 450,245 365,315 400,420 300,355 200,420 235,315 150,245 260,245" fill="#e11d48" stroke="#fde047" stroke-width="8"/>
    <!-- Tâm sao -->
    <circle cx="300" cy="290" r="40" fill="#facc15"/>
    <circle cx="300" cy="290" r="20" fill="#ffffff"/>
    <!-- Tua rua -->
    <path d="M 300 490 L 300 560" stroke="#f59e0b" stroke-width="8"/>
    <circle cx="300" cy="565" r="12" fill="#e11d48"/>
  </svg>`,

  // 3. Bánh trung thu hoa văn truyền thống
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#312e81"/>
    <!-- Bánh trung thu vàng ươm -->
    <circle cx="300" cy="300" r="210" fill="#d97706" stroke="#b45309" stroke-width="16"/>
    <circle cx="300" cy="300" r="170" fill="#f59e0b"/>
    <circle cx="300" cy="300" r="130" stroke="#92400e" stroke-width="8" fill="none" stroke-dasharray="15 10"/>
    <circle cx="300" cy="300" r="80" fill="#d97706"/>
    <text x="300" y="315" font-size="52" font-family="sans-serif" font-weight="bold" fill="#fef3c7" text-anchor="middle">TRUNG THU</text>
  </svg>`,

  // 4. Chú Sói Con Hướng Đạo dễ thương
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#042f2e"/>
    <circle cx="300" cy="300" r="230" fill="#14b8a6" opacity="0.2"/>
    <!-- Mặt sói xám ấm áp -->
    <polygon points="180,160 240,280 160,260" fill="#64748b"/>
    <polygon points="195,190 230,270 180,260" fill="#fda4af"/>
    <polygon points="420,160 360,280 440,260" fill="#64748b"/>
    <polygon points="405,190 370,270 420,260" fill="#fda4af"/>
    <ellipse cx="300" cy="330" rx="140" ry="120" fill="#94a3b8"/>
    <ellipse cx="300" cy="360" rx="90" ry="70" fill="#f8fafc"/>
    <!-- Mắt & mũi sói -->
    <circle cx="250" cy="310" r="14" fill="#0f172a"/>
    <circle cx="350" cy="310" r="14" fill="#0f172a"/>
    <circle cx="253" cy="306" r="4" fill="#ffffff"/>
    <circle cx="353" cy="306" r="4" fill="#ffffff"/>
    <polygon points="300,350 280,330 320,330" fill="#0f172a"/>
    <!-- Khăn quàng Hướng Đạo vàng viền đỏ -->
    <path d="M 200 420 L 300 520 L 400 420 Q 300 460 200 420" fill="#eab308" stroke="#dc2626" stroke-width="6"/>
  </svg>`,

  // 5. Đèn cá chép lướt sóng
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#1e1b4b"/>
    <circle cx="300" cy="300" r="230" fill="#ec4899" opacity="0.2"/>
    <!-- Thân cá chép -->
    <path d="M 160 300 C 220 200, 380 200, 440 300 C 380 400, 220 400, 160 300 Z" fill="#f97316"/>
    <!-- Đuôi cá -->
    <polygon points="160,300 80,220 110,300 80,380" fill="#ea580c"/>
    <!-- Vảy cá -->
    <circle cx="280" cy="280" r="30" stroke="#fef08a" stroke-width="6" fill="none"/>
    <circle cx="340" cy="280" r="30" stroke="#fef08a" stroke-width="6" fill="none"/>
    <circle cx="310" cy="320" r="30" stroke="#fef08a" stroke-width="6" fill="none"/>
    <!-- Mắt cá -->
    <circle cx="410" cy="280" r="12" fill="#ffffff"/>
    <circle cx="414" cy="280" r="6" fill="#0f172a"/>
  </svg>`,

  // 6. Trăng khuyết và mây dạ quang
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#0f172a"/>
    <!-- Vầng trăng vàng cong -->
    <path d="M 320 120 A 180 180 0 0 0 320 480 A 140 140 0 0 1 320 120 Z" fill="#fde047"/>
    <!-- Mây bay qua trăng -->
    <ellipse cx="220" cy="380" rx="90" ry="40" fill="#e0e7ff" opacity="0.85"/>
    <ellipse cx="280" cy="360" rx="70" ry="45" fill="#e0e7ff" opacity="0.85"/>
    <ellipse cx="170" cy="390" rx="60" ry="30" fill="#e0e7ff" opacity="0.85"/>
    <!-- Ngôi sao lung linh -->
    <polygon points="420,180 425,195 440,200 425,205 420,220 415,205 400,200 415,195" fill="#facc15"/>
    <polygon points="460,280 464,292 476,296 464,300 460,312 456,300 444,296 456,292" fill="#facc15"/>
  </svg>`,

  // 7. Hoa sen tỏa sáng
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#18181b"/>
    <circle cx="300" cy="300" r="220" fill="#f43f5e" opacity="0.15"/>
    <!-- Cánh sen chính -->
    <ellipse cx="300" cy="270" rx="45" ry="90" fill="#fb7185"/>
    <ellipse cx="250" cy="300" rx="45" ry="80" fill="#f43f5e" transform="rotate(-30 250 300)"/>
    <ellipse cx="350" cy="300" rx="45" ry="80" fill="#f43f5e" transform="rotate(30 350 300)"/>
    <ellipse cx="210" cy="340" rx="40" ry="70" fill="#e11d48" transform="rotate(-60 210 340)"/>
    <ellipse cx="390" cy="340" rx="40" ry="70" fill="#e11d48" transform="rotate(60 390 340)"/>
    <!-- Nhụy vàng -->
    <circle cx="300" cy="320" r="30" fill="#fde047"/>
    <line x1="300" y1="380" x2="300" y2="500" stroke="#10b981" stroke-width="12"/>
  </svg>`,

  // 8. Đèn kéo quân lung linh
  `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#2e1065"/>
    <!-- Mái đèn -->
    <polygon points="300,150 160,220 440,220" fill="#dc2626"/>
    <!-- Thân đèn phát sáng -->
    <rect x="200" y="220" width="200" height="240" rx="10" fill="#fef08a" stroke="#d97706" stroke-width="8"/>
    <!-- Bóng nhân vật bên trong -->
    <circle cx="300" cy="290" r="25" fill="#78350f"/>
    <ellipse cx="300" cy="360" rx="40" ry="50" fill="#78350f"/>
    <!-- Đế đèn -->
    <rect x="180" y="460" width="240" height="30" fill="#dc2626"/>
    <!-- Dây treo -->
    <line x1="300" y1="80" x2="300" y2="150" stroke="#facc15" stroke-width="6"/>
  </svg>`,
];

const SEED_CONTRIBUTIONS_DATA = [
  { name: 'Bé Minh Anh', msg: 'Chúc Bầy Tiên Sa một mùa trăng rằm ấm áp và rộn rã tiếng cười!' },
  { name: 'Sói con Dũng Cảm', msg: 'Em chúc các bạn Sói con luôn Vâng Lời và Thật Thà!' },
  { name: 'Chị Mai & Bé Bơ', msg: 'Trăng rằm sáng lung linh, chúc mọi nhà luôn bình an sum vầy.' },
  { name: 'Bác Trưởng Khanh', msg: 'Từng mảnh nhỏ chân thành sẽ làm nên một vầng trăng rực rỡ!' },
  { name: 'Lê Gia Huy (8 tuổi)', msg: 'Em vẽ chiếc lồng đèn cá chép để tặng các bạn vùng cao.' },
  { name: 'Bé Thảo My', msg: 'Mong vầng trăng của chúng mình luôn tròn xoe và ấm áp.' },
  { name: 'Anh Tuấn Nghĩa', msg: 'Chúc đêm hội trăng rằm ngập tràn tiếng trống lân rộn rã.' },
  { name: 'Gia đình Tuệ Lâm', msg: 'Một chút yêu thương gửi lên vầng trăng chung của tất cả chúng ta.' },
  { name: 'Akela Bầy Tiên Sa', msg: 'Góp sức nhỏ vì cộng đồng. Chúc các em luôn yêu đời và tự tin!' },
  { name: 'Bé Bắp 6 tuổi', msg: 'Em thích bánh nướng nhân đậu xanh và ngắm thỏ ngọc trên cung trăng.' },
  { name: 'Chú Cuội Nhí', msg: 'Trăng ơi sáng mãi nhé, cùng các bạn vui rước đèn!' },
  { name: 'Phương Vy (Lớp 4)', msg: 'Tự hào vì được góp một nét vẽ cho vầng trăng thật lớn này.' },
  { name: 'Đoàn sinh Hướng Đạo', msg: 'Sắp sẵn! Đoàn kết và sẻ chia trong mùa Tết đoàn viên 2026.' },
  { name: 'Bé Bảo Nam', msg: 'Em ước mơ trở thành phi hành gia bay lên mặt trăng xem thỏ ngọc.' },
  { name: 'Mẹ con Sam & Sóc', msg: 'Chúc cả nhà Trung Thu ấm cúng, tròn đầy như vầng trăng.' },
  { name: 'Kim Ngân', msg: 'Đèn ông sao năm cánh tươi màu, cùng em rước đèn dưới ánh trăng.' },
  { name: 'Hoàng Long', msg: 'Vầng trăng đêm nay thật đẹp vì có bàn tay của tất cả chúng mình.' },
  { name: 'Bé Cà Chua', msg: 'Mặt trăng ơi cười tươi nhé, em yêu mặt trăng nhiều!' },
  { name: 'Trưởng Loan', msg: 'Niềm vui nhân đôi khi chúng ta cùng nhau làm nên một điều kỳ diệu.' },
  { name: 'Bé Khánh An', msg: 'Em mong em nào cũng có lồng đèn thật đẹp để đi chơi Trung Thu.' },
  { name: 'Ngọc Hân (Lớp 3)', msg: 'Gửi ngàn lời chúc bình an đến các thầy cô và các bạn!' },
  { name: 'Thanh Phong', msg: 'Tiếng trống tùng dinh dinh rộn ràng khắp phố phường!' },
  { name: 'Bé Cherry', msg: 'Em chúc ông bà cha mẹ sống lâu trăm tuổi, luôn mạnh khỏe.' },
  { name: 'Hải Đăng', msg: 'Ánh trăng soi đường cho những ước mơ tuổi thơ bay thật xa.' },
];

async function main() {
  console.log('🌕 [Seed] Bắt đầu khởi tạo dữ liệu vầng trăng...');

  // Reset existing data
  await prisma.adminLog.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.moonPiece.deleteMany();
  await prisma.moon.deleteMany();

  // 1. Create Moon entity (13x13 grid ~ 100 pieces)
  const moon = await prisma.moon.create({
    data: {
      name: 'Vầng Trăng Trung Thu 2026',
      totalRows: 13,
      totalCols: 13,
      totalPieces: 169,
      activePieces: 101,
      completedPieces: 0,
      status: 'ACTIVE',
    },
  });

  console.log(`✨ [Seed] Đã tạo vầng trăng ID: ${moon.id}`);

  // 2. Generate 13x13 grid (169 total, 101 full squares inside moon circle)
  const center = 6.5;
  const radius = 6.5;

  const pieceDataList: Array<{
    moonId: string;
    row: number;
    col: number;
    pieceNumber: number;
    isWithinMoon: boolean;
    status: string;
  }> = [];

  let pieceNumber = 1;
  let validCount = 0;
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const d1 = Math.hypot(r - center, c - center);
      const d2 = Math.hypot(r - center, c + 1 - center);
      const d3 = Math.hypot(r + 1 - center, c - center);
      const d4 = Math.hypot(r + 1 - center, c + 1 - center);
      const isWithin = d1 <= radius && d2 <= radius && d3 <= radius && d4 <= radius;
      if (isWithin) validCount++;

      pieceDataList.push({
        moonId: moon.id,
        row: r,
        col: c,
        pieceNumber: pieceNumber++,
        isWithinMoon: isWithin,
        status: 'AVAILABLE',
      });
    }
  }

  // Update activePieces count to strictly full squares
  await prisma.moon.update({
    where: { id: moon.id },
    data: { activePieces: validCount },
  });

  // Insert all 169 pieces in batch
  await prisma.moonPiece.createMany({
    data: pieceDataList,
  });

  console.log(`✅ [Seed] Đã khởi tạo 13x13 lưới, trong đó có ${validCount} mảnh trăng nguyên vẹn (~100 pieces).`);

  // 3. Generate seed images using Sharp
  console.log('🎨 [Seed] Đang kết xuất ảnh mẫu và gắn vào các mảnh trăng...');
  const insidePieces = await prisma.moonPiece.findMany({
    where: { moonId: moon.id, isWithinMoon: true },
    take: 80,
  });

  // Pick ~24 diverse pieces to pre-complete
  // Distribute them evenly
  const step = Math.floor(insidePieces.length / SEED_CONTRIBUTIONS_DATA.length);
  let completedCount = 0;

  for (let i = 0; i < SEED_CONTRIBUTIONS_DATA.length; i++) {
    const piece = insidePieces[i * step];
    if (!piece) continue;

    const seedMeta = SEED_CONTRIBUTIONS_DATA[i];
    const svgContent = SAMPLE_SVGS[i % SAMPLE_SVGS.length];

    // Process image via Sharp
    const { imageUrl, thumbnailUrl } = await ImageService.saveArtworkFromSvg(svgContent);

    // Create contribution
    const contribution = await prisma.contribution.create({
      data: {
        pieceId: piece.id,
        sessionId: `seed-session-${i + 1}`,
        displayName: seedMeta.name,
        message: seedMeta.msg,
        imageUrl,
        thumbnailUrl,
        status: 'APPROVED',
      },
    });

    // Mark piece COMPLETED
    await prisma.moonPiece.update({
      where: { id: piece.id },
      data: {
        status: 'COMPLETED',
        contributionId: contribution.id,
      },
    });

    completedCount++;
  }

  // Update Moon completedPieces count
  await prisma.moon.update({
    where: { id: moon.id },
    data: {
      completedPieces: completedCount,
    },
  });

  console.log(
    `🎉 [Seed] Hoàn tất! Đã khởi tạo ${completedCount} mảnh tranh vẽ mẫu Trung Thu rực rỡ.`
  );
  console.log(
    `🌕 Vầng trăng hiện tại: ${completedCount}/400 mảnh (~${Math.round(
      (completedCount / 400) * 100
    )}%).`
  );
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
