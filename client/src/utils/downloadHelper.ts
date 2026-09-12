/**
 * Mobile-friendly and In-App Browser compatible image downloader & saver.
 * Supports iOS Safari, Android Chrome, and In-App browsers (Facebook Messenger, Zalo, Instagram).
 */

export async function saveOrShareImage(dataUrl: string, filename: string): Promise<boolean> {
  // 1. Check if Mobile Web Share API is available with file sharing support
  try {
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Mảnh trăng Tết Trung Thu 2026 • Bầy Tiên Sa 🌕',
        });
        return true;
      }
    }
  } catch (err: any) {
    // If user simply cancelled the share sheet, return
    if (err.name === 'AbortError') {
      return true;
    }
    console.warn('Web Share API error, falling back to download:', err);
  }

  // 2. Standard HTML5 Anchor Download
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
    return true;
  } catch (err) {
    console.warn('Anchor download failed, opening image window:', err);
  }

  // 3. Fallback: Open dataUrl in new window
  try {
    window.open(dataUrl, '_blank');
    return true;
  } catch (e) {
    console.error('All download methods failed:', e);
    return false;
  }
}
