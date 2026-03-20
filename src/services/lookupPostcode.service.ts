export async function lookupPostcodeService(postcode: string) {
  const sanitised = postcode
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/O/g, "0"); // letter O → zero

  const response = await fetch(
    `https://api.postcodes.io/postcodes/${sanitised}`,
  );
  const data = await response.json();

  if (data.status !== 200 || !data.result) {
    return { valid: false };
  }

  const { admin_district, admin_ward } = data.result;

  const town = admin_ward
    .replace(
      /\s+(North|South|East|West|Central|Central South|Central North|Central East|Central West)$/i,
      "",
    )
    .trim();

  return {
    valid: true,
    town,
    district: admin_district,
    postcode: data.result.postcode,
  };
}
