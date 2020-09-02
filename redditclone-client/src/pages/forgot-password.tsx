import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              if an account with that username exists, we sent you an email
            </Box>
          ) : (
            <Form>
              <InputField name="email" placeholder="email" label="Email" />
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                variantColor="blue"
              >
                Forgot Password
              </Button>
              // forgot password mutation & pretty much authentication part done
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
