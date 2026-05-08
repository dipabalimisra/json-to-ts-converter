const interfaceRegistry = new Map<string, string>();

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^[0-9]/, "_$&");
}

function inferType(value: unknown, key: string, depth: number): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return inferArrayType(value, key, depth);
  switch (typeof value) {
    case "string":  return "string";
    case "number":  return "number";
    case "boolean": return "boolean";
    case "object":  return inferObjectType(value as Record<string, unknown>, key, depth);
    default:        return "unknown";
  }
}

function inferArrayType(arr: unknown[], key: string, depth: number): string {
  if (arr.length === 0) return "unknown[]";
  const elementTypes = arr.map((item) => inferType(item, key + "Item", depth));
  const uniqueTypes = [...new Set(elementTypes)];
  if (uniqueTypes.length > 1) return "unknown[]";
  return `${uniqueTypes[0]}[]`;
}

function inferObjectType(obj: Record<string, unknown>, key: string, depth: number): string {
  const interfaceName = capitalize(sanitizeName(key));
  const lines: string[] = [`interface ${interfaceName} {`];
  for (const [k, v] of Object.entries(obj)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
    const tsType = inferType(v, capitalize(sanitizeName(k)), depth + 1);
    lines.push(`  ${safeKey}: ${tsType};`);
  }
  lines.push("}");
  const body = lines.join("\n");
  interfaceRegistry.set(interfaceName, body);
  return interfaceName;
}

export function convertJsonToTs(
  jsonString: string,
  rootName: string = "RootObject"
): { output: string; error: string | null } {
  interfaceRegistry.clear();

  if (!jsonString.trim()) return { output: "", error: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { output: "", error: "Invalid JSON: could not parse input." };
  }

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { output: `type ${rootName} = unknown[];\n`, error: null };
    const elementTypes = parsed.map((item) => inferType(item, rootName + "Item", 0));
    const uniqueTypes = [...new Set(elementTypes)];
    const elementType = uniqueTypes.length === 1 ? uniqueTypes[0] : "unknown";
    interfaceRegistry.set("__ROOT__", `type ${rootName} = ${elementType}[];`);
  } else if (typeof parsed === "object" && parsed !== null) {
    inferObjectType(parsed as Record<string, unknown>, rootName, 0);
  } else {
    return { output: `type ${rootName} = ${inferType(parsed, rootName, 0)};\n`, error: null };
  }

  const allInterfaces: string[] = [];
  const seen = new Set<string>();

  for (const [name, body] of interfaceRegistry) {
    if (name === "__ROOT__") continue;
    if (!seen.has(name)) { seen.add(name); allInterfaces.push(body); }
  }

  if (interfaceRegistry.has("__ROOT__")) allInterfaces.push(interfaceRegistry.get("__ROOT__")!);

  const rootIndex = allInterfaces.findIndex((b) => b.startsWith(`interface ${rootName}`));
  if (rootIndex > 0) {
    const [root] = allInterfaces.splice(rootIndex, 1);
    allInterfaces.unshift(root);
  }

  return { output: allInterfaces.join("\n\n") + "\n", error: null };
}