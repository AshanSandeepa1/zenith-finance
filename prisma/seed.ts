import { PrismaClient, TransactionCategory, DebtStatus, Currency } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@zenithfinance.app";
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      hashedPassword,
      baseCurrency: Currency.USD,
    },
  });

  await prisma.financialAccount.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.sinkingFund.deleteMany({ where: { userId: user.id } });
  await prisma.debtTracker.deleteMany({ where: { userId: user.id } });

  const cashAccount = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: "Liquid Savings",
      type: "SAVINGS",
      balance: 220_000,
      currency: Currency.LKR,
    },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        financialAccountId: cashAccount.id,
        amount: 870,
        currency: Currency.USD,
        category: TransactionCategory.INCOME,
        description: "Monthly gross income",
        isRecurring: true,
        date: monthStart,
      },
      {
        userId: user.id,
        amount: 45_000,
        currency: Currency.LKR,
        category: TransactionCategory.GROCERIES_BILLS,
        description: "Groceries & utility bills",
        isRecurring: true,
        date: monthStart,
      },
      {
        userId: user.id,
        amount: 18_000,
        currency: Currency.LKR,
        category: TransactionCategory.CAMPUS_FEES,
        description: "Campus fees",
        isRecurring: true,
        date: monthStart,
      },
      {
        userId: user.id,
        amount: 22_000,
        currency: Currency.LKR,
        category: TransactionCategory.DISCRETIONARY,
        description: "Discretionary spending",
        isRecurring: true,
        date: monthStart,
      },
      {
        userId: user.id,
        amount: 15_000,
        currency: Currency.LKR,
        category: TransactionCategory.SINKING_FUND,
        description: "Sinking fund contributions",
        isRecurring: true,
        date: monthStart,
      },
    ],
  });

  await prisma.sinkingFund.createMany({
    data: [
      {
        userId: user.id,
        name: "Call of Duty: Modern Warfare 4",
        category: "Gaming/Tech",
        targetAmount: 12_500,
        currentAmount: 4_500,
        monthlyContribution: 7_500,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
      },
      {
        userId: user.id,
        name: "GTA 6",
        category: "Gaming/Tech",
        targetAmount: 15_000,
        currentAmount: 3_000,
        monthlyContribution: 7_500,
        targetDate: new Date(now.getFullYear() + 1, 4, 1),
      },
    ],
  });

  await prisma.debtTracker.createMany({
    data: [
      {
        userId: user.id,
        vendor: "Commercial Bank",
        itemName: "Combank iPhone 16 Pro Installment",
        totalAmount: 420_000,
        monthlyInstallment: 35_000,
        remainingMonths: 1,
        expiryDate: new Date(now.getFullYear(), now.getMonth(), 28),
        status: DebtStatus.EXPIRING_THIS_MONTH,
      },
      {
        userId: user.id,
        vendor: "Koko",
        itemName: "Xbox Series X + Peripherals",
        totalAmount: 185_000,
        monthlyInstallment: 15_400,
        remainingMonths: 3,
        expiryDate: new Date(now.getFullYear(), now.getMonth() + 3, 15),
        status: DebtStatus.ACTIVE,
      },
    ],
  });

  console.log(`Seed complete for ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
