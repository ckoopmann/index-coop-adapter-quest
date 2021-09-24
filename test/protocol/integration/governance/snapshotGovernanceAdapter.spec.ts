import "module-alias/register";
import { Address } from "@utils/types";
import { Account } from "@utils/test/types";
import DeployHelper from "@utils/deploys";
import { ZERO_BYTES, ZERO } from "@utils/constants";
import { SnapshotGovernanceAdapter, DelegateRegistry } from "@utils/contracts";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
  getRandomAddress,
} from "@utils/test/index";

const expect = getWaffleExpect();

describe("SnapshotGovernanceAdapter", () => {
  let owner: Account;
  let deployer: DeployHelper;
  let snapshotGovernanceAdapter: SnapshotGovernanceAdapter;
  let delegateRegistry: DelegateRegistry;

  before(async () => {
    [owner] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    delegateRegistry = await deployer.external.deployDelegateRegistry();
    snapshotGovernanceAdapter = await deployer.adapters.deploySnapshotGovernanceAdapter(
      delegateRegistry.address,
    );
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("#constructor", async () => {
    async function subject(): Promise<any> {
      return deployer.adapters.deploySnapshotGovernanceAdapter(delegateRegistry.address);
    }

    it("should have the correct delegate registry address", async () => {
      const deployedSnapashotGovernanceAdapter = await subject();

      const actualTargetAddress = await deployedSnapashotGovernanceAdapter.delegateRegistry();
      expect(actualTargetAddress).to.eq(delegateRegistry.address);
    });
  });

  describe("#getDelegateCalldata", async () => {
    let subjectDelegatee: Address;

    beforeEach(async () => {
      subjectDelegatee = await getRandomAddress();
    });

    async function subject(): Promise<any> {
      return snapshotGovernanceAdapter.getDelegateCalldata(subjectDelegatee);
    }

    it("should return correct data for delegation", async () => {
      const [targetAddress, ethValue, callData] = await subject();

      const expectedCallData = delegateRegistry.interface.encodeFunctionData("setDelegate", [
        ZERO_BYTES,
        subjectDelegatee,
      ]);

      expect(targetAddress).to.eq(delegateRegistry.address);
      expect(ethValue).to.eq(ZERO);
      expect(callData).to.eq(expectedCallData);
    });
  });
});
