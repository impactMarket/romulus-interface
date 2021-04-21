import {
  Alfajores,
  Baklava,
  Mainnet,
  useContractKit,
} from "@celo-tools/use-contractkit";
import { Button, Heading, Select, Text } from "@dracula/dracula-ui";
import styled from "@emotion/styled";
import copyToClipboard from "copy-to-clipboard";
import React from "react";

const truncateAddress = (addr: string) =>
  addr.slice(0, 6) + "..." + addr.slice(addr.length - 4);

const NETWORKS = [Mainnet, Alfajores, Baklava];

export const Header: React.FC = () => {
  const { address, network, updateNetwork, connect } = useContractKit();

  return (
    <Wrapper>
      <Heading>Romulus</Heading>
      <Account>
        <Text weight="bold">Network:</Text>
        <Select
          onChange={(e) => {
            const nextNetwork = NETWORKS.find(
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              (n) => n.name === (e.target as any).value
            );
            if (nextNetwork) {
              updateNetwork(nextNetwork);
            }
          }}
        >
          {NETWORKS.map((n) => (
            <option
              key={n.name}
              value={n.name}
              selected={n.name === network.name}
            >
              {n.name}
            </option>
          ))}
        </Select>
        {address ? (
          <AccountText
            onClick={() => {
              copyToClipboard(address);
            }}
          >
            {truncateAddress(address)}
          </AccountText>
        ) : (
          <Button
            onClick={() => {
              void connect();
            }}
          >
            Connect to Wallet
          </Button>
        )}
      </Account>
    </Wrapper>
  );
};

const AccountText = styled(Text)`
  cursor: pointer;
`;

const Account = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 8px;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
`;
