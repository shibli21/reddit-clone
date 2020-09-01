import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }
  if (!options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Can't includes an @ ",
      },
    ];
  }
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "username can't be less than 2 word",
      },
    ];
  }
  if (options.password.length <= 6) {
    return [
      {
        field: "password",
        message: "password can't be less than 6 word",
      },
    ];
  }

  return null;
};
