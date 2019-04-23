import { PreLoadedImageName } from './types';

// tslint:disable-next-line export-name
export function isSpriteImage(image: { img: PreLoadedImageName } | { sprite: string }): image is { sprite: string } {
  return (image as { sprite: string }).sprite !== undefined;
}
