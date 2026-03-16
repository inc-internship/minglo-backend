export const loginConstraints = {
  min: 6,
  max: 30,
  regex: /^[0-9A-Za-z_-]+$/,
};

export const passwordConstraints = {
  min: 6,
  max: 20,
  regex: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_{|}~]+$/,
};

export const emailConfirmationConstraints = {
  min: 1,
  max: 255,
};
