import {
  CZExpressionFunction,
  DotReferenceExpression,
  Expression,
  ExpressionFunctionOrString,
  ExpressionOrString,
  Operation,
  Property,
  ReferenceExpression,
  TemplateParam,
  TemplateParamModifier,
} from "./czParser";

type CZPropertyValue = ExpressionFunctionOrString;

export function ref(value: TemplateStringsArray): CZReference;
export function ref(value: ExpressionFunctionOrString): CZReference;
export function ref(value: TemplateStringsArray | ExpressionFunctionOrString): CZReference {
  if (typeof value === "object" && "length" in value) {
    return new CZReference(value.toString());
  }
  return new CZReference(value);
}

export class CZReference {
  constructor(private readonly value: ExpressionFunctionOrString) {}

  resolve(objects: CZPropertySet[], key: string) {
    const val = this.value;
    if (typeof val === "string") {
      return objects.filter(i => i.get(key).string === val);
    }
    return objects.filter(i => {
      const resolved = i.resolveExpression(val.expression);
      return resolved !== undefined && resolved !== null && resolved !== false;
    });
  }
}

export class CZPropertyItem {
  key: string;

  excludeAll = false;
  include: CZPropertyValue[] = [];
  exclude: CZPropertyValue[] = [];

  constructor(key: string) {
    this.key = key;
  }

  reset() {
    this.excludeAll = true;
    this.include = [];
    this.exclude = [];
  }

  add(...values: CZPropertyValue[]) {
    this.include = [...this.include, ...values];
    if (!this.excludeAll) this.exclude = this.exclude.filter(v => !values.includes(v));
  }

  remove(...values: CZPropertyValue[]) {
    if (!this.excludeAll) this.exclude = [...this.exclude, ...values];
    this.include = this.include.filter(v => !values.includes(v));
  }

  get strings() {
    return this.include.map(i => {
      if (typeof i === "object" && i.type === "expression_function")
        throw new Error(`${this.key} has item of type expression_function, should be string`);
      return i as string;
    });
  }

  get requiredStrings() {
    if (this.strings.length === 0) throw new Error(`Required strings not found for ${this.key}`);

    return this.strings;
  }

  get string() {
    if (typeof this.include[0] === "object" && this.include[0].type === "expression_function")
      throw new Error(`${this.key} is of type expression_function, should be string`);
    return this.include[0] as string;
  }

  get requiredString() {
    if (this.string === undefined) throw new Error(`Required string not found for ${this.key}`);

    return this.string!;
  }

  get number() {
    return this.string === undefined ? undefined : Number(this.string);
  }

  get numbers() {
    return this.strings
      .map(string => (string === undefined ? undefined : Number(string)))
      .filter(i => i !== undefined) as number[];
  }

  get requiredNumber() {
    if (this.number === undefined) throw new Error(`Required number not found for ${this.key}`);

    return this.number!;
  }

  get requiredNumbers() {
    if (this.numbers.length === 0) throw new Error(`Required numbers not found for ${this.key}`);

    return this.numbers;
  }

  get references() {
    return this.include.map(i => new CZReference(i));
  }
}

export class CZPropertySet {
  private propertiesMap = new Map<string, CZPropertyItem>();

  get properties() {
    return [...this.propertiesMap.values()];
  }

  constructor(
    properties: Property[] | CZPropertyItem[],
    params?: TemplateParam[],
    paramsSet?: CZPropertySet,
    index?: number
  ) {
    if (properties[0] instanceof CZPropertyItem) {
      for (const property of properties) {
        this.propertiesMap.set(property.key, property as CZPropertyItem);
      }
      return;
    }

    this.params = params;
    this.paramsSet = paramsSet;
    if (index) this.index = index;

    for (const property of properties) {
      this.addProperty(property as Property);
    }
  }

  paramsSet?: CZPropertySet;
  params?: TemplateParam[];

  private readonly index: number = 0;

  private getReferenceProperty(
    ref: ReferenceExpression | DotReferenceExpression,
    params?: TemplateParam[],
    index?: number
  ) {
    if (ref.type === "dot_reference") {
      if (ref.value === "index") {
        const property = new CZPropertyItem("index");
        if (index !== undefined) property.add(index?.toString());
        return property;
      }
      return this.getProperty("." + ref.value);
    }
    if (params && !params.some(i => i.name === ref.value))
      throw new Error(`Param ${ref.value} not found`);
    return this.getProperty(ref.value);
  }

  private resolveNumericExpression(
    expression: Expression,
    params?: TemplateParam[],
    index?: number
  ): number | undefined {
    const resolved = this.resolveExpression(expression, params, index);
    if (resolved === undefined) return undefined;
    return Number(resolved);
  }

  private resolveArrayExpression(
    expression: Expression,
    params?: TemplateParam[],
    index?: number
  ): (string | boolean | undefined)[] | string | boolean | undefined {
    if (expression.type === "reference" || expression.type === "dot_reference") {
      const property = this.getReferenceProperty(expression, params, index);
      return property?.strings;
    }
    return this.resolveExpression(expression, params, index);
  }

