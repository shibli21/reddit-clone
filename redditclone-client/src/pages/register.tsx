import React from "react";
import { Formik, Form, Field } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/core";

interface Props {}

const Register = (props: Props) => {
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={(values) => {
        console.log(values);
      }}
    >
      {({ values, handleChange }) => (
        <Form>
          <FormControl>
            <FormLabel htmlFor="username">User name</FormLabel>
            <Input
              value={values.username}
              onChange={handleChange}
              id="username"
              placeholder="username"
            />
            {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
          </FormControl>
        </Form>
      )}
    </Formik>
  );
};

export default Register;
