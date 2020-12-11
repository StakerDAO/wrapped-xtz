module.exports = {
    /**
     * Alice, Bob, Carol, Dave, Frank: generic participants
     * Chuck: malicious participant
     * Eve: eavesdropper (passive attacker)
     * Faythe: trusted advisor
     * Trent: trusted arbitrator
     * Walter: warden or governor
     * 
     * The keys below are taken from the ganache-cli with the seed 'alice'
     */
    alice: {
        pkh: "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb",
        sk: "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq",
        pk: "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn"
    },
    // baker
    bob: {
        pkh: "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6",
        sk: "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt",
        pk: "edpkurPsQ8eUApnLUJ9ZPDvu98E8VNj4KtJa1aZr16Cr5ow5VHKnz4"
    },
    // marketa in ganache-cli
    carol: {
        pkh: "tz1fhigafd7PQAh3JBvq7efZ9g6cgBkaimJX",
        sk: "edsk3W5G7sxGVZP7k44JVsiE8NmUeq3Y3hcZPcmpSW2peRcZ8Hyfk2",
        pk: "edpktiaGKkt8Yu6m4Gse2GhMdJCVdCtcrjtqATn3y3sf7xTBDj5g2a"
    },
    // mallory in ganache-cli
    chuck: {
        pkh: "tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L",
        sk: "edsk3W5Fz1yWK39sLY6vidmgkfmGAXh6V2JqUiri9W1pFeeYWbFbJL",
        pk: "edpkujwsG5JMrWVXQwmRMBoR9yJkokRbn6wy3monpQKBpnZTs1ogRR"
    },
    // carline in ganache-cli
    dave: {
        pkh: "tz1PQP815EzZRktgLaEhtDCR22kiRrcQEurw",
        sk: "edsk3RfpoEY1G8cH4J1HswJ2xU3ZQggSnXxvrPHgn3mHyYdYQs4g9Z",
        pk: "edpktxefxf3dtJEQLVb72MjV8yMiLh6DfCgNJQUV81rnsYJoZhbnK8"
    },
    eve: {
        pkh: "tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6",
        sk: "edsk3Sb16jcx9KrgMDsbZDmKnuN11v4AbTtPBgBSBTqYftd8Cq3i1e",
        pk: "edpku9qEgcyfNNDK6EpMvu5SqXDqWRLuxdMxdyH12ivTUuB1KXfGP4",
    },
    // eulalie in ganache-cli
    faythe: {
        pkh: "tz1fEqJ6rD3mfQjVat7G6XJP522V6V8wWTP2",
        sk: "edsk3SauUEVox4fdsP4YoAuqo2YFvam1kSADJvPWE745jQ1oFSJUTs",
        pk: "edpkvCvic2obeedM7oMJaeyapEafg4dSdYuWvkZigKbcvc64q6ZKM7"
    },
    // stella in ganache-cli
    frank: {
        pkh: "tz1i3eqdPNs9zjpavVBFcF8JarJUgEErfsUK",
        sk: "edsk3YkQyZaZgY9TWVPX4jZ4tBzyfHABZy9NRNu79pxYWY1zdP5E9J",
        pk: "edpkvRuciP6vZeoXn1KJtBuEEtaD2SpHW59wbbCGt1SEDBL94W7AUE"
    },
    trent: {
        pkh: "tz1TfRXkAxbQ2BFqKV2dF4kE17yZ5BmJqSAP",
        sk: "edsk3ZBkw7qZMkLEJd7Fyt8ffPVVBuGEZ9MS5U6TjgtYQzPQVj3hgC",
        pk: "edpkukjpYWLPEavoTXid8KqfYAY4J1rqtbWHWrzp22FgdRQqzaRkDD"
    },
    // tabbie in ganache-cli
    walter: {
        pkh: "tz1WP3xUvTP6vUWLRnexxnjNTYDiZ7QzVdxo",
        sk: "edsk3ZA4Uuirw4VXwGeamzLuQyn2juohC8eFYxD5fKobxUBX9HKWpu",
        pk: "edpkvXobE6tQLdsm3kPu3MYT2z2XrgVchfkK2WPB9tniNXdWSRyud3"
    },
};
