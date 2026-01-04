const branches = {
    50 : "Metallurgical Engineering",
    40 : "Chemical Engineering"
}


export default function selectBranch(regNo) {
    const branchCode = (parseInt(regNo / 100000) % 10)*10 + (parseInt(regNo / 10000) % 10)*10;
    return branches[branchCode]
}

