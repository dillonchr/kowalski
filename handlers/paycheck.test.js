import { jest } from "@jest/globals";

// Mock the bankrupt pkg
jest.unstable_mockModule("../pkgs/bankrupt/bankrupt.js", () => ({
  formatAmount: jest.fn((amt) => `$${amt}`),
  formattedBalance: jest.fn((id) => `$100.00`),
  spend: jest.fn(),
  reset: jest.fn(),
  updateReset: jest.fn(),
  autoDebitGetList: jest.fn(),
  autoDebitListAll: jest.fn(),
  autoDebitAdd: jest.fn(),
  autoDebitRemove: jest.fn(),
}));

const bankrupt = await import("../pkgs/bankrupt/bankrupt.js");
const {
  handleBudget,
  handleBalance,
  handleUpdateReset,
  handleReset,
  handleListAutoDebits,
  handleAddAutoDebit,
  handleRemoveAutoDebit,
  handleDebit,
} = await import("./paycheck.js");

describe("paycheck handlers", () => {
  let mockMessage;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMessage = {
      channelId: "12345",
      reply: jest.fn(),
    };
  });

  describe("handleBudget", () => {
    it("should return true and do nothing else if action matches budget", () => {
      const result = handleBudget(mockMessage, "budget info");
      expect(result).toBe(true);
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });

    it("should return false if action does not match budget", () => {
      const result = handleBudget(mockMessage, "balance");
      expect(result).toBe(false);
    });
  });

  describe("handleBalance", () => {
    it("should reply with formatted balance and return true when matching balance", async () => {
      bankrupt.formattedBalance.mockReturnValue("$100.00");
      const result = await handleBalance(mockMessage, "balance");
      expect(result).toBe(true);
      expect(bankrupt.formattedBalance).toHaveBeenCalledWith("12345");
      expect(mockMessage.reply).toHaveBeenCalledWith("You have 💯"); // jazzedUpReply replaces $100.00 with 💯
    });

    it("should return false if action does not match balance", async () => {
      const result = await handleBalance(mockMessage, "budget");
      expect(result).toBe(false);
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe("handleUpdateReset", () => {
    it("should update reset amount and return true", async () => {
      bankrupt.updateReset.mockReturnValue([50, 100]);
      bankrupt.formatAmount.mockImplementation((amt) => `$${amt}`);
      const result = await handleUpdateReset(mockMessage, "set reset 100");
      expect(result).toBe(true);
      expect(bankrupt.updateReset).toHaveBeenCalledWith("12345", "100");
      expect(mockMessage.reply).toHaveBeenCalledWith("Changed reset amount to: $100 from: $50");
    });

    it("should handle initial update when old amount is null", async () => {
      bankrupt.updateReset.mockReturnValue([null, 100]);
      bankrupt.formatAmount.mockImplementation((amt) => `$${amt}`);
      const result = await handleUpdateReset(mockMessage, "set reset 100");
      expect(result).toBe(true);
      expect(mockMessage.reply).toHaveBeenCalledWith("Set reset amount to: $100");
    });

    it("should return false if action does not match updateReset pattern", async () => {
      const result = await handleUpdateReset(mockMessage, "reset");
      expect(result).toBe(false);
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe("handleReset", () => {
    it("should reset paycheck balance, show remaining balance, list autodebits and return true", async () => {
      bankrupt.formattedBalance.mockReturnValue("$50.00");
      bankrupt.reset.mockReturnValue([1000, [[100, "rent"], [50, "netflix"]]]);
      bankrupt.formatAmount.mockImplementation((amt) => `$${amt}`);
      const result = await handleReset(mockMessage, "reset");
      expect(result).toBe(true);
      expect(bankrupt.formattedBalance).toHaveBeenCalledWith("12345");
      expect(bankrupt.reset).toHaveBeenCalledWith("12345");
      expect(mockMessage.reply).toHaveBeenNthCalledWith(1, "Remaining balance before paycheck reset: $50.00");
      expect(mockMessage.reply).toHaveBeenNthCalledWith(2, "Paycheck balance reset to $1000\nAutodebits:\n\n0: `100` rent\n1: `50` netflix");
    });

    it("should return false if action does not match reset", async () => {
      const result = await handleReset(mockMessage, "balance");
      expect(result).toBe(false);
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe("handleListAutoDebits", () => {
    it("should list specific paycheck autodebits if matching paycheck number", async () => {
      bankrupt.autoDebitGetList.mockReturnValue([[100, "rent"]]);
      const result = await handleListAutoDebits(mockMessage, "list ad 1");
      expect(result).toBe(true);
      expect(bankrupt.autoDebitGetList).toHaveBeenCalledWith("12345", 1);
      expect(mockMessage.reply).toHaveBeenCalledWith("\n0: `100` rent");
    });

    it("should list all autodebits if no paycheck number provided", async () => {
      bankrupt.autoDebitListAll.mockReturnValue([
        [[100, "rent"]],
        [[50, "netflix"]]
      ]);
      const result = await handleListAutoDebits(mockMessage, "list ad");
      expect(result).toBe(true);
      expect(bankrupt.autoDebitListAll).toHaveBeenCalledWith("12345");
      expect(mockMessage.reply).toHaveBeenCalledWith("\n\nPaycheck 1:\n\n0: `100` rent\n\nPaycheck 2:\n\n0: `50` netflix");
    });

    it("should return false if action does not match listAutoDebits", async () => {
      const result = await handleListAutoDebits(mockMessage, "balance");
      expect(result).toBe(false);
      expect(mockMessage.reply).not.toHaveBeenCalled();
    });
  });

  describe("handleAddAutoDebit", () => {
    it("should add autodebit and return updated list", async () => {
      bankrupt.autoDebitAdd.mockReturnValue([[100, "rent"], [50, "netflix"]]);
      const result = await handleAddAutoDebit(mockMessage, "new ad 1 50.00, netflix");
      expect(result).toBe(true);
      expect(bankrupt.autoDebitAdd).toHaveBeenCalledWith("12345", 1, 50.00, "netflix");
      expect(mockMessage.reply).toHaveBeenCalledWith("Updated Autodebits for Paycheck 1:\n\n0: `100` rent\n1: `50` netflix");
    });

    it("should return false if action does not match addAutoDebit", async () => {
      const result = await handleAddAutoDebit(mockMessage, "balance");
      expect(result).toBe(false);
    });
  });

  describe("handleRemoveAutoDebit", () => {
    it("should remove autodebit and return updated list", async () => {
      bankrupt.autoDebitRemove.mockReturnValue([[100, "rent"]]);
      const result = await handleRemoveAutoDebit(mockMessage, "remove ad 1 1");
      expect(result).toBe(true);
      expect(bankrupt.autoDebitRemove).toHaveBeenCalledWith("12345", 1, 1);
      expect(mockMessage.reply).toHaveBeenCalledWith("Updated Autodebits for Paycheck 1:\n\n0: `100` rent");
    });

    it("should return false if action does not match removeAutoDebit", async () => {
      const result = await handleRemoveAutoDebit(mockMessage, "balance");
      expect(result).toBe(false);
    });
  });

  describe("handleDebit", () => {
    it("should record spend and reply with emote and remaining balance", async () => {
      bankrupt.spend.mockReturnValue(80);
      bankrupt.formatAmount.mockReturnValue("$80.00");
      const result = await handleDebit(mockMessage, "20,groceries");
      expect(result).toBe(true);
      expect(bankrupt.spend).toHaveBeenCalledWith("12345", "20");
      expect(mockMessage.reply).toHaveBeenCalledWith(expect.stringContaining("$80.00"));
    });

    it("should return true and validation warning if amount is NaN", async () => {
      const result = await handleDebit(mockMessage, "-,groceries");
      expect(result).toBe(true);
      expect(bankrupt.spend).not.toHaveBeenCalled();
      expect(mockMessage.reply).toHaveBeenCalledWith("Be reasonable! `-` isn\'t a proper amount.");
    });

    it("should return false if action does not match debit pattern", async () => {
      const result = await handleDebit(mockMessage, "balance");
      expect(result).toBe(false);
    });
  });
});
