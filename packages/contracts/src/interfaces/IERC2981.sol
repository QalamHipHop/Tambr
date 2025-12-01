// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC2981 {
    /**
     * @dev Returns how much royalty is owed and to whom, given a sale price of `_salePrice` of the token specified by `_tokenId`
     * @param _tokenId The NFT asset queried for royalty information
     * @param _salePrice The sale price of the NFT asset specified by `_tokenId`
     * @return receiver Address that should receive the royalty payment
     * @return royaltyAmount The royalty payment amount for current sale specified by `_salePrice`
     */
    function royaltyInfo(
        uint256 _tokenId,
        uint256 _salePrice
    ) external view returns (address receiver, uint256 royaltyAmount);
}
