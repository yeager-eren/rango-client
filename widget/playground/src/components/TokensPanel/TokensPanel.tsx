import type { PropTypes, TokenType } from './TokensPanel.types';
import type { Tokens } from '@rango-dev/ui';
import type { Asset } from 'rango-sdk';

import { ChainsIcon, Checkbox, Divider, Typography } from '@rango-dev/ui';
import React, { useState } from 'react';

import { tokensAreEqual } from '../../utils/common';
import {
  HeaderContainer,
  SelectButton,
  SelectDeselectText,
} from '../MultiList/MultiList.styles';
import { StyledButton } from '../SingleList/SingleList.styles';

import { BlockchainChip } from './TokensPanel.Chip';
import { TokensList } from './TokensPanel.List';
import { BlockchainsList } from './TokensPanel.styles';

function getItemCountLabel(chain: string, list: TokenType[]) {
  const filteredList = list.filter((item) => item.blockchain === chain);
  const checkedCount = filteredList.filter((item) => item.checked).length;
  return filteredList.length === checkedCount ? 'All' : checkedCount;
}

export function TokensPanel(props: PropTypes) {
  const {
    list: listProps,
    selectedBlockchains: selectedBlockchainsProps,
    onChange,
    configTokens,
  } = props;

  const [selectedBlockchain, setSelectedBlockchain] = useState(
    selectedBlockchainsProps[0]
  );
  const [list, setList] = useState(() =>
    listProps.map((token) => {
      return {
        ...token,
        checked:
          !configTokens ||
          selectedBlockchainsProps.some(
            (blockchain) =>
              configTokens[blockchain] &&
              configTokens[blockchain].tokens.some((ct) =>
                tokensAreEqual(ct, token)
              )
          ),
      };
    })
  );

  const [excludeList, setExcludeList] = useState(configTokens);
  const [showSelectedTokens, setShowSelectedTokens] = useState(false);

  const handleChange = (token: TokenType) => {
    setList((prev) =>
      prev.map((item) => {
        if (tokensAreEqual(token, item)) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  const handleSelectDeselectInBlockchain = (selected: boolean) => {
    setList((prev) =>
      prev.map((item) => {
        if (item.blockchain === selectedBlockchain) {
          return { ...item, checked: selected };
        }
        return item;
      })
    );
  };

  const handleAllSelectDeselect = (selected: boolean) => () => {
    setList((prev) =>
      prev.map((item) => {
        return { ...item, checked: selected };
      })
    );
  };

  const notAllTokensSelected = list.some((item) => !item.checked);

  const handleConfirmAllList = () => {
    const allChecked = list.filter((item) => item.checked);
    const allSelected = listProps.length === allChecked.length;
    const allExcludeList = excludeList
      ? Object.keys(excludeList).filter((key) => excludeList[key].isExcluded)
      : {};
    let result: { [blockchain: string]: Tokens } | undefined =
      allSelected && !Object.keys(allExcludeList).length ? undefined : {};
    if (result) {
      for (const item of allChecked) {
        const isAllSelected =
          getItemCountLabel(item.blockchain, list) === 'All';
        if (!isAllSelected) {
          const { symbol, blockchain, address } = item;

          const token = {
            symbol,
            blockchain,
            address,
          };
          const tokens: Asset[] = result[blockchain]?.tokens
            ? [...result[blockchain].tokens, token]
            : [token];
          result = {
            ...result,
            [token.blockchain]: {
              isExcluded:
                excludeList && excludeList[token.blockchain]
                  ? excludeList[token.blockchain].isExcluded
                  : false,
              tokens,
            },
          };
        }
      }
    }

    onChange(result && !Object.keys(result).length ? undefined : result);
  };

  const onExcludedChange = () => {
    const list =
      !!excludeList && excludeList[selectedBlockchain]
        ? {
            ...excludeList,
            [selectedBlockchain]: {
              isExcluded: !excludeList[selectedBlockchain].isExcluded,
            },
          }
        : {
            [selectedBlockchain]: {
              isExcluded: true,
            },
          };
    setList((prev) =>
      prev.map((item) => {
        if (item.blockchain === selectedBlockchain) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
    setExcludeList(list);
  };

  return (
    <>
      <HeaderContainer>
        <div className="header">
          <ChainsIcon size={24} />
          <Divider direction="horizontal" size={4} />
          <Typography size="medium" variant="body">
            Supported Tokens
          </Typography>
        </div>
        <SelectButton onClick={handleAllSelectDeselect(notAllTokensSelected)}>
          <SelectDeselectText variant="label" size="medium" color="neutral900">
            {notAllTokensSelected ? 'Select all Tokens' : 'Deselect all Tokens'}
          </SelectDeselectText>
        </SelectButton>
      </HeaderContainer>
      <Divider size={4} />
      <BlockchainsList>
        {selectedBlockchainsProps.map((chain) => (
          <BlockchainChip
            key={chain}
            label={chain}
            itemCountLabel={getItemCountLabel(chain, list)}
            onClick={() => setSelectedBlockchain(chain)}
            isSelected={chain === selectedBlockchain}
          />
        ))}
      </BlockchainsList>
      <Divider size={20} />
      <Checkbox
        id="new-source"
        onCheckedChange={onExcludedChange}
        checked={
          excludeList && excludeList[selectedBlockchain]
            ? excludeList[selectedBlockchain].isExcluded
            : false
        }
        label={
          <Typography size="medium" variant="body">
            Exclude {selectedBlockchain} Tokens
          </Typography>
        }
      />
      <Divider size={20} />
      <TokensList
        list={list.filter((token) => token.blockchain === selectedBlockchain)}
        onChange={handleChange}
        setShowSelectedTokens={setShowSelectedTokens}
        showSelectedTokens={showSelectedTokens}
        isAllSelected={getItemCountLabel(selectedBlockchain, list) === 'All'}
        onChangeAll={handleSelectDeselectInBlockchain}
      />
      <Divider size={32} />
      <StyledButton
        type="primary"
        size="medium"
        variant="contained"
        disabled={!list.find((item) => item.checked)}
        onClick={handleConfirmAllList}>
        Confirm
      </StyledButton>
    </>
  );
}
