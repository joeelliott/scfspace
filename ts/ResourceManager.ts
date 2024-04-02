import Image from 'graphics/Image';
import SpriteSheet from 'graphics/SpriteSheet';
import Sound from 'Sound';

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export default class ResourceManager {
  private images_: Map<string, Image>;
  private spriteSheets_: Map<string, SpriteSheet>;
  private sounds_: Map<string, Sound>;

  constructor() {
    this.images_ = new Map<string, Image>();
    this.spriteSheets_ = new Map<string, SpriteSheet>();
    this.sounds_ = new Map<string, Sound>();
  }

  public loadImage(name: string, url: string, xTiles: number, yTiles: number, loadCb: VoidFunction) {
    let image = new Image(xTiles, yTiles);
    image.load(url, () => {
      console.info(`Loaded image: "${name}"`);
      loadCb();
    });

    console.info(`Loading image: "${name}" using URL: ${url}`);
    this.images_.set(name, image);
  }

  public loadSpriteSheet(name: string, url: string, xTiles: number, yTiles: number, frames: number, period: number, loadCb: VoidFunction) {
    let spriteSheet = new SpriteSheet(xTiles, yTiles, frames, period);
    spriteSheet.load(url, () => {
      console.info(`Loaded sprite sheet: "${name}"`);
      loadCb();
    });

    console.info(`Loading sprite sheet: "${name}" using URL: ${url}`);
    this.spriteSheets_.set(name, spriteSheet);
  }

  public loadSound(name: string, url: string, loadCb: VoidFunction) {
    let sound = new Sound();
    sound.load(url, () => {
      console.info(`Loaded sound: "${name}"`);
      loadCb();
    });

    console.info(`Loading sound: "${name}" using URL: ${url}`);
    this.sounds_.set(name, sound);
  }

  public playSound(name: string) {
    let sound = this.sounds_.get(name);
    assert(sound !== undefined, `Unable to find sound: ${name}`);
    sound.play();
  }

  public getImage(name: string): Image {
    let image = this.images_.get(name);
    assert(image !== undefined, `Requesting missing image resource: ${name}`);
    return image;
  }

  public getSpriteSheet(name: string): SpriteSheet {
    let spriteSheet = this.spriteSheets_.get(name);
    assert(spriteSheet !== undefined, `Requesting missing sprite sheet: ${name}`);
    return spriteSheet;
  }
}
