export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validateMobile = (mobile: string) => {
  return String(mobile)
    .toLowerCase()
    .match(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/);
};

export const prepare_response = (
  message: string,
  data = {}
): Record<string, any> => {
  return { message, data };
};
