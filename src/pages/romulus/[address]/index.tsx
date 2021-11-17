import { useContractKit } from "@celo-tools/use-contractkit";
import { BigNumber } from "ethers";
import { useRouter } from "next/dist/client/router";
import React, { useState } from "react";
import { Box, Button, Flex, Heading, Image, Text } from "theme-ui";

import { truncateAddress } from "../../../components/layouts/MainLayout/Header";
import { useDelegateModal } from "../../../components/pages/romulus/delegateModal";
import { ProposalCard } from "../../../components/pages/romulus/ProposalCard";
import { TopDelegates } from "../../../components/pages/romulus/TopDelegates";
import {
  PoofToken__factory,
  RomulusDelegate__factory,
} from "../../../generated";
import { useProposals } from "../../../hooks/romulus/useProposals";
import { useRomulus } from "../../../hooks/romulus/useRomulus";
import { useVotingTokens } from "../../../hooks/romulus/useVotingTokens";
import { useLatestBlockNumber } from "../../../hooks/useLatestBlockNumber";
import {
  useGetConnectedSigner,
  useProvider,
} from "../../../hooks/useProviderOrSigner";
import { BIG_ZERO } from "../../../util/constants";
import { humanFriendlyWei } from "../../../util/number";
import { governanceLookup } from "..";

