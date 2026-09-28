import { NextRequest, NextResponse } from 'next/server';
import { generateCoverLetterAndEmail, GenerationParams } from '@/lib/aiGenerator';

export async function POST(req: NextRequest) {
  try {
    const body: GenerationParams = await req.json();

    if (!body.companyName || !body.position) {
      return NextResponse.json(
        { success: false, error: 'Nama perusahaan dan posisi wajib diisi.' },
        { status: 400 }
      );
    }

    const result = await generateCoverLetterAndEmail(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-cover-letter:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menghasilkan surat lamaran.' },
      { status: 500 }
    );
  }
}
