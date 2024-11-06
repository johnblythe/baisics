'use server'

import { prisma } from '@/lib/prisma';
import { sendMessage } from '@/utils/chat';

type ImageUpload = {
  fileName: string;
  base64Data: string;
  sessionId: string;
};

// @NOTE: claude is high and mighty and requires a lot of coaxing to give a straight answer
const pictureReviewPrompt = "help me gauage my body fat %.";

export async function uploadImages(images: ImageUpload[]) {
  // @TODO: update to analyze a set of images
  try {
    const savedImages = await Promise.all(
      images.map(async (image) => {
        const savedImage = await prisma.userImages.create({
          data: {
            fileName: image.fileName,
            base64Data: image.base64Data,
            sessionId: image.sessionId,
          },
        });

        const base64String = image.base64Data.split(',')[1];
        const mediaType = image.base64Data.split(';')[0].split(':')[1];

        const messages = [{
          role: 'user',
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64String,
              },
            },
            { type: 'text', text: pictureReviewPrompt },
          ],
        }];

        const aiResponse = await sendMessage(messages);
        
        if (aiResponse.success) {
          // await prisma.userImages.update({
          //   where: { id: savedImage.id },
          //   data: { 
          //     aiDescription: aiResponse.data.content[0].text 
          //   }
          // });

          return {
            ...savedImage,
            aiDescription: aiResponse.data?.content[0].text
          };
        }

        return savedImage;
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

export async function deleteImage(imageId: string) {
  try {
    await prisma.userImages.delete({
      where: {
        id: imageId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}