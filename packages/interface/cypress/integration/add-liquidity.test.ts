describe("Add Liquidity", () => {
    it("loads the two correct tokens", () => {
        cy.visit("/add/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85-0xc778417E063141139Fce010982780140Aa0cD5Ab");
        cy.get("#add-liquidity-input-tokena .token-symbol-container").should("contain.text", "MKR");
        cy.get("#add-liquidity-input-tokenb .token-symbol-container").should("contain.text", "DC");
    });

    it("does not crash if DC is duplicated", () => {
        cy.visit("/add/0xc778417E063141139Fce010982780140Aa0cD5Ab-0xc778417E063141139Fce010982780140Aa0cD5Ab");
        cy.get("#add-liquidity-input-tokena .token-symbol-container").should("contain.text", "DC");
        cy.get("#add-liquidity-input-tokenb .token-symbol-container").should("not.contain.text", "DC");
    });

    it("token not in storage is loaded", () => {
        cy.visit("/add/0xb290b2f9f8f108d03ff2af3ac5c8de6de31cdf6d-0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85");
        cy.get("#add-liquidity-input-tokena .token-symbol-container").should("contain.text", "SKL");
        cy.get("#add-liquidity-input-tokenb .token-symbol-container").should("contain.text", "MKR");
    });

    it("single token can be selected", () => {
        cy.visit("/add/0xb290b2f9f8f108d03ff2af3ac5c8de6de31cdf6d");
        cy.get("#add-liquidity-input-tokena .token-symbol-container").should("contain.text", "SKL");
        cy.visit("/add/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85");
        cy.get("#add-liquidity-input-tokena .token-symbol-container").should("contain.text", "MKR");
    });

    it("redirects /add/token-token to add/token/token", () => {
        cy.visit("/add/0xb290b2f9f8f108d03ff2af3ac5c8de6de31cdf6d-0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85");
        cy.url().should(
            "contain",
            "/add/0xb290b2f9f8f108d03ff2af3ac5c8de6de31cdf6d/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
        );
    });

    it("redirects /add/WWDOGE-token to /add/WWDOGE-address/token", () => {
        cy.visit("/add/0xc778417E063141139Fce010982780140Aa0cD5Ab-0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85");
        cy.url().should(
            "contain",
            "/add/0xc778417E063141139Fce010982780140Aa0cD5Ab/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85",
        );
    });

    it("redirects /add/token-WWDOGE to /add/token/WWDOGE-address", () => {
        cy.visit("/add/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85-0xc778417E063141139Fce010982780140Aa0cD5Ab");
        cy.url().should(
            "contain",
            "/add/0xF9bA5210F91D0474bd1e1DcDAeC4C58E359AaD85/0xc778417E063141139Fce010982780140Aa0cD5Ab",
        );
    });
});