  public resolveExpression(
    expression: Expression,
    params?: TemplateParam[],
    index?: number
  ): string | boolean | undefined {
    if (expression.type === "reference" || expression.type === "dot_reference") {
      const property = this.getReferenceProperty(expression, params, index);
      return property?.string;
    }
    if (expression.type === "number") {
      return expression.value;
    }
    if (expression.type === "string") {
      return expression.value;
    }
    if (expression.type === "calculation") {
      switch (expression.operator) {
        case "+":
          return (
            this.resolveNumericExpression(expression.left, params, index)! +
            this.resolveNumericExpression(expression.right, params, index)!
          ).toString();
        case "-":
          return (
            this.resolveNumericExpression(expression.left, params, index)! -
            this.resolveNumericExpression(expression.right, params, index)!
          ).toString();
        case "*":
          return (
            this.resolveNumericExpression(expression.left, params, index)! *
            this.resolveNumericExpression(expression.right, params, index)!
          ).toString();
        case "/":
          return (
            this.resolveNumericExpression(expression.left, params, index)! /
            this.resolveNumericExpression(expression.right, params, index)!
          ).toString();
      }
    }
    if (expression.type === "or") {
      return (
        this.resolveExpression(expression.left, params, index) ||
        this.resolveExpression(expression.right, params, index)
      );
    }
    if (expression.type === "and") {
      return (
        this.resolveExpression(expression.left, params, index) &&
        this.resolveExpression(expression.right, params, index)
      );
    }
    if (expression.type === "comparison") {
      const left = this.resolveArrayExpression(expression.left, params, index);
      if (typeof left === "object") {
        return left.includes(this.resolveExpression(expression.right, params, index));
      }
      return left === this.resolveExpression(expression.right, params, index);
    }

    // @ts-expect-error Throw in case of unknown expression type
    throw new Error(`Unsupported expression type ${expression.type}`);
  }

  private resolveValuesAndApply(
    key: string,
    values: (
      | ExpressionOrString[]
      | CZExpressionFunction
      | DotReferenceExpression
      | ReferenceExpression
    )[],
    inverse: boolean
  ) {
    for (const value of values) {
      if ("type" in value && value.type === "expression_function") {
        this.getProperty(key)[inverse ? "remove" : "add"](value);
        continue;
      }
      if (!("length" in value)) {
        const property = this.paramsSet?.getReferenceProperty(value, this.params ?? [], this.index);
        if (!property) {
          throw new Error(`Property ${value} not found`);
        }
        if (!inverse && property.excludeAll) this.getProperty(key).reset();
        this.getProperty(key)[inverse ? "add" : "remove"](...property.exclude);
        this.getProperty(key)[inverse ? "remove" : "add"](...property.include);
        return;
      }
      const resolvedValue = value
        .map(expression => {
          if (typeof expression === "string") {
            return expression;
          }
          return this.paramsSet?.resolveExpression(expression, this.params ?? [], this.index);
        })
        .join("");
      this.getProperty(key)[inverse ? "remove" : "add"](resolvedValue);
    }
  }

  private addProperty(property: Property) {
    if (property.key.startsWith("...")) {
      if ((property.value[0] as string[])[0] === "true") {
        const key = property.key.slice(3);
        for (const paramProperty of this.paramsSet?.properties ?? []) {
          if (paramProperty.key.startsWith(".")) continue;
          if (key !== "" && !paramProperty.key.startsWith(`${key}:`)) continue;
          if (this.params?.some(i => i.name === paramProperty.key)) continue;
          if (
            this.params?.some(
              i =>
                i.modifiers.includes(TemplateParamModifier.Rest) &&
                i.name !== key &&
                paramProperty.key.startsWith(`${i.name}:`)
            )
          )
            continue;
          const paramKey = key === "" ? paramProperty.key : paramProperty.key.slice(key.length + 1);
          if (paramProperty.excludeAll) this.getProperty(paramKey).reset();
          this.getProperty(paramKey).remove(...paramProperty.exclude);
          this.getProperty(paramKey).add(...paramProperty.include);
        }
      }
      return;
    }

    switch (property.operation) {
      case Operation.Equals:
        this.getProperty(property.key).reset();
        this.resolveValuesAndApply(property.key, property.value, false);
        break;
      case Operation.Plus:
        this.resolveValuesAndApply(property.key, property.value, false);
        break;
      case Operation.Minus:
        this.resolveValuesAndApply(property.key, property.value, true);
        break;
    }
  }

  private getProperty(key: string) {
    if (!this.propertiesMap.has(key)) {
      this.propertiesMap.set(key, new CZPropertyItem(key));
    }
    return this.propertiesMap.get(key)!;
  }

  get(id: string) {
    return this.getProperty(id);
  }
}
