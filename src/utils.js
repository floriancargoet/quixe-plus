// Drop the compiler prefix
// FIXME: disambiguate the notion of name here and the name prop.
export function objectIDToName(id) {
  return id.replace(/^I[^_]*_/, "");
}

export function attributeIDToName(id) {
  return id.replace(/^p[0-9]+_/, "");
}

export function propertyIDToName(id) {
  return id.replace(/^p[0-9]+_/, "");
}