const RomulusIndexPage: React.FC = () => {
  const router = useRouter();
  const [viewingTab, setViewingTab] = useState<"proposals" | "delegators">(
    "proposals"
  );
  const { address: romulusAddress } = router.query;
  const getConnectedSigner = useGetConnectedSigner();
  const provider = useProvider();
  const governanceName = romulusAddress
    ? governanceLookup[romulusAddress.toString()]?.name
    : "Unknown";
  const governanceIcon = romulusAddress
    ? governanceLookup[romulusAddress.toString()]?.icon
    : undefined;
  const { address } = useContractKit();
  const [proposals] = useProposals((romulusAddress as string) || "");
  const [
    [
      hasReleaseToken,
      tokenSymbol,
      releaseTokenSymbol,
      tokenDelegate,
      releaseTokenDelegate,
      quorumVotes,
      proposalThreshold,
    ],
    refetchRomulus,
  ] = useRomulus((romulusAddress as string) || "");
  const [latestBlockNumber] = useLatestBlockNumber();
  const [
    { balance, releaseBalance, votingPower, releaseVotingPower },
    refetchVotingTokens,
  ] = useVotingTokens(
    (romulusAddress as string) || "",
    address,
    latestBlockNumber
  );
  const totalVotingPower = votingPower.add(releaseVotingPower);

  const {
    delegateModal: tokenDelegateModal,
    openModal: openTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      if (!romulusAddress) {
        console.warn("No romulus address");
        return;
      }
      const signer = await getConnectedSigner();
      const romulus = RomulusDelegate__factory.connect(
        romulusAddress as string,
        provider
      );
      const token = PoofToken__factory.connect(await romulus.token(), signer);
      await token.delegate(delegate);
    } catch (e) {
      alert(e);
    } finally {
      refetchVotingTokens();
      refetchRomulus();
    }
  });

  const {
    delegateModal: releaseTokenDelegateModal,
    openModal: openReleaseTokenDelegateModal,
  } = useDelegateModal(async (delegate) => {
    try {
      if (!romulusAddress) {
        console.warn("No romulus address");
        return;
      }
      const signer = await getConnectedSigner();
      const romulus = RomulusDelegate__factory.connect(
        romulusAddress as string,
        provider
      );
      const token = PoofToken__factory.connect(
        await romulus.releaseToken(),
        signer
      );
      await token.delegate(delegate);
    } catch (e) {
      alert(e);
    } finally {
      refetchVotingTokens();
      refetchRomulus();
    }
  });

  return (
    <>
      <Flex>
        <Box style={{ flex: 1 }}>
          <Box
            mb={4}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid gray",
              borderRadius: "8px",
              padding: "15px",
            }}
          >
            {governanceIcon !== undefined && (
              <Image
                sx={{
                  height: "48px",
                  width: "48px",
                  mr: 2,
                  clipPath: "circle(24px at center)",
                }}
                src={governanceIcon}
              />
            )}
            <Heading as="h1">{governanceName}</Heading>
            <Button
              onClick={() => setViewingTab("proposals")}
              variant="outline"
              p={[2, 2]}
              style={{ width: "100%" }}
            >
              Proposals
            </Button>
            <Button
              onClick={() => setViewingTab("delegators")}
              variant="outline"
              p={[2, 2]}
              style={{ width: "100%" }}
            >
              Top Delegates
            </Button>
          </Box>
          <Box mb={4}>
            <Box style={{ textAlign: "center" }} mb="lg">
              <Heading as="h1">
                {humanFriendlyWei(totalVotingPower.toString())}
              </Heading>
              <Text>Voting Power</Text>
            </Box>
            <Box my="md">
              <Heading as="h2" mb={3}>
                User details
              </Heading>
            </Box>
            <Box
              sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}
            >
              <Box mb={2}>
                <Text>Token balance: </Text>
                <Text sx={{ fontWeight: "display" }}>
                  {humanFriendlyWei(balance.toString())} {tokenSymbol}
                </Text>{" "}
              </Box>
              <Flex sx={{ alignItems: "center" }}>
                <Text sx={{ maxWidth: "66%" }} mr={2}>
                  Token delegate:{" "}
                  <Text sx={{ fontWeight: "display" }}>
                    {truncateAddress(tokenDelegate)}
                  </Text>
                </Text>
                <Button
                  onClick={openTokenDelegateModal}
                  variant="outline"
                  p={[2, 2]}
                >
                  change
                </Button>
              </Flex>
            </Box>
            <Box my="md">
              <Heading as="h2" mb={3}>
                Governance details
              </Heading>
            </Box>
            <Box
              sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}
            >
              <Box mb={2}>
                <Text>Quorum: </Text>
                <Text sx={{ fontWeight: "display" }}>
                  {humanFriendlyWei(quorumVotes.toString())} {tokenSymbol}
                </Text>{" "}
              </Box>
              <Box mb={2}>
                <Text>Proposal threshold: </Text>
                <Text sx={{ fontWeight: "display" }}>
                  {humanFriendlyWei(proposalThreshold.toString())} {tokenSymbol}
                </Text>{" "}
              </Box>
            </Box>
            {hasReleaseToken && releaseBalance.gt(BIG_ZERO) && (
              <Box
                sx={{ border: "1px solid white", borderRadius: 8, p: 2, mb: 3 }}
              >
                <Box mb={2}>
                  <Text>Release token balance: </Text>
                  <Text sx={{ fontWeight: "display" }}>
                    {humanFriendlyWei(releaseBalance.toString())}{" "}
                    {releaseTokenSymbol}
                  </Text>
                </Box>
                <Flex sx={{ alignItems: "center" }}>
                  <Text sx={{ maxWidth: "66%" }} mr={2}>
                    Release token delegate:{" "}
                    <Text sx={{ fontWeight: "display" }}>
                      {truncateAddress(releaseTokenDelegate)}
                    </Text>
                  </Text>
                  <Button
                    onClick={openReleaseTokenDelegateModal}
                    variant="outline"
                    p={[2, 2]}
                  >
                    change
                  </Button>
                </Flex>
              </Box>
            )}
          </Box>
        </Box>
        <div style={{ width: 35 }} />

        <Box style={{ flex: 2 }} hidden={viewingTab !== "delegators"}>
          <Heading as="h2" mb={3}>
            Top delegates
          </Heading>
          <TopDelegates romulusAddress={romulusAddress as string} />
        </Box>

        <Box style={{ flex: 2 }} hidden={viewingTab !== "proposals"}>
          <Box
            mb={4}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Heading>Proposals</Heading>
            <Button
              onClick={() => {
                if (romulusAddress) {
                  router
                    .push(`/romulus/${romulusAddress.toString()}/create`)
                    .catch(console.error);
                }
              }}
              disabled={totalVotingPower.lt(BigNumber.from(proposalThreshold))}
            >
              Create Proposal
            </Button>
          </Box>
          <Box pb={6}>
            {proposals.length > 1 ? (
              proposals
                .slice(1)
                .reverse()
                .map((proposalEvent, idx) => (
                  <Box key={idx} mt={3}>
                    <ProposalCard proposalEvent={proposalEvent} />
                  </Box>
                ))
            ) : (
              <Box style={{ textAlign: "center" }}>
                <Text>There are currently no proposals.</Text>
              </Box>
            )}
          </Box>
        </Box>
      </Flex>
      {tokenDelegateModal}
      {releaseTokenDelegateModal}
    </>
  );
};

export default RomulusIndexPage;
