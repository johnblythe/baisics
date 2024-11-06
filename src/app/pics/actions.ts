'use server'

import { prisma } from '@/lib/prisma';

type ImageUpload = {
  fileName: string;
  base64Data: string;
  sessionId: string;
};

export async function uploadImages(images: ImageUpload[]) {
  try {
    const savedImages = await Promise.all(
      images.map(async (image) => {
        return prisma.userImages.create({
          data: {
            fileName: image.fileName,
            base64Data: image.base64Data,
            sessionId: image.sessionId,
          },
        });
      })
    );

    return { success: true, images: savedImages };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

export async function getSessionImages(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is required' };
  }

  try {
    const images = await prisma.userImages.findMany({
      where: {
        sessionId: sessionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, images };
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return { success: false, error: 'Failed to fetch images' };
  }
}