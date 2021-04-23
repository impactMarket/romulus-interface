import { Button, Card, Heading, Input, Paragraph } from "@dracula/dracula-ui";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther, getAddress, parseEther } from "ethers/lib/utils";
import { FormikErrors, useFormik } from "formik";
import React, { useEffect, useState } from "react";

import { TransactionHash } from "../../../components/common/blockchain/TransactionHash";
import { LinearReleaseToken__factory } from "../../../generated";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../hooks/useProviderOrSigner";
import { RELEASE_UBE_ADDRESS } from "..";

interface IForm {
  address: string;
  amount: string;
}

const UbeswapAdminPage: React.FC = () => {
  const provider = useProvider();
  const getConnectedSigner = useGetConnectedSigner();
  const [tx, setTx] = useState<ContractTransaction | null>(null);
  const {
    handleChange,
    handleSubmit,
    handleBlur,
    errors,
    touched,
    values,
  } = useFormik({
    initialValues: {
      address: "",
      amount: "",
    },
    validate: (values) => {
      const errors: FormikErrors<IForm> = {};

      try {
        getAddress(values.address);
      } catch (e) {
        errors.address = (e as Error).message;
      }

      try {
        parseEther(values.amount);
      } catch (e) {
        errors.amount = (e as Error).message;
      }

      return errors;
    },
    onSubmit: async (values) => {
      const signer = await getConnectedSigner();
      const releaseUBE = LinearReleaseToken__factory.connect(
        RELEASE_UBE_ADDRESS,
        signer
      );
      const parsedAmount = parseEther(values.amount);
      console.log(
        `Sending ${formatEther(parsedAmount)} rUBE to ${values.address}`
      );
      console.log(parsedAmount.toString());
      const tx = await releaseUBE.allocate([values.address], [parsedAmount]);
      setTx(tx);
      console.log("result", await tx.wait());
    },
  });
  const [currentBalance, setCurrentBalance] = useState<BigNumber | null>(null);

  useEffect(() => {
    void (async () => {
      setCurrentBalance(
        await LinearReleaseToken__factory.connect(
          RELEASE_UBE_ADDRESS,
          provider
        ).balanceOf(values.address)
      );
    })();
  }, [values.address, provider]);

  return (
    <form onSubmit={handleSubmit}>
      <Card p="md" variant="subtle" color="purple">
        <Heading pb="sm">Allocate Release UBE</Heading>
        {tx && <TransactionHash value={tx} />}
        <Input
          my="sm"
          id="address"
          name="address"
          placeholder="To address"
          value={values.address}
          color={touched.address && errors.address ? "red" : "white"}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {touched.address && errors.address && (
          <Paragraph color="red">{errors.address}</Paragraph>
        )}
        {currentBalance && (
          <Paragraph>
            Current balance: {formatEther(currentBalance)} rUBE ($
            {(parseFloat(formatEther(currentBalance)) * 0.1).toFixed(2)})
          </Paragraph>
        )}
        <Input
          my="sm"
          id="amount"
          name="amount"
          placeholder="Amount"
          value={values.amount}
          color={touched.amount && errors.amount ? "red" : "white"}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        {touched.amount && errors.amount && (
          <Paragraph color="red">{errors.amount}</Paragraph>
        )}
        {values.amount && (
          <Paragraph>
            Amount to send: {formatEther(parseEther(values.amount))} rUBE ($
            {(parseFloat(formatEther(parseEther(values.amount))) * 0.1).toFixed(
              2
            )}
            )
          </Paragraph>
        )}
        <Button my="sm" type="submit" color="animated">
          Submit
        </Button>
      </Card>
    </form>
  );
};

export default UbeswapAdminPage;