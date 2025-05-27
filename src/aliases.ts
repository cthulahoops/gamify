import type { ColorCode } from "./palette";

type AliasCode = string;

export class Aliases {
  aliases: Map<AliasCode, (AliasCode | ColorCode)[]> = new Map();

  addAlias(alias: AliasCode, code: AliasCode | ColorCode) {
    if (!this.aliases.has(alias)) {
      this.aliases.set(alias, []);
    }
    this.aliases.get(alias)?.push(code);
  }

  getAliases() {
    return this.aliases;
  }

  expand(alias: AliasCode): ColorCode[] {
    const expanded: ColorCode[] = [];
    const codes = this.aliases.get(alias);
    if (codes) {
      for (const code of codes) {
        if (this.aliases.has(code as AliasCode)) {
          expanded.push(...this.expand(code as AliasCode));
        } else {
          expanded.push(code as ColorCode);
        }
      }
    }
    return expanded;
  }

  match(alias: AliasCode, code: ColorCode): boolean {
    const expanded = this.expand(alias);
    return expanded.includes(code);
  }

  toJSON() {
    const json: Record<string, string[]> = {};
    for (const [alias, codes] of this.aliases.entries()) {
      json[alias] = codes.map((code) => code.toString());
    }
    return json;
  }

  static fromJSON(json: Record<string, string[]>) {
    const aliases = new Aliases();
    for (const [alias, codes] of Object.entries(json)) {
      for (const code of codes) {
        aliases.addAlias(alias as AliasCode, code as ColorCode);
      }
    }
    return aliases;
  }
}
