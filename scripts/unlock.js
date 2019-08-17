acc0 = eth.accounts[0]
password = "password"

for (i = 0; i < 9; i++) {
  account = personal.newAccount(password)
  if (personal.unlockAccount(account, password, 0)) {
    console.log("Account ", account, "unlocked")
    // fund with `1 000 000` ETH each account
    eth.sendTransaction({from: acc0, to: account, value: "1000000000000000000000000"})
  } else {
    console.log("Error while unlocking ", account)
  }
}

// 0. contract owner/deployer
// 1. liquidity providers
// 2. machine
// 3. buyer
