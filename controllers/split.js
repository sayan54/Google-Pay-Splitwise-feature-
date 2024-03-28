const Split = require("../models/Split");

// splitByAmountController.js

exports.splitByAmount = async (req, res) => {
  try {
    const { paidBy, amount, members_list } = req.body;
    const totalMembers = members_list.length;
    const individualShare = amount / totalMembers;

    const splitResult = members_list.map((member) => ({
      memberId: member,
      share: individualShare,
    }));

    const createdSplit = await Split.create({
      splitResult,
    });

    res.json({ createdSplit });
  } catch (error) {
    res.json({ status: 500, message: error });
  }
};

// splitByPercentageController.js

exports.splitByPercentage = async (req, res) => {
  try {
    const { paidBy, amount, percentages, members_list } = req.body;
    let len = members_list.length;

    let totalPercentage = 0;
    for (let i = 0; i < len; i++) {
      totalPercentage += percentages[i];
    }

    if (totalPercentage > 100) {
      res.json({ status: 400, message: "Invalid Percentages" });
    }
    if (totalPercentage < 100) {
      let rem = 100 - totalPercentage;
      percentages[percentages.length - 1] += rem;
    }
    console.log(percentages);
    let finalList = [];
    for (let i = 0; i < len; i++) {
      let curr_member_amount = (percentages[i] / 100) * amount;
      finalList.push({ member: members_list[i], amount: curr_member_amount });
    }
    console.log(finalList);

    const createdSplit = await Split.create({
      splitResult: finalList,
    });

    res.json({ createdSplit });
  } catch (error) {
    res.json({ status: 500, message: error });
  }
};

// splitBySharesController.js

exports.splitByShares = async (req, res) => {
  try {
    const { paidBy, amount, shares, members_list } = req.body;
    const totalShares = shares.reduce((acc, val) => acc + val, 0);

    let len = members_list.length;

    let finalList = [];
    for (let i = 0; i < len; i++) {
      let curr_member_amount = (shares[i] / totalShares) * amount;
      finalList.push({ member: members_list[i], amount: curr_member_amount });
    }

    const createdSplit = await Split.create({
      splitResult: finalList,
    });

    res.json({ createdSplit });
  } catch (error) {
    res.json({ status: 500, message: error });
  }
};

// Function to distribute the amount among members
const distributeAmount = (transactionDetails) => {
  let totalAmount = 0;
  for (const member of transactionDetails) {
    totalAmount += parseFloat(member.amountPaid);
  }

  const average = totalAmount / transactionDetails.length;

  const senderList = [];
  const receiverList = [];

  for (const member of transactionDetails) {
    const paid = parseFloat(member.amountPaid);
    if (paid < average) {
      senderList.push({
        id: member.id,
        amountToBePaid: Math.abs(paid - average),
      });
    } else if (paid > average) {
      receiverList.push({
        id: member.id,
        amountToBeReceived: Math.abs(paid - average),
      });
    }
  }

  const finalList = [];

  let i = 0,
    j = 0;
  while (i < senderList.length && j < receiverList.length) {
    if (senderList[i].amountToBePaid > receiverList[j].amountToBeReceived) {
      finalList.push({
        sender: senderList[i].id,
        receiver: receiverList[j].id,
        amount: receiverList[j].amountToBeReceived.toFixed(2),
      });
      senderList[i].amountToBePaid -= receiverList[j].amountToBeReceived;
      receiverList[j].amountToBeReceived = 0;
      j++;
    } else if (
      senderList[i].amountToBePaid < receiverList[j].amountToBeReceived
    ) {
      finalList.push({
        sender: senderList[i].id,
        receiver: receiverList[j].id,
        amount: senderList[i].amountToBePaid.toFixed(2),
      });
      receiverList[j].amountToBeReceived -= senderList[i].amountToBePaid;
      senderList[i].amountToBePaid = 0;
      i++;
    } else {
      finalList.push({
        sender: senderList[i].id,
        receiver: receiverList[j].id,
        amount: senderList[i].amountToBePaid.toFixed(2),
      });
      senderList[i].amountToBePaid = 0;
      receiverList[j].amountToBeReceived = 0;
      i++;
      j++;
    }
  }

  return finalList;
};

exports.splitByEqualAmount = async (req, res) => {
  try {
    const { paidBy, transactionDetails } = req.body;
    const finalList = distributeAmount(transactionDetails);

    const createdSplit = await Split.create({
      splitResult: finalList,
    });

    res.json({ createdSplit });
  } catch (error) {
    res.json({ status: 500, message: error });
  }
};
