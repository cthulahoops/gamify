import type { ColorCode } from "./palette";

type AliasCode = string;
type AliasItem = AliasCode | ColorCode;

export class Aliases {
  private aliases: Map<AliasCode, AliasItem[]> = new Map();
  private nextAlias = " " as AliasCode;

  addAlias(alias: AliasCode | undefined, code: AliasItem) {
    if (typeof alias === "undefined") {
      alias = this.nextAlias;
    }

    if (alias >= this.nextAlias) {
      this.nextAlias = String.fromCharCode(
        alias.charCodeAt(0) + 1,
      ) as AliasCode;
    }

    if (!this.aliases.has(alias)) {
      this.aliases.set(alias, []);
    }
    this.aliases.get(alias)?.push(code);
  }

  map<T>(
    callback: (key: AliasCode, value: AliasItem[], aliases: this) => T,
  ): T[] {
    const result: T[] = [];
    for (const [key, value] of this.aliases) {
      result.push(callback(key, value, this));
    }
    return result;
  }

  getAliases() {
    return this.aliases;
  }

  getAlias(alias: AliasCode): AliasItem[] {
    return this.aliases.get(alias) || [];
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

  isAlias(alias: AliasItem): alias is AliasCode {
    return this.aliases.has(alias);
  }

  match(alias: AliasCode, code: ColorCode): boolean {
    const expanded = this.expand(alias);
    return expanded.includes(code);
  }

  contains(alias: AliasCode, code: AliasItem): boolean {
    const codes = this.aliases.get(alias) || [];
    for (const item of codes) {
      if (code == item) {
        return true;
      }
      if (this.isAlias(item) && this.contains(item, code)) {
        return true;
      }
    }
    return false;
  }

  toJSON() {
    const json: Record<string, string[]> = {};
    for (const [alias, codes] of this.aliases.entries()) {
      json[alias] = codes.map((code) => code.toString());
    }
    return json;
  }

  removeFromAlias(alias: AliasCode, index: number): AliasItem | undefined {
    const codes = this.aliases.get(alias);
    if (codes && index >= 0 && index < codes.length) {
      const removedCode = codes[index];
      codes.splice(index, 1);
      return removedCode;
    }
    return undefined;
  }

  addToAlias(alias: AliasCode, code: AliasItem, index?: number) {
    if (this.isAlias(code) && this.contains(code, alias)) {
      console.log("Infinite loop detected: trying to add alias to itself");
      return;
    }
    if (!this.aliases.has(alias)) {
      this.aliases.set(alias, []);
    }
    const codes = this.aliases.get(alias)!;

    if (index !== undefined) {
      codes.splice(index, 0, code);
    } else {
      codes.push(code);
    }
  }

  clone() {
    const newAliases = new Aliases();
    for (const [alias, codes] of this.aliases.entries()) {
      newAliases.aliases.set(alias, [...codes]);
    }
    newAliases.nextAlias = this.nextAlias;
    return newAliases;
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
