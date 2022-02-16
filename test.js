/**
 * This file is here in case we get a false positive and need to test it.
 * Note for my future self, try to have your dependencies up to date :P
 */
const stopPhishing = require("stop-discord-phishing");
(async function () {
    const domain = "steamcommunity.com";
    const url = "https://steamcommunity.com/app/730";

    console.log(`Checking ${domain} ...`);
    console.log("\tPhishing List: ", await checkPhisingList(domain));
    console.log("\tSuspicious List: ", await checkPhisingList(domain));

    console.log(`Checking ${url} ...`);
    console.log("\tPhishing List: ", await stopPhishing.checkMessage(url));
    console.log("\tPhishing List + Suspicious List: ", await stopPhishing.checkMessage(url, true));
})();


async function checkPhisingList(domain) {
    const links = await stopPhishing.listDomains();
    return links.some(link => link === domain);
};

async function checkSuspiciousList(domain) {
    const links = await stopPhishing.listSuspiciousDomains();
    return links.some(link => link === domain);
};

async function checkSuspiciousList(domain) {
    const links = await stopPhishing.listSuspiciousDomains();
    return links.some(link => link === domain);
};


