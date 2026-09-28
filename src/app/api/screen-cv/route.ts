import { NextRequest, NextResponse } from 'next/server';
import { screenCVContent } from '@/lib/aiGenerator';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let extractedText = '';
    let apiKey = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      apiKey = (formData.get('apiKey') as string) || '';

      if (!file) {
        return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Attempt PDF parsing using pdf-parse
      try {
        const pdfModule: any = await import('pdf-parse');
        const pdfParse = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || '';
      } catch (parseErr: any) {
        console.warn('pdf-parse failed, extracting raw strings fallback:', parseErr);
        // Fallback: simple text buffer extraction
        extractedText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } else {
      const body = await req.json();
      extractedText = body.text || '';
      apiKey = body.apiKey || '';
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat mengekstrak teks dari berkas PDF' },
        { status: 400 }
      );
    }

    const screeningResult = await screenCVContent(extractedText, apiKey);

    return NextResponse.json({
      success: true,
      data: screeningResult,
      rawTextLength: extractedText.length,
    });
  } catch (error: any) {
    console.error('Error in /api/screen-cv:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat screening CV' },
      { status: 500 }
    );
  }
}
