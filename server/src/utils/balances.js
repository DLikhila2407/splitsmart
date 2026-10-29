// Positive balance means this member should receive money; negative means they owe money.
export function calculateBalances(members, expenses, settlements = []) {
  const balances = new Map(members.map(m => [String(m._id), 0]));
  for (const expense of expenses) {
    const payer = String(expense.paidBy?._id || expense.paidBy);
    balances.set(payer, (balances.get(payer) || 0) + Number(expense.amount));
    for (const split of expense.splits) {
      const id = String(split.user?._id || split.user);
      balances.set(id, (balances.get(id) || 0) - Number(split.amount));
    }
  }
  for (const settlement of settlements) {
    const from = String(settlement.from?._id || settlement.from);
    const to = String(settlement.to?._id || settlement.to);
    balances.set(from, (balances.get(from) || 0) + Number(settlement.amount));
    balances.set(to, (balances.get(to) || 0) - Number(settlement.amount));
  }
  return members.map(member => ({
    user: member,
    balance: Math.round((balances.get(String(member._id)) || 0) * 100) / 100
  }));
}

export function suggestSettlements(balanceRows) {
  const debtors = balanceRows.filter(x => x.balance < -0.009).map(x => ({ user: x.user, amount: -x.balance }));
  const creditors = balanceRows.filter(x => x.balance > 0.009).map(x => ({ user: x.user, amount: x.balance }));
  const result = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.round(Math.min(debtors[i].amount, creditors[j].amount) * 100) / 100;
    if (amount > 0) result.push({ from: debtors[i].user, to: creditors[j].user, amount });
    debtors[i].amount = Math.round((debtors[i].amount - amount) * 100) / 100;
    creditors[j].amount = Math.round((creditors[j].amount - amount) * 100) / 100;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }
  return result;
}
