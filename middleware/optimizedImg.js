import sharp from 'sharp';
export const optimizedImg = async (file, width, height, quality) => {
  const newImg = await sharp(file.path)
    .resize(width, height)
    .webp({ quality: quality })
    .toFile(
      'public/uploads/optimized/optimized_' +
        file.filename.replace('.jpg', '.webp')
    );
  if (newImg) {
    return (
      'public/uploads/optimized/optimized_' +
      file.filename.replace('.jpg', '.webp')
    );
  } else {
    return null;
  }
};
