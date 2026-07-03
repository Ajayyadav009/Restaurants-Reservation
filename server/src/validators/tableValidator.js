

const VALID_CAPACITIES = [2, 4, 6, 8];

const validateCreateTable = (body) => {
  const errors = [];
  const { tableNumber, capacity } = body;

  if (tableNumber === undefined || tableNumber === null) {
    errors.push("Table number is required");
  } else {
    const num = Number(tableNumber);
    if (!Number.isInteger(num) || num < 1) {
      errors.push("Table number must be a positive integer");
    }
  }

  if (capacity === undefined || capacity === null) {
    errors.push("Seating capacity is required");
  } else {
    const cap = Number(capacity);
    if (!VALID_CAPACITIES.includes(cap)) {
      errors.push(`Capacity must be one of: ${VALID_CAPACITIES.join(", ")}`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

const validateUpdateTable = (body) => {
  const errors = [];
  const { capacity, isActive } = body;

  if (capacity !== undefined) {
    const cap = Number(capacity);
    if (!VALID_CAPACITIES.includes(cap)) {
      errors.push(`Capacity must be one of: ${VALID_CAPACITIES.join(", ")}`);
    }
  }

  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateCreateTable, validateUpdateTable };
