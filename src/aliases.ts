import type { ColorCode } from "./palette";

export type AliasCode = string & { __brand: "AliasCode" };

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
}
