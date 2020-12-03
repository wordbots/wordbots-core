import { PreLoadedImageName } from './types';

// eslint-disable-next-line  
export function isSpriteImage(image: { img: PreLoadedImageName } | { sprite: string }): image is { sprite: string } {
  return (image as { sprite: string }).sprite !== undefined;
}
