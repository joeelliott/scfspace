export default class Font {
  // Define static properties without initialization
  private static DEFAULT_TINY_FONT_: Font;
  private static DEFAULT_SMALL_FONT_: Font;
  private static DEFAULT_REGULAR_FONT_: Font;
  private static DEFAULT_LARGE_FONT_: Font;
  private static DEFAULT_HUGE_FONT_: Font;

  private name_: string;
  private height_: number;
  private lineHeight_: number;

  constructor(name: string, height: number, lineHeight: number) {
    this.name_ = name;
    this.height_ = height;
    this.lineHeight_ = lineHeight;
  }

  public getHeight(): number {
    return this.height_;
  }

  public getLineHeight(): number {
    return this.lineHeight_;
  }

  public toString(): string {
    return `${this.height_}px/${this.lineHeight_}px ${this.name_}`;
  }

  // Static initializer for default fonts
  private static initializeDefaultFonts(): void {
    Font.DEFAULT_TINY_FONT_ = new Font('Subspace Tiny', 8, 10);
    Font.DEFAULT_SMALL_FONT_ = new Font('Subspace Small', 8, 10);
    Font.DEFAULT_REGULAR_FONT_ = new Font('Subspace Regular', 12, 15);
    Font.DEFAULT_LARGE_FONT_ = new Font('Subspace Large', 18, 20);
    Font.DEFAULT_HUGE_FONT_ = new Font('Subspace Huge', 24, 30);
  }

  public static playerFont(): Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static scoreboardFont(): Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static chatFont(): Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static notificationsFont(): Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }
}

// Call the static initializer
Font.initializeDefaultFonts();
