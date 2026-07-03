

const validateRegister = (body) => {
  const errors = [];
  const { name, email, password } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  }
  if (name && name.trim().length > 50) {
    errors.push("Name cannot exceed 50 characters");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push("Please enter a valid email address");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return { isValid: errors.length === 0, errors };
};

const validateLogin = (body) => {
  const errors = [];
  const { email, password } = body;

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push("A valid email address is required");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required");
  }

  return { isValid: errors.length === 0, errors };
};


const validateRegisterAdmin = (body) => {
  const baseResult = validateRegister(body);
  const errors = [...baseResult.errors];

  if (!body.adminSecret || typeof body.adminSecret !== "string" || body.adminSecret.trim().length === 0) {
    errors.push("Admin secret key is required");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateRegister, validateLogin, validateRegisterAdmin };

