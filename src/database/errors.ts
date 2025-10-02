export class ThemeNameConflictError extends Error {
  constructor(public readonly themeName: string) {
    super('Theme name already exists');
    this.name = 'ThemeNameConflictError';
  }
}
